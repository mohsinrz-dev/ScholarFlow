import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AuthLayout } from './AuthLayout'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { auth } from '../../services/auth'

export function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email) { setError('Email is required'); return }
    if (!/\S+@\S+\.\S+/.test(email)) { setError('Enter a valid email'); return }

    setLoading(true)
    setError('')
    try {
      await auth.resetPassword(email)
      setSent(true)
    } catch (err) {
      setError(err.message || 'Failed to send reset email')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <AuthLayout title="Email sent" footer={
        <Link to="/signin" className="text-indigo-400 hover:text-indigo-300 transition-colors">
          Back to sign in
        </Link>
      }>
        <div className="text-center py-4">
          <p className="text-sm text-slate-400 mb-1">Password reset link sent to</p>
          <p className="text-sm font-medium text-slate-200 mb-6">{email}</p>
          <p className="text-xs text-slate-500">Check your inbox and spam folder. The link expires in 1 hour.</p>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your email and we'll send a reset link"
      footer={
        <Link to="/signin" className="text-indigo-400 hover:text-indigo-300 transition-colors">
          Back to sign in
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setError('') }}
          error={error}
        />
        <Button type="submit" className="w-full" loading={loading}>
          Send reset link
        </Button>
      </form>
    </AuthLayout>
  )
}
