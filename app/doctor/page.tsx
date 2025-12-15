import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Header, Card, StatusBadge, Button } from '@/app/components/ui'

export default async function DoctorDashboard() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('name, role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'DOCTOR') {
    redirect('/login')
  }

  // Fetch today's appointments
  const today = new Date()
  const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString()
  const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString()

  const { data: todayAppointments } = await supabase
    .from('appointments')
    .select(`
      id,
      datetime,
      status,
      patient:patient_id (
        name
      )
    `)
    .eq('doctor_id', user.id)
    .gte('datetime', startOfDay)
    .lte('datetime', endOfDay)
    .eq('status', 'SCHEDULED')
    .order('datetime', { ascending: true })

  // Fetch upcoming appointments
  const { data: upcomingAppointments } = await supabase
    .from('appointments')
    .select(`
      id,
      datetime,
      status,
      patient:patient_id (
        name
      )
    `)
    .eq('doctor_id', user.id)
    .eq('status', 'SCHEDULED')
    .gt('datetime', endOfDay)
    .order('datetime', { ascending: true })
    .limit(5)

  // Fetch recent prescriptions
  const { data: recentPrescriptions } = await supabase
    .from('prescriptions')
    .select(`
      id,
      date_issued,
      filled_status,
      patient:patient_id (
        name
      )
    `)
    .eq('doctor_id', user.id)
    .order('date_issued', { ascending: false })
    .limit(5)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        title={`Welcome, Dr. ${profile.name}`} 
        userName={profile.name} 
        userRole="Doctor" 
      />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">{todayAppointments?.length || 0}</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Today's Appointments</dt>
                      <dd className="text-lg font-medium text-gray-900">Scheduled</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">{upcomingAppointments?.length || 0}</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Upcoming Appointments</dt>
                      <dd className="text-lg font-medium text-gray-900">This Week</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">{recentPrescriptions?.length || 0}</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Recent Prescriptions</dt>
                      <dd className="text-lg font-medium text-gray-900">Last 5</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Today's Appointments */}
            <Card title="Today's Schedule">
              {todayAppointments && todayAppointments.length > 0 ? (
                <div className="space-y-3">
                  {todayAppointments.map((appointment: any) => (
                    <div key={appointment.id} className="border-l-4 border-blue-400 pl-4 py-2">
                      <p className="text-sm font-medium text-gray-900">
                        {appointment.patient?.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(appointment.datetime).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No appointments scheduled for today</p>
              )}
              <div className="mt-4">
                <Link
                  href="/doctor/appointments"
                  className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
                >
                  View all appointments →
                </Link>
              </div>
            </Card>

            {/* Recent Prescriptions */}
            <Card title="Recent Prescriptions">
              {recentPrescriptions && recentPrescriptions.length > 0 ? (
                <div className="space-y-3">
                  {recentPrescriptions.map((prescription: any) => (
                    <div key={prescription.id} className="border-l-4 border-green-400 pl-4 py-2">
                      <p className="text-sm font-medium text-gray-900">
                        {prescription.patient?.name}
                      </p>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-500">
                          {new Date(prescription.date_issued).toLocaleDateString()}
                        </p>
                        <StatusBadge status={prescription.filled_status} type="prescription" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No recent prescriptions</p>
              )}
              <div className="mt-4">
                <Link
                  href="/doctor/prescriptions"
                  className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
                >
                  View all prescriptions →
                </Link>
              </div>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="mt-8">
            <Card title="Quick Actions">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <Button href="/doctor/appointments" variant="primary">
                  View Appointments
                </Button>
                <Button href="/doctor/patients" variant="secondary">
                  Patient Records
                </Button>
                <Button href="/doctor/prescriptions" variant="secondary">
                  Prescriptions
                </Button>
                <Button href="/doctor/profile" variant="secondary">
                  Update Profile
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}