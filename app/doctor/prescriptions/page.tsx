import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Header, Card, StatusBadge, EmptyState, Button } from '@/app/components/ui'

export default async function DoctorPrescriptions() {
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

  const { data: prescriptions } = await supabase
    .from('prescriptions')
    .select(`
      id,
      date_issued,
      filled_status,
      medication_details,
      patient:patient_id (
        name,
        phone
      ),
      appointment:appointment_id (
        datetime
      )
    `)
    .eq('doctor_id', user.id)
    .order('date_issued', { ascending: false })

  const activePrescriptions = prescriptions?.filter(p => !p.filled_status) || []
  const filledPrescriptions = prescriptions?.filter(p => p.filled_status) || []

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        title="My Prescriptions" 
        userName={`Dr. ${profile.name}`} 
        userRole="Doctor" 
      />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0 space-y-8">
          
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Prescription Management</h2>
            <Button href="/doctor/prescriptions/new" variant="primary">
              New Prescription
            </Button>
          </div>

          {/* Active Prescriptions */}
          <Card title={`Active Prescriptions (${activePrescriptions.length})`}>
            {activePrescriptions.length > 0 ? (
              <div className="space-y-6">
                {activePrescriptions.map((prescription: any) => (
                  <div key={prescription.id} className="border border-yellow-200 bg-yellow-50 rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h4 className="text-lg font-medium text-gray-900">
                          {prescription.patient?.name}
                        </h4>
                        <div className="mt-2 space-y-1 text-sm text-gray-600">
                          <p>📞 {prescription.patient?.phone || 'No phone'}</p>
                          <p>📅 Issued: {new Date(prescription.date_issued).toLocaleDateString()}</p>\n                          {prescription.appointment && (\n                            <p>🏥 Appointment: {new Date(prescription.appointment.datetime).toLocaleDateString()}</p>\n                          )}\n                        </div>\n                      </div>\n                      <div className=\"flex flex-col items-end space-y-2\">\n                        <StatusBadge status={prescription.filled_status} type=\"prescription\" />\n                        <Button \n                          href={`/doctor/prescriptions/${prescription.id}/edit`}\n                          variant=\"secondary\"\n                          size=\"sm\"\n                        >\n                          Edit\n                        </Button>\n                      </div>\n                    </div>\n                    \n                    <div className=\"bg-white rounded-md p-4 border\">\n                      <h5 className=\"font-medium text-gray-900 mb-2\">Medications:</h5>\n                      {Array.isArray(prescription.medication_details) ? (\n                        <ul className=\"space-y-2\">\n                          {prescription.medication_details.map((med: any, index: number) => (\n                            <li key={index} className=\"text-sm border-l-2 border-blue-200 pl-3\">\n                              <span className=\"font-medium\">{med.name}</span>\n                              {med.dosage && <span className=\"text-gray-600\"> - {med.dosage}</span>}\n                              {med.instructions && (\n                                <div className=\"text-gray-500 text-xs mt-1\">\n                                  Instructions: {med.instructions}\n                                </div>\n                              )}\n                            </li>\n                          ))}\n                        </ul>\n                      ) : (\n                        <p className=\"text-sm text-gray-600\">\n                          {JSON.stringify(prescription.medication_details)}\n                        </p>\n                      )}\n                    </div>\n                  </div>\n                ))}\n              </div>\n            ) : (\n              <EmptyState \n                message=\"No active prescriptions\" \n                actionText=\"Create New Prescription\"\n                actionHref=\"/doctor/prescriptions/new\"\n              />\n            )}\n          </Card>\n\n          {/* Filled Prescriptions */}\n          <Card title={`Filled Prescriptions (${filledPrescriptions.length})`}>\n            {filledPrescriptions.length > 0 ? (\n              <div className=\"space-y-6\">\n                {filledPrescriptions.slice(0, 10).map((prescription: any) => (\n                  <div key={prescription.id} className=\"border border-gray-200 rounded-lg p-6 opacity-75\">\n                    <div className=\"flex justify-between items-start mb-4\">\n                      <div className=\"flex-1\">\n                        <h4 className=\"text-lg font-medium text-gray-900\">\n                          {prescription.patient?.name}\n                        </h4>\n                        <div className=\"mt-2 space-y-1 text-sm text-gray-600\">\n                          <p>📅 Issued: {new Date(prescription.date_issued).toLocaleDateString()}</p>\n                          {prescription.appointment && (\n                            <p>🏥 Appointment: {new Date(prescription.appointment.datetime).toLocaleDateString()}</p>\n                          )}\n                        </div>\n                      </div>\n                      <StatusBadge status={prescription.filled_status} type=\"prescription\" />\n                    </div>\n                    \n                    <div className=\"bg-gray-50 rounded-md p-4\">\n                      <h5 className=\"font-medium text-gray-900 mb-2\">Medications:</h5>\n                      {Array.isArray(prescription.medication_details) ? (\n                        <ul className=\"space-y-1\">\n                          {prescription.medication_details.map((med: any, index: number) => (\n                            <li key={index} className=\"text-sm\">\n                              <span className=\"font-medium\">{med.name}</span>\n                              {med.dosage && <span className=\"text-gray-600\"> - {med.dosage}</span>}\n                            </li>\n                          ))}\n                        </ul>\n                      ) : (\n                        <p className=\"text-sm text-gray-600\">\n                          {JSON.stringify(prescription.medication_details)}\n                        </p>\n                      )}\n                    </div>\n                  </div>\n                ))}\n              </div>\n            ) : (\n              <EmptyState message=\"No filled prescriptions yet\" />\n            )}\n          </Card>\n\n          <div className=\"mt-6\">\n            <Button href=\"/doctor\" variant=\"secondary\">\n              Back to Dashboard\n            </Button>\n          </div>\n        </div>\n      </main>\n    </div>\n  )\n}