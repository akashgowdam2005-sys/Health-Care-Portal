import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function HomePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile) {
      redirect(`/${profile.role.toLowerCase()}`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-lg">H</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">HealthCare Portal</h1>
            </div>
            <Link
              href="/login"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md font-medium transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Modern Healthcare
            <span className="block text-indigo-600">Management System</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Streamline your healthcare experience with our comprehensive portal designed for patients, doctors, and pharmacists.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-medium text-lg transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">👥</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">For Patients</h3>
            <p className="text-gray-600 mb-4">
              Book appointments, view prescriptions, and manage your health records all in one place.
            </p>
            <ul className="text-sm text-gray-500 space-y-1">
              <li>• Online appointment booking</li>
              <li>• Prescription history</li>
              <li>• Profile management</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">👨‍⚕️</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">For Doctors</h3>
            <p className="text-gray-600 mb-4">
              Manage appointments, patient records, and create digital prescriptions efficiently.
            </p>
            <ul className="text-sm text-gray-500 space-y-1">
              <li>• Appointment management</li>
              <li>• Patient records</li>
              <li>• Digital prescriptions</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">💊</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">For Pharmacists</h3>
            <p className="text-gray-600 mb-4">
              Process prescriptions, manage inventory, and track medication fulfillment.
            </p>
            <ul className="text-sm text-gray-500 space-y-1">
              <li>• Prescription processing</li>
              <li>• Fulfillment tracking</li>
              <li>• Patient communication</li>
            </ul>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 bg-indigo-600 rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to transform your healthcare experience?
          </h2>
          <p className="text-indigo-100 text-lg mb-8">
            Join thousands of healthcare professionals and patients already using our platform.
          </p>
          <Link
            href="/login"
            className="bg-white hover:bg-gray-100 text-indigo-600 px-8 py-3 rounded-lg font-medium text-lg transition-colors inline-block"
          >
            Start Today
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-lg">H</span>
              </div>
              <span className="text-xl font-bold">HealthCare Portal</span>
            </div>
            <p className="text-gray-400">
              Connecting patients, doctors, and pharmacists for better healthcare outcomes.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}