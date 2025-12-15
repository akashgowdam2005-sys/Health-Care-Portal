import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Header, Card, StatusBadge, Button } from '@/app/components/ui'

export default async function PharmacistDashboard() {
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

  if (!profile || profile.role !== 'PHARMACIST') {
    redirect('/login')
  }

  // Fetch pending prescriptions
  const { data: pendingPrescriptions } = await supabase
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
      doctor:doctor_id (
        name
      )
    `)
    .eq('filled_status', false)
    .order('date_issued', { ascending: true })
    .limit(10)

  // Fetch recently filled prescriptions
  const { data: recentlyFilled } = await supabase
    .from('prescriptions')
    .select(`
      id,
      date_issued,
      filled_status,
      medication_details,
      patient:patient_id (
        name
      ),
      doctor:doctor_id (
        name
      )
    `)
    .eq('filled_status', true)
    .order('date_issued', { ascending: false })
    .limit(5)

  // Get statistics
  const { count: totalPending } = await supabase
    .from('prescriptions')
    .select('*', { count: 'exact', head: true })
    .eq('filled_status', false)

  const { count: totalFilled } = await supabase
    .from('prescriptions')
    .select('*', { count: 'exact', head: true })
    .eq('filled_status', true)

  const today = new Date().toISOString().split('T')[0]
  const { count: todayFilled } = await supabase
    .from('prescriptions')
    .select('*', { count: 'exact', head: true })
    .eq('filled_status', true)
    .gte('date_issued', today)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        title={`Welcome, ${profile.name}`} 
        userName={profile.name} 
        userRole="Pharmacist" 
      />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">{totalPending || 0}</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Pending Prescriptions</dt>
                      <dd className="text-lg font-medium text-gray-900">To Fill</dd>
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
                      <span className="text-white text-sm font-bold">{todayFilled || 0}</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Filled Today</dt>
                      <dd className="text-lg font-medium text-gray-900">Completed</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">{totalFilled || 0}</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Filled</dt>
                      <dd className="text-lg font-medium text-gray-900">All Time</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pending Prescriptions */}
            <Card title="Pending Prescriptions">
              {pendingPrescriptions && pendingPrescriptions.length > 0 ? (
                <div className="space-y-4">
                  {pendingPrescriptions.map((prescription: any) => (
                    <div key={prescription.id} className="border border-yellow-200 bg-yellow-50 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900">
                            {prescription.patient?.name}
                          </h4>
                          <p className="text-xs text-gray-600">
                            Dr. {prescription.doctor?.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(prescription.date_issued).toLocaleDateString()}
                          </p>
                        </div>
                        <StatusBadge status={prescription.filled_status} type="prescription" />
                      </div>
                      <div className="text-xs text-gray-700">
                        {Array.isArray(prescription.medication_details) ? (
                          prescription.medication_details.slice(0, 2).map((med: any, index: number) => (
                            <div key={index}>
                              {med.name} {med.dosage && `- ${med.dosage}`}
                            </div>
                          ))
                        ) : (
                          <div>{JSON.stringify(prescription.medication_details).substring(0, 50)}...</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No pending prescriptions</p>
              )}
              <div className="mt-4">
                <Link
                  href="/pharmacist/prescriptions"
                  className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
                >
                  View all prescriptions →
                </Link>
              </div>
            </Card>

            {/* Recently Filled */}
            <Card title="Recently Filled">
              {recentlyFilled && recentlyFilled.length > 0 ? (
                <div className="space-y-4">
                  {recentlyFilled.map((prescription: any) => (
                    <div key={prescription.id} className="border border-green-200 bg-green-50 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900">
                            {prescription.patient?.name}
                          </h4>
                          <p className="text-xs text-gray-600">
                            Dr. {prescription.doctor?.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(prescription.date_issued).toLocaleDateString()}
                          </p>
                        </div>
                        <StatusBadge status={prescription.filled_status} type="prescription" />
                      </div>
                      <div className="text-xs text-gray-700">
                        {Array.isArray(prescription.medication_details) ? (
                          prescription.medication_details.slice(0, 2).map((med: any, index: number) => (
                            <div key={index}>
                              {med.name} {med.dosage && `- ${med.dosage}`}
                            </div>
                          ))
                        ) : (
                          <div>{JSON.stringify(prescription.medication_details).substring(0, 50)}...</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No recently filled prescriptions</p>
              )}
              <div className="mt-4">
                <Link
                  href="/pharmacist/prescriptions?filter=filled"
                  className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
                >
                  View filled prescriptions →
                </Link>
              </div>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="mt-8">
            <Card title="Quick Actions">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Button href="/pharmacist/prescriptions" variant="primary">
                  Manage Prescriptions
                </Button>
                <Button href="/pharmacist/prescriptions?filter=pending" variant="secondary">
                  Pending Orders
                </Button>
                <Button href="/pharmacist/profile" variant="secondary">
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