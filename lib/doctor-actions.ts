'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateAppointmentStatus(appointmentId: string, status: 'in_progress' | 'completed' | 'cancelled') {
  const supabase = await createClient();
  
  const { error } = await (supabase
    .from('appointments') as any)
    .update({ status })
    .eq('id', appointmentId);

  if (error) throw error;
  
  revalidatePath('/doctor');
  return { success: true };
}

export async function createPrescription(data: {
  appointmentId: string;
  diagnosis: string;
  notes: string;
  medicines: Array<{
    medicine_name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
  }>;
}) {
  const supabase = await createClient();

  const { data: result, error } = await supabase.rpc('complete_appointment_with_prescription', {
    p_appointment_id: data.appointmentId,
    p_diagnosis: data.diagnosis,
    p_notes: data.notes,
    p_medicines: data.medicines,
  } as any);

  if (error) throw error;

  revalidatePath('/doctor');
  revalidatePath('/doctor/prescriptions');
  return { prescriptionId: result };
}

export async function updateDoctorSchedule(data: {
  availableDays: string[];
  availableStartTime: string;
  availableEndTime: string;
  isAcceptingPatients: boolean;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  const { error } = await (supabase
    .from('doctor_profiles') as any)
    .update({
      available_days: data.availableDays,
      available_start_time: data.availableStartTime,
      available_end_time: data.availableEndTime,
      is_accepting_patients: data.isAcceptingPatients,
    })
    .eq('id', user.id);

  if (error) throw error;

  revalidatePath('/doctor/settings');
  return { success: true };
}
