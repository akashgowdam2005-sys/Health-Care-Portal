import { createClient } from '@/lib/supabase/server';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, User } from 'lucide-react';
import { format } from 'date-fns';
import PrescriptionDialog from '@/components/doctor/prescription-dialog';

export default async function DoctorDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const today = new Date().toISOString().split('T')[0];

  const { data: appointments } = await supabase
    .from('appointments')
    .select(`
      *,
      patient:profiles!appointments_patient_id_fkey(full_name, phone)
    `)
    .eq('doctor_id', user.id)
    .eq('appointment_date', today)
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
        <h1 className="text-3xl font-bold">Today&apos;s Queue</h1>
        <Badge variant="secondary">{format(new Date(), 'EEEE, MMMM d, yyyy')}</Badge>
      </div>

      <div className="grid gap-4">
        {appointments?.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">No appointments scheduled for today</p>
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
                      <CardTitle className="text-lg">{apt.patient?.full_name}</CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {apt.appointment_time}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={statusColors[apt.status as keyof typeof statusColors]}>
                      {apt.status.replace('_', ' ')}
                    </Badge>
                    {apt.status === 'pending' && <PrescriptionDialog appointment={apt} />}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium">Reason:</span>
                    <p className="text-sm text-muted-foreground">{apt.reason}</p>
                  </div>
                  {apt.notes && (
                    <div>
                      <span className="text-sm font-medium">Notes:</span>
                      <p className="text-sm text-muted-foreground">{apt.notes}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-sm font-medium">Contact:</span>
                    <p className="text-sm text-muted-foreground">{apt.patient?.phone || 'N/A'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
