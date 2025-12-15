'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { Header, Card, StatusBadge, EmptyState, Button } from '@/app/components/ui'

export default function PharmacistPrescriptions() {
  const [prescriptions, setPrescriptions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)
    }

    const filterParam = searchParams.get('filter')
    if (filterParam) {
      setFilter(filterParam)
    }

    getUser()
  }, [searchParams])

  useEffect(() => {
    if (user) {
      fetchPrescriptions()
    }
  }, [user, filter])

  const fetchPrescriptions = async () => {
    setLoading(true)
    
    let query = supabase
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
          name,
          doctor_profiles (
            specialization
          )
        )
      `)

    if (filter === 'pending') {
      query = query.eq('filled_status', false)
    } else if (filter === 'filled') {
      query = query.eq('filled_status', true)
    }

    const { data } = await query.order('date_issued', { ascending: false })
    
    setPrescriptions(data || [])
    setLoading(false)
  }

  const handleFillPrescription = async (prescriptionId: string) => {
    const { error } = await supabase
      .from('prescriptions')
      .update({ filled_status: true })
      .eq('id', prescriptionId)

    if (error) {
      alert('Error filling prescription: ' + error.message)
    } else {
      alert('Prescription marked as filled!')
      fetchPrescriptions()
    }
  }

  const handleUnfillPrescription = async (prescriptionId: string) => {
    const { error } = await supabase
      .from('prescriptions')
      .update({ filled_status: false })
      .eq('id', prescriptionId)

    if (error) {
      alert('Error updating prescription: ' + error.message)
    } else {
      alert('Prescription marked as pending!')
      fetchPrescriptions()
    }
  }

  const pendingCount = prescriptions.filter(p => !p.filled_status).length
  const filledCount = prescriptions.filter(p => p.filled_status).length

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        title="Prescription Management" 
        userName={user?.email || ''} 
        userRole="Pharmacist" 
      />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          
          {/* Filter Tabs */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setFilter('all')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    filter === 'all'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  All Prescriptions ({prescriptions.length})
                </button>
                <button
                  onClick={() => setFilter('pending')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    filter === 'pending'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Pending ({pendingCount})
                </button>
                <button
                  onClick={() => setFilter('filled')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    filter === 'filled'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Filled ({filledCount})
                </button>
              </nav>
            </div>
          </div>

          <Card title={`${filter.charAt(0).toUpperCase() + filter.slice(1)} Prescriptions`}>
            {prescriptions.length > 0 ? (
              <div className="space-y-6">
                {prescriptions.map((prescription: any) => (
                  <div 
                    key={prescription.id} 
                    className={`border rounded-lg p-6 hover:shadow-md transition-shadow ${
                      prescription.filled_status 
                        ? 'border-green-200 bg-green-50' 
                        : 'border-yellow-200 bg-yellow-50'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h4 className="text-lg font-medium text-gray-900">
                          Patient: {prescription.patient?.name}
                        </h4>
                        <div className="mt-2 space-y-1 text-sm text-gray-600">
                          <p>👨‍⚕️ Dr. {prescription.doctor?.name}</p>
                          <p>🏥 {prescription.doctor?.doctor_profiles?.[0]?.specialization || 'General Practice'}</p>
                          <p>📞 {prescription.patient?.phone || 'No phone'}</p>
                          <p>📅 Issued: {new Date(prescription.date_issued).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <StatusBadge status={prescription.filled_status} type="prescription" />
                        {!prescription.filled_status ? (
                          <Button 
                            onClick={() => handleFillPrescription(prescription.id)}
                            variant="primary"
                            size="sm"
                          >
                            Mark as Filled
                          </Button>
                        ) : (
                          <Button 
                            onClick={() => handleUnfillPrescription(prescription.id)}
                            variant="secondary"
                            size="sm"
                          >
                            Mark as Pending
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-md p-4 border">
                      <h5 className="font-medium text-gray-900 mb-3">💊 Medications:</h5>
                      {Array.isArray(prescription.medication_details) ? (
                        <div className="space-y-3">
                          {prescription.medication_details.map((med: any, index: number) => (
                            <div key={index} className="border-l-4 border-blue-200 pl-4 py-2">
                              <div className="font-medium text-gray-900">{med.name}</div>
                              {med.dosage && (
                                <div className="text-sm text-gray-600">Dosage: {med.dosage}</div>
                              )}
                              {med.instructions && (
                                <div className="text-sm text-gray-500 mt-1">
                                  Instructions: {med.instructions}
                                </div>
                              )}
                              {med.quantity && (
                                <div className="text-sm text-gray-600">Quantity: {med.quantity}</div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-600">
                          {JSON.stringify(prescription.medication_details)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState 
                message={`No ${filter === 'all' ? '' : filter} prescriptions found`}
              />
            )}
          </Card>

          <div className="mt-6">
            <Button href="/pharmacist" variant="secondary">
              Back to Dashboard
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}