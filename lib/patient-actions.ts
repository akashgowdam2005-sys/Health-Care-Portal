'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function bookAppointment(data: {
  doctorId: string;
  appointmentDate: string;
  appointmentTime: string;
  reason: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase.from('appointments').insert({
    patient_id: user.id,
    doctor_id: data.doctorId,
    appointment_date: data.appointmentDate,
    appointment_time: data.appointmentTime,
    reason: data.reason,
    status: 'pending',
  } as any);

  if (error) throw error;

  revalidatePath('/patient');
  return { success: true };
}

export async function cancelAppointment(appointmentId: string) {
  const supabase = await createClient();

  const { error } = await (supabase
    .from('appointments') as any)
    .update({ status: 'cancelled' })
    .eq('id', appointmentId);

  if (error) throw error;

  revalidatePath('/patient');
  revalidatePath('/patient/history');
  return { success: true };
}

export async function uploadLabReport(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  const file = formData.get('file') as File;
  if (!file) throw new Error('No file provided');

  const fileExt = file.name.split('.').pop();
  const fileName = `${user.id}/${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('lab-reports')
    .upload(fileName, file);

  if (uploadError) throw uploadError;

  const { error: dbError } = await supabase.from('lab_reports').insert({
    patient_id: user.id,
    file_name: file.name,
    file_path: fileName,
    file_size: file.size,
  } as any);

  if (dbError) throw dbError;

  revalidatePath('/patient/lab-reports');
  return { success: true };
}

export async function deleteLabReport(reportId: string, filePath: string) {
  const supabase = await createClient();

  await supabase.storage.from('lab-reports').remove([filePath]);

  const { error } = await supabase
    .from('lab_reports')
    .delete()
    .eq('id', reportId);

  if (error) throw error;

  revalidatePath('/patient/lab-reports');
  return { success: true };
}
