import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, FileText } from 'lucide-react';
import { format } from 'date-fns';
import DownloadPrescriptionButton from '@/components/patient/download-prescription-button';

export default async function HistoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: appointments } = await supabase
    .from('appointments')
    .select(`
      *,
      doctor:profiles!appointments_doctor_id_fkey(full_name),
      doctor_profile:doctor_profiles!appointments_doctor_id_fkey(specialization),
      prescription:prescriptions(
        id,
        diagnosis,
        notes,
        medicines(*)
      )
    `)
    .eq('patient_id', user.id)
    .order('appointment_date', { ascending: false })
    .order('appointment_time', { ascending: false });

  const statusColors = {
    pending: 'outline',
    in_progress: 'warning',
    completed: 'success',
    cancelled: 'destructive',
  } as const;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Medical History</h1>

      <div className="grid gap-4">
        {appointments?.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">No appointment history</p>
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
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{format(new Date(apt.appointment_date), 'MMMM d, yyyy')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{apt.appointment_time}</span>
                </div>
                <div>
                  <span className="text-sm font-medium">Reason:</span>
                  <p className="text-sm text-muted-foreground">{apt.reason}</p>
                </div>

                {apt.prescription && apt.prescription.length > 0 && (
                  <div className="border-t pt-3 mt-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">Prescription Available</span>
                      </div>
                      <DownloadPrescriptionButton
                        prescription={apt.prescription[0]}
                        appointment={apt}
                        doctor={apt.doctor}
                      />
                    </div>
                    <div className="bg-muted/50 rounded-md p-3 space-y-2">
                      <div>
                        <span className="text-sm font-medium">Diagnosis:</span>
                        <p className="text-sm text-muted-foreground">{apt.prescription[0].diagnosis}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Medicines:</span>
                        <ul className="text-sm text-muted-foreground list-disc list-inside">
                          {apt.prescription[0].medicines?.map((med: any) => (
                            <li key={med.id}>
                              {med.medicine_name} - {med.dosage}, {med.frequency}, {med.duration}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
