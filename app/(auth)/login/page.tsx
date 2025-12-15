import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LoginForm from './login-form'

export default async function LoginPage() {
  console.log('🔍 LoginPage: Component loading...')
  
  try {
    const supabase = createClient()
    console.log('🔍 LoginPage: Supabase client created')
    
    const { data: { user }, error } = await supabase.auth.getUser()
    console.log('🔍 LoginPage: User check result:', { user: user?.id, error })

    if (user) {
      console.log('🔍 LoginPage: User found, redirecting to /')
      redirect('/')
    }

    console.log('🔍 LoginPage: Rendering login form')
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Health Care Portal
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Sign in to your account
            </p>
          </div>
          <LoginForm />
        </div>
      </div>
    )
  } catch (error) {
    console.error('❌ LoginPage: Error occurred:', error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Login</h2>
          <p className="text-gray-600">Please check the console for details</p>
        </div>
      </div>
    )
  }
}