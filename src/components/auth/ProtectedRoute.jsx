import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { LoadingPage } from '../ui/Card'

export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) return <LoadingPage />
  if (!user) return <Navigate to="/signin" replace />

  return children
}

export function PublicRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) return <LoadingPage />
  if (user) return <Navigate to="/dashboard" replace />

  return children
}
