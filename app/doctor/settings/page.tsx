import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import ScheduleForm from '@/components/doctor/schedule-form';

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: doctorProfile }: { data: any } = await supabase
    .from('doctor_profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  const { data: profile }: { data: any } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Your professional details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="text-sm font-medium">Name:</span>
              <p className="text-sm text-muted-foreground">{profile?.full_name}</p>
            </div>
            <div>
              <span className="text-sm font-medium">Email:</span>
              <p className="text-sm text-muted-foreground">{profile?.email}</p>
            </div>
            <div>
              <span className="text-sm font-medium">Specialization:</span>
              <p className="text-sm text-muted-foreground">{doctorProfile?.specialization}</p>
            </div>
            <div>
              <span className="text-sm font-medium">Qualification:</span>
              <p className="text-sm text-muted-foreground">{doctorProfile?.qualification}</p>
            </div>
            <div>
              <span className="text-sm font-medium">License Number:</span>
              <p className="text-sm text-muted-foreground">{doctorProfile?.license_number}</p>
            </div>
            <div>
              <span className="text-sm font-medium">Experience:</span>
              <p className="text-sm text-muted-foreground">{doctorProfile?.experience_years} years</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Schedule Management</CardTitle>
            <CardDescription>Manage your availability and consultation hours</CardDescription>
          </CardHeader>
          <CardContent>
            <ScheduleForm doctorProfile={doctorProfile} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
