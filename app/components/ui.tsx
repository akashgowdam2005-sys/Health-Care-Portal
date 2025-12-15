import Link from 'next/link'

interface HeaderProps {
  title: string
  userName: string
  userRole: string
}

export function Header({ title, userName, userRole }: HeaderProps) {
  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          <p className="text-sm text-gray-600 mt-1">{userRole} Portal</p>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-700">Welcome, {userName}</span>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Sign Out
            </button>
          </form>
        </div>
      </div>
    </header>
  )
}

interface CardProps {
  title: string
  children: React.ReactNode
  className?: string
}

export function Card({ title, children, className = "" }: CardProps) {
  return (
    <div className={`bg-white overflow-hidden shadow rounded-lg ${className}`}>
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
          {title}
        </h3>
        {children}
      </div>
    </div>
  )
}

interface ButtonProps {
  href?: string
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
  className?: string
  type?: 'button' | 'submit'
  disabled?: boolean
}

export function Button({ 
  href, 
  onClick, 
  variant = 'primary', 
  size = 'md', 
  children, 
  className = "",
  type = 'button',
  disabled = false
}: ButtonProps) {
  const baseClasses = "inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
  
  const variants = {
    primary: "bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-500",
    secondary: "bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 focus:ring-indigo-500",
    danger: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500"
  }
  
  const sizes = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  }
  
  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`
  
  if (href && !disabled) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    )
  }
  
  return (
    <button type={type} onClick={onClick} className={classes} disabled={disabled}>
      {children}
    </button>
  )
}

interface StatusBadgeProps {
  status: string
  type?: 'appointment' | 'prescription'
}

export function StatusBadge({ status, type = 'appointment' }: StatusBadgeProps) {
  const getStatusColor = () => {
    if (type === 'appointment') {
      switch (status) {
        case 'SCHEDULED': return 'bg-blue-100 text-blue-800'
        case 'COMPLETED': return 'bg-green-100 text-green-800'
        case 'CANCELLED': return 'bg-red-100 text-red-800'
        default: return 'bg-gray-100 text-gray-800'
      }
    } else {
      return status ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
    }
  }
  
  const getStatusText = () => {
    if (type === 'prescription') {
      return status ? 'Filled' : 'Pending'
    }
    return status
  }
  
  return (
    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor()}`}>
      {getStatusText()}
    </span>
  )
}

export function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>
  )
}

interface EmptyStateProps {
  message: string
  actionText?: string
  actionHref?: string
}

export function EmptyState({ message, actionText, actionHref }: EmptyStateProps) {
  return (
    <div className="text-center py-8">
      <p className="text-gray-500 mb-4">{message}</p>
      {actionText && actionHref && (
        <Button href={actionHref} variant="primary">
          {actionText}
        </Button>
      )}
    </div>
  )
}