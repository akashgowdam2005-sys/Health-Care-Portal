import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function PatientDashboard() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('name, role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'PATIENT') {
    redirect('/login')
  }

  // Fetch upcoming appointments
  const { data: appointments } = await supabase
    .from('appointments')
    .select(`
      id,
      datetime,
      status,
      doctor:doctor_id (
        name
      )
    `)
    .eq('patient_id', user.id)
    .eq('status', 'SCHEDULED')
    .order('datetime', { ascending: true })
    .limit(3)

  // Fetch recent prescriptions
  const { data: prescriptions } = await supabase
    .from('prescriptions')
    .select(`
      id,
      date_issued,
      filled_status,
      medication_details,
      doctor:doctor_id (
        name
      )
    `)
    .eq('patient_id', user.id)
    .order('date_issued', { ascending: false })
    .limit(3)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome, {profile.name}
          </h1>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Sign Out
            </button>
          </form>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Upcoming Appointments */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Upcoming Appointments
                </h3>
                {appointments && appointments.length > 0 ? (
                  <div className="space-y-3">
                    {appointments.map((appointment: any) => (
                      <div key={appointment.id} className="border-l-4 border-blue-400 pl-4">
                        <p className="text-sm font-medium text-gray-900">
                          Dr. {appointment.doctor?.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(appointment.datetime).toLocaleDateString()} at{' '}
                          {new Date(appointment.datetime).toLocaleTimeString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No upcoming appointments</p>
                )}
                <div className="mt-4">
                  <Link
                    href="/patient/appointments"
                    className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
                  >
                    View all appointments →
                  </Link>
                </div>
              </div>
            </div>

            {/* Prescription History */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Recent Prescriptions
                </h3>
                {prescriptions && prescriptions.length > 0 ? (
                  <div className="space-y-3">
                    {prescriptions.map((prescription: any) => (
                      <div key={prescription.id} className="border-l-4 border-green-400 pl-4">
                        <p className="text-sm font-medium text-gray-900">
                          Prescribed by Dr. {prescription.doctor?.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(prescription.date_issued).toLocaleDateString()}
                        </p>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          prescription.filled_status 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {prescription.filled_status ? 'Filled' : 'Pending'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No prescriptions found</p>
                )}
                <div className="mt-4">
                  <Link
                    href="/patient/prescriptions"
                    className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
                  >
                    View prescription history →
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Link
                  href="/patient/appointments/book"
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Book Appointment
                </Link>
                <Link
                  href="/patient/prescriptions"
                  className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  View Prescriptions
                </Link>
                <Link
                  href="/patient/profile"
                  className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Update Profile
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}