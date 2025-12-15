'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { Header, Card, Button } from '@/app/components/ui'

interface Medication {
  name: string
  dosage: string
  instructions: string
  quantity: string
}

export default function NewPrescription() {
  const [patients, setPatients] = useState<any[]>([])
  const [selectedPatient, setSelectedPatient] = useState('')
  const [medications, setMedications] = useState<Medication[]>([
    { name: '', dosage: '', instructions: '', quantity: '' }
  ])
  const [loading, setLoading] = useState(false)
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

    const fetchPatients = async () => {
      // Get patients who have had appointments with this doctor
      const { data: appointments } = await supabase
        .from('appointments')
        .select(`
          patient_id,
          patient:patient_id (
            id,
            name,
            phone
          )
        `)
        .eq('doctor_id', user?.id)

      if (appointments) {
        const uniquePatients = appointments.reduce((acc: any[], curr) => {
          if (!acc.find(p => p.id === curr.patient?.id)) {
            acc.push(curr.patient)
          }
          return acc
        }, [])
        setPatients(uniquePatients)
      }
    }

    getUser()
    if (user) {
      fetchPatients()
    }

    // Pre-select patient if provided in URL
    const patientId = searchParams.get('patient')
    if (patientId) {
      setSelectedPatient(patientId)
    }
  }, [user, searchParams])

  const addMedication = () => {
    setMedications([...medications, { name: '', dosage: '', instructions: '', quantity: '' }])
  }

  const removeMedication = (index: number) => {
    if (medications.length > 1) {
      setMedications(medications.filter((_, i) => i !== index))
    }
  }

  const updateMedication = (index: number, field: keyof Medication, value: string) => {
    const updated = medications.map((med, i) => 
      i === index ? { ...med, [field]: value } : med
    )
    setMedications(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPatient || medications.some(med => !med.name)) {
      alert('Please fill in all required fields')
      return
    }

    setLoading(true)

    const { error } = await supabase
      .from('prescriptions')
      .insert({
        doctor_id: user.id,
        patient_id: selectedPatient,
        medication_details: medications.filter(med => med.name.trim() !== '')
      })

    if (error) {
      alert('Error creating prescription: ' + error.message)
    } else {
      alert('Prescription created successfully!')
      router.push('/doctor/prescriptions')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        title="New Prescription" 
        userName={user?.email || ''} 
        userRole="Doctor" 
      />
      
      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Card title="Create New Prescription">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Patient Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Patient *
                </label>
                <select
                  value={selectedPatient}
                  onChange={(e) => setSelectedPatient(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="">Choose a patient...</option>
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.name} {patient.phone && `(${patient.phone})`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Medications */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Medications *
                  </label>
                  <Button
                    type="button"
                    onClick={addMedication}
                    variant="secondary"
                    size="sm"
                  >
                    Add Medication
                  </Button>
                </div>

                <div className="space-y-4">
                  {medications.map((medication, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="text-sm font-medium text-gray-900">
                          Medication {index + 1}
                        </h4>
                        {medications.length > 1 && (
                          <Button
                            type="button"
                            onClick={() => removeMedication(index)}
                            variant="danger"
                            size="sm"
                          >
                            Remove
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Medication Name *
                          </label>
                          <input
                            type="text"
                            value={medication.name}
                            onChange={(e) => updateMedication(index, 'name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="e.g., Amoxicillin"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Dosage
                          </label>
                          <input
                            type="text"
                            value={medication.dosage}
                            onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="e.g., 500mg"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Quantity
                          </label>
                          <input
                            type="text"
                            value={medication.quantity}
                            onChange={(e) => updateMedication(index, 'quantity', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="e.g., 30 tablets"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Instructions
                          </label>
                          <input
                            type="text"
                            value={medication.instructions}
                            onChange={(e) => updateMedication(index, 'instructions', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="e.g., Take twice daily with food"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex space-x-4">
                <Button
                  type="submit"
                  variant="primary"
                  className={loading ? 'opacity-50 cursor-not-allowed' : ''}
                >
                  {loading ? 'Creating...' : 'Create Prescription'}
                </Button>
                <Button
                  href="/doctor/prescriptions"
                  variant="secondary"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </main>
    </div>
  )
}