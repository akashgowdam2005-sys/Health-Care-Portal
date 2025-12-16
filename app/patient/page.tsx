import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, User, Plus } from 'lucide-react';
import { format } from 'date-fns';
import BookAppointmentDialog from '@/components/patient/book-appointment-dialog';
import CancelAppointmentButton from '@/components/patient/cancel-appointment-button';

export default async function PatientDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: appointments } = await supabase
    .from('appointments')
    .select(`
      *,
      doctor:profiles!appointments_doctor_id_fkey(full_name, phone),
      doctor_profile:doctor_profiles!appointments_doctor_id_fkey(specialization, consultation_fee)
    `)
    .eq('patient_id', user.id)
    .gte('appointment_date', new Date().toISOString().split('T')[0])
    .order('appointment_date', { ascending: true })
    .order('appointment_time', { ascending: true });

  const statusColors = {
    pending: 'outline',
    in_progress: 'warning',
    completed: 'success',
    cancelled: 'destructive',
  } as const;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">My Appointments</h1>
        <BookAppointmentDialog />
      </div>

      <div className="grid gap-4">
        {appointments?.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground mb-4">No upcoming appointments</p>
              <BookAppointmentDialog />
            </CardContent>
          </Card>
        ) : (
          appointments?.map((apt: any) => (
            <Card key={apt.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Dr. {apt.doctor?.full_name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {apt.doctor_profile?.specialization}
                      </p>
                    </div>
                  </div>
                  <Badge variant={statusColors[apt.status as keyof typeof statusColors]}>
                    {apt.status.replace('_', ' ')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{format(new Date(apt.appointment_date), 'EEEE, MMMM d, yyyy')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{apt.appointment_time}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Reason:</span>
                    <p className="text-sm text-muted-foreground">{apt.reason}</p>
                  </div>
                  {apt.status === 'pending' && (
                    <div className="pt-2">
                      <CancelAppointmentButton appointmentId={apt.id} />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
