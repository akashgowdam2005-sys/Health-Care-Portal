import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Header, Card, Button, StatusBadge, EmptyState } from '@/app/components/ui'

export default async function PatientAppointments() {
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

  if (!profile || profile.role !== 'PATIENT') {
    redirect('/login')
  }

  const { data: appointments } = await supabase
    .from('appointments')
    .select(`
      id,
      datetime,
      status,
      doctor:doctor_id (
        name,
        doctor_profiles (
          specialization
        )
      )
    `)
    .eq('patient_id', user.id)
    .order('datetime', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        title="My Appointments" 
        userName={profile.name} 
        userRole="Patient" 
      />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <Button href="/patient/appointments/book" variant="primary">
              Book New Appointment
            </Button>
          </div>

          <Card title="All Appointments">
            {appointments && appointments.length > 0 ? (
              <div className="space-y-4">
                {appointments.map((appointment: any) => (
                  <div key={appointment.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="text-lg font-medium text-gray-900">
                          Dr. {appointment.doctor?.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {appointment.doctor?.doctor_profiles?.[0]?.specialization || 'General Practice'}
                        </p>
                        <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                          <span>
                            📅 {new Date(appointment.datetime).toLocaleDateString()}
                          </span>
                          <span>
                            🕐 {new Date(appointment.datetime).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <StatusBadge status={appointment.status} type="appointment" />
                        {appointment.status === 'SCHEDULED' && (
                          <Button 
                            href={`/patient/appointments/${appointment.id}/cancel`}
                            variant="danger"
                            size="sm"
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState 
                message="No appointments found" 
                actionText="Book Your First Appointment"
                actionHref="/patient/appointments/book"
              />
            )}
          </Card>

          <div className="mt-6">
            <Button href="/patient" variant="secondary">
              Back to Dashboard
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}