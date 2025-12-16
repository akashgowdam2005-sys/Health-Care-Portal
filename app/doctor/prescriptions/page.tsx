import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { FileText, User, Calendar } from 'lucide-react';

export default async function PrescriptionsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: prescriptions } = await supabase
    .from('prescriptions')
    .select(`
      *,
      patient:profiles!prescriptions_patient_id_fkey(full_name),
      appointment:appointments(appointment_date, appointment_time),
      medicines(*)
    `)
    .eq('doctor_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Prescription History</h1>

      <div className="grid gap-4">
        {prescriptions?.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">No prescriptions created yet</p>
            </CardContent>
          </Card>
        ) : (
          prescriptions?.map((rx: any) => (
            <Card key={rx.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {rx.patient?.full_name}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(rx.created_at), 'MMM d, yyyy')}
                      </div>
                    </div>
                  </div>
                  <Badge variant="success">Completed</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <span className="text-sm font-medium">Diagnosis:</span>
                  <p className="text-sm text-muted-foreground">{rx.diagnosis}</p>
                </div>

                {rx.notes && (
                  <div>
                    <span className="text-sm font-medium">Notes:</span>
                    <p className="text-sm text-muted-foreground">{rx.notes}</p>
                  </div>
                )}

                <div>
                  <span className="text-sm font-medium">Medicines:</span>
                  <div className="mt-2 space-y-2">
                    {rx.medicines?.map((med: any) => (
                      <div key={med.id} className="bg-muted/50 rounded-md p-3">
                        <p className="font-medium">{med.medicine_name}</p>
                        <div className="grid grid-cols-3 gap-2 mt-1 text-sm text-muted-foreground">
                          <span>Dosage: {med.dosage}</span>
                          <span>Frequency: {med.frequency}</span>
                          <span>Duration: {med.duration}</span>
                        </div>
                        {med.instructions && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Instructions: {med.instructions}
                          </p>
                        )}
                      </div>
                    ))}
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
