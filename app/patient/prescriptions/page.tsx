import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Header, Card, StatusBadge, EmptyState, Button } from '@/app/components/ui'

export default async function PatientPrescriptions() {
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

  const { data: prescriptions } = await supabase
    .from('prescriptions')
    .select(`
      id,
      date_issued,
      filled_status,
      medication_details,
      doctor:doctor_id (
        name,
        doctor_profiles (
          specialization
        )
      )
    `)
    .eq('patient_id', user.id)
    .order('date_issued', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        title="My Prescriptions" 
        userName={profile.name} 
        userRole="Patient" 
      />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Card title="Prescription History">
            {prescriptions && prescriptions.length > 0 ? (
              <div className="space-y-6">
                {prescriptions.map((prescription: any) => (
                  <div key={prescription.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">
                          Prescription from Dr. {prescription.doctor?.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {prescription.doctor?.doctor_profiles?.[0]?.specialization || 'General Practice'}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Issued: {new Date(prescription.date_issued).toLocaleDateString()}
                        </p>
                      </div>
                      <StatusBadge status={prescription.filled_status} type="prescription" />
                    </div>
                    
                    <div className="bg-gray-50 rounded-md p-4">
                      <h5 className="font-medium text-gray-900 mb-2">Medications:</h5>
                      {Array.isArray(prescription.medication_details) ? (
                        <ul className="space-y-2">
                          {prescription.medication_details.map((med: any, index: number) => (
                            <li key={index} className="text-sm">
                              <span className="font-medium">{med.name}</span>
                              {med.dosage && <span className="text-gray-600"> - {med.dosage}</span>}
                              {med.instructions && (
                                <div className="text-gray-500 text-xs mt-1">
                                  Instructions: {med.instructions}
                                </div>
                              )}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-600">
                          {JSON.stringify(prescription.medication_details)}
                        </p>
                      )}
                    </div>
                    
                    {!prescription.filled_status && (
                      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                        <p className="text-sm text-yellow-800">
                          💊 This prescription is ready to be filled at any pharmacy.
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState 
                message="No prescriptions found" 
                actionText="Book an Appointment"
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