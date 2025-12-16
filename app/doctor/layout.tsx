import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Activity, Calendar, FileText, Settings, LogOut } from 'lucide-react';
import Link from 'next/link';
import { signOut } from '@/lib/auth-actions';
import { Button } from '@/components/ui/button';

export default async function DoctorLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile }: { data: any } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'doctor') redirect('/patient');

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-card border-r">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <Activity className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">VitalSync</span>
          </div>
          <nav className="space-y-2">
            <Link href="/doctor" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent">
              <Calendar className="h-5 w-5" />
              Queue
            </Link>
            <Link href="/doctor/prescriptions" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent">
              <FileText className="h-5 w-5" />
              Prescriptions
            </Link>
            <Link href="/doctor/settings" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent">
              <Settings className="h-5 w-5" />
              Settings
            </Link>
          </nav>
        </div>
        <div className="absolute bottom-0 w-64 p-6 border-t">
          <div className="mb-3">
            <p className="font-medium">{profile?.full_name}</p>
            <p className="text-sm text-muted-foreground">Doctor</p>
          </div>
          <form action={signOut}>
            <Button variant="outline" size="sm" className="w-full">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </form>
        </div>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
