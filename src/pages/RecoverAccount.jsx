import { useState } from 'react'
import { Link } from 'react-router-dom'
import { auth } from '../services/auth'
import { endpoints } from '../services/api'
import { Button } from '../components/ui/Button'
import { AuthLayout } from './auth/AuthLayout'

export function RecoverAccount() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function handleRecover() {
    setLoading(true)
    setMessage('')
    setError('')
    try {
      const session = await auth.getSession()
      if (!session) throw new Error('Sign in first, then return here to restore your account.')
      await endpoints.account.recover()
      setMessage('Your account is restored. You can continue to your dashboard.')
    } catch (requestError) {
      setError(requestError.message || 'Sign in first, then retry account recovery. Accounts can be restored within 30 days.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Restore your account" subtitle="Recover an account scheduled for deletion within 30 days.">
      <div className="space-y-4">
        {message && <p role="status" className="text-sm text-emerald-400">{message}</p>}
        {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
        <Button className="w-full" loading={loading} onClick={handleRecover}>Restore account</Button>
        <p className="text-center text-sm text-slate-500">Need to sign in first? <Link className="text-indigo-400" to="/signin?redirect=%2Frecover-account">Sign in</Link></p>
        {message && <Link className="block text-center text-sm text-indigo-400" to="/dashboard">Go to dashboard</Link>}
      </div>
    </AuthLayout>
  )
}
