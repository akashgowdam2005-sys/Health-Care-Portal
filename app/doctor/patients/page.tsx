import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Header, Card, EmptyState, Button } from '@/app/components/ui'

export default async function DoctorPatients() {
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

  // Get unique patients who have had appointments with this doctor
  const { data: patientAppointments } = await supabase
    .from('appointments')
    .select(`
      patient_id,
      patient:patient_id (
        id,
        name,
        phone,
        patient_profiles (
          date_of_birth,
          address
        )
      )
    `)
    .eq('doctor_id', user.id)

  // Remove duplicates and get unique patients
  const uniquePatients = patientAppointments?.reduce((acc: any[], curr) => {
    if (!acc.find(p => p.id === curr.patient?.id)) {
      acc.push(curr.patient)
    }
    return acc
  }, []) || []

  // Get appointment counts for each patient
  const patientsWithStats = await Promise.all(
    uniquePatients.map(async (patient: any) => {
      const { count: appointmentCount } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('doctor_id', user.id)
        .eq('patient_id', patient.id)

      const { data: lastAppointment } = await supabase
        .from('appointments')
        .select('datetime, status')
        .eq('doctor_id', user.id)
        .eq('patient_id', patient.id)
        .order('datetime', { ascending: false })
        .limit(1)
        .single()

      const { count: prescriptionCount } = await supabase
        .from('prescriptions')
        .select('*', { count: 'exact', head: true })
        .eq('doctor_id', user.id)
        .eq('patient_id', patient.id)

      return {
        ...patient,
        appointmentCount: appointmentCount || 0,
        prescriptionCount: prescriptionCount || 0,
        lastAppointment
      }
    })
  )

  const calculateAge = (birthDate: string) => {
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        title="My Patients" 
        userName={`Dr. ${profile.name}`} 
        userRole="Doctor" 
      />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Card title={`Patient Records (${patientsWithStats.length} patients)`}>
            {patientsWithStats.length > 0 ? (
              <div className="space-y-6">
                {patientsWithStats.map((patient: any) => (
                  <div key={patient.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h4 className="text-xl font-medium text-gray-900 mb-2">
                          {patient.name}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                          <div className="space-y-1">
                            <p>📞 {patient.phone || 'No phone number'}</p>
                            {patient.patient_profiles?.[0]?.date_of_birth && (
                              <p>🎂 Age: {calculateAge(patient.patient_profiles[0].date_of_birth)} years</p>
                            )}
                            {patient.patient_profiles?.[0]?.address && (
                              <p>📍 {patient.patient_profiles[0].address}</p>
                            )}
                          </div>
                          <div className="space-y-1">
                            <p>📅 Appointments: {patient.appointmentCount}</p>
                            <p>💊 Prescriptions: {patient.prescriptionCount}</p>
                            {patient.lastAppointment && (
                              <p>🕐 Last visit: {new Date(patient.lastAppointment.datetime).toLocaleDateString()}</p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col space-y-2">
                        <Button 
                          href={`/doctor/patients/${patient.id}/history`}
                          variant="primary"
                          size="sm"
                        >
                          View History
                        </Button>
                        <Button 
                          href={`/doctor/prescriptions/new?patient=${patient.id}`}
                          variant="secondary"
                          size="sm"
                        >
                          New Prescription
                        </Button>
                      </div>
                    </div>
                    
                    {patient.lastAppointment && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-md">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Last appointment:</span> {' '}
                          {new Date(patient.lastAppointment.datetime).toLocaleDateString()} - {' '}
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            patient.lastAppointment.status === 'COMPLETED' 
                              ? 'bg-green-100 text-green-800' 
                              : patient.lastAppointment.status === 'SCHEDULED'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {patient.lastAppointment.status}
                          </span>
                        </p>
                      </div>
                    )}
                  </div>
                ))}\n              </div>\n            ) : (\n              <EmptyState \n                message=\"No patients found. Patients will appear here after they book appointments with you.\" \n              />\n            )}\n          </Card>\n\n          <div className=\"mt-6\">\n            <Button href=\"/doctor\" variant=\"secondary\">\n              Back to Dashboard\n            </Button>\n          </div>\n        </div>\n      </main>\n    </div>\n  )\n}