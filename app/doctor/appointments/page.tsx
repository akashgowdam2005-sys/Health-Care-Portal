import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Header, Card, StatusBadge, EmptyState, Button } from '@/app/components/ui'

export default async function DoctorAppointments() {
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

  const { data: appointments } = await supabase
    .from('appointments')
    .select(`
      id,
      datetime,
      status,
      patient:patient_id (
        name,
        phone,
        patient_profiles (
          date_of_birth,
          address
        )
      )
    `)
    .eq('doctor_id', user.id)
    .order('datetime', { ascending: true })

  const today = new Date()
  const todayAppointments = appointments?.filter(apt => {
    const aptDate = new Date(apt.datetime)
    return aptDate.toDateString() === today.toDateString()
  })

  const upcomingAppointments = appointments?.filter(apt => {
    const aptDate = new Date(apt.datetime)
    return aptDate > today
  })

  const pastAppointments = appointments?.filter(apt => {
    const aptDate = new Date(apt.datetime)
    return aptDate < today
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        title="My Appointments" 
        userName={`Dr. ${profile.name}`} 
        userRole="Doctor" 
      />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0 space-y-8">
          
          {/* Today's Appointments */}
          <Card title={`Today's Appointments (${todayAppointments?.length || 0})`}>
            {todayAppointments && todayAppointments.length > 0 ? (
              <div className="space-y-4">
                {todayAppointments.map((appointment: any) => (
                  <div key={appointment.id} className="border border-blue-200 bg-blue-50 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="text-lg font-medium text-gray-900">
                          {appointment.patient?.name}
                        </h4>
                        <div className="mt-2 space-y-1 text-sm text-gray-600">
                          <p>📞 {appointment.patient?.phone || 'No phone'}</p>
                          <p>🕐 {new Date(appointment.datetime).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}</p>
                          {appointment.patient?.patient_profiles?.[0]?.date_of_birth && (
                            <p>🎂 Born: {new Date(appointment.patient.patient_profiles[0].date_of_birth).toLocaleDateString()}</p>\n                          )}\n                        </div>\n                      </div>\n                      <div className=\"flex flex-col items-end space-y-2\">\n                        <StatusBadge status={appointment.status} type=\"appointment\" />\n                        {appointment.status === 'SCHEDULED' && (\n                          <div className=\"flex space-x-2\">\n                            <Button \n                              href={`/doctor/appointments/${appointment.id}/complete`}\n                              variant=\"primary\"\n                              size=\"sm\"\n                            >\n                              Complete\n                            </Button>\n                            <Button \n                              href={`/doctor/prescriptions/new?appointment=${appointment.id}&patient=${appointment.patient_id}`}\n                              variant=\"secondary\"\n                              size=\"sm\"\n                            >\n                              Prescribe\n                            </Button>\n                          </div>\n                        )}\n                      </div>\n                    </div>\n                  </div>\n                ))}\n              </div>\n            ) : (\n              <EmptyState message=\"No appointments scheduled for today\" />\n            )}\n          </Card>\n\n          {/* Upcoming Appointments */}\n          <Card title={`Upcoming Appointments (${upcomingAppointments?.length || 0})`}>\n            {upcomingAppointments && upcomingAppointments.length > 0 ? (\n              <div className=\"space-y-4\">\n                {upcomingAppointments.slice(0, 10).map((appointment: any) => (\n                  <div key={appointment.id} className=\"border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow\">\n                    <div className=\"flex justify-between items-start\">\n                      <div className=\"flex-1\">\n                        <h4 className=\"text-lg font-medium text-gray-900\">\n                          {appointment.patient?.name}\n                        </h4>\n                        <div className=\"mt-2 flex items-center space-x-4 text-sm text-gray-500\">\n                          <span>\n                            📅 {new Date(appointment.datetime).toLocaleDateString()}\n                          </span>\n                          <span>\n                            🕐 {new Date(appointment.datetime).toLocaleTimeString([], { \n                              hour: '2-digit', \n                              minute: '2-digit' \n                            })}\n                          </span>\n                        </div>\n                      </div>\n                      <StatusBadge status={appointment.status} type=\"appointment\" />\n                    </div>\n                  </div>\n                ))}\n              </div>\n            ) : (\n              <EmptyState message=\"No upcoming appointments\" />\n            )}\n          </Card>\n\n          {/* Past Appointments */}\n          <Card title={`Past Appointments (${pastAppointments?.length || 0})`}>\n            {pastAppointments && pastAppointments.length > 0 ? (\n              <div className=\"space-y-4\">\n                {pastAppointments.slice(0, 5).map((appointment: any) => (\n                  <div key={appointment.id} className=\"border border-gray-200 rounded-lg p-4 opacity-75\">\n                    <div className=\"flex justify-between items-start\">\n                      <div className=\"flex-1\">\n                        <h4 className=\"text-lg font-medium text-gray-900\">\n                          {appointment.patient?.name}\n                        </h4>\n                        <div className=\"mt-2 flex items-center space-x-4 text-sm text-gray-500\">\n                          <span>\n                            📅 {new Date(appointment.datetime).toLocaleDateString()}\n                          </span>\n                          <span>\n                            🕐 {new Date(appointment.datetime).toLocaleTimeString([], { \n                              hour: '2-digit', \n                              minute: '2-digit' \n                            })}\n                          </span>\n                        </div>\n                      </div>\n                      <StatusBadge status={appointment.status} type=\"appointment\" />\n                    </div>\n                  </div>\n                ))}\n              </div>\n            ) : (\n              <EmptyState message=\"No past appointments\" />\n            )}\n          </Card>\n\n          <div className=\"mt-6\">\n            <Button href=\"/doctor\" variant=\"secondary\">\n              Back to Dashboard\n            </Button>\n          </div>\n        </div>\n      </main>\n    </div>\n  )\n}