'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { UserRole } from '@/types/supabase';

export async function signUp(formData: {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
  phone?: string;
  specialization?: string;
  licenseNumber?: string;
  qualification?: string;
}) {
  try {
    const supabase = await createClient();

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
      },
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('User creation failed');

    // Wait a bit for auth user to be fully created
    await new Promise(resolve => setTimeout(resolve, 100));

    const { error: profileError } = await supabase.from('profiles').insert({
      id: authData.user.id,
      email: formData.email,
      full_name: formData.fullName,
      role: formData.role,
      phone: formData.phone || null,
    } as any);

    if (profileError) {
      console.error('Profile creation error:', profileError);
      throw new Error(`Profile creation failed: ${profileError.message}`);
    }

    if (formData.role === 'doctor') {
      const { error: doctorError } = await supabase.from('doctor_profiles').insert({
        id: authData.user.id,
        specialization: formData.specialization!,
        license_number: formData.licenseNumber!,
        qualification: formData.qualification!,
      } as any);
      if (doctorError) {
        console.error('Doctor profile error:', doctorError);
        throw new Error(`Doctor profile creation failed: ${doctorError.message}`);
      }
    } else {
      const { error: patientError } = await supabase.from('patient_profiles').insert({
        id: authData.user.id,
      } as any);
      if (patientError) {
        console.error('Patient profile error:', patientError);
        throw new Error(`Patient profile creation failed: ${patientError.message}`);
      }
    }

    revalidatePath('/', 'layout');
    redirect(formData.role === 'doctor' ? '/doctor' : '/patient');
  } catch (error: any) {
    console.error('Signup error:', error);
    throw error;
  }
}

export async function signIn(email: string, password: string) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  const { data: profile }: { data: any } = await supabase
    .from('profiles')
    .select('role')
    .eq('email', email)
    .single();

  revalidatePath('/', 'layout');
  redirect(profile?.role === 'doctor' ? '/doctor' : '/patient');
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/login');
}
