import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { AuthLayout } from './AuthLayout'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { auth } from '../../services/auth'

export function SignUp() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ fullName: '', email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')
  const [success, setSuccess] = useState(false)

  function validate() {
    const e = {}
    if (!form.fullName.trim()) e.fullName = 'Full name is required'
    if (!form.email) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.password) e.password = 'Password is required'
    else if (form.password.length < 8) e.password = 'Password must be at least 8 characters'
    return e
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length) return

    setLoading(true)
    setServerError('')
    try {
      const data = await auth.signUp(form)
      if (data?.user?.identities?.length === 0) {
        setServerError('An account with this email already exists.')
        return
      }
      if (data?.session) {
        navigate('/onboarding')
        return
      }
      setSuccess(true)
    } catch (err) {
      setServerError(err.message || 'Sign up failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <AuthLayout title="Check your email" subtitle="">
        <div className="text-center py-4">
          <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-sm text-slate-400 mb-1">We sent a confirmation link to</p>
          <p className="text-sm font-medium text-slate-200 mb-6">{form.email}</p>
          <p className="text-xs text-slate-500">
            Click the link to activate your account. Check your spam folder if you don&apos;t see it.
          </p>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start organizing your learning"
      footer={
        <>
          Already have an account?{' '}
          <Link to="/signin" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {serverError && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2.5 text-sm text-red-400">
            {serverError}
          </div>
        )}

        <Input
          label="Full name"
          type="text"
          placeholder="Arjun Sharma"
          autoComplete="name"
          value={form.fullName}
          onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          error={errors.fullName}
        />

        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          error={errors.email}
        />

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Password</label>
          <div className="relative">
            <input
              type={showPass ? 'text' : 'password'}
              placeholder="Min. 8 characters"
              autoComplete="new-password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 pr-10 text-sm text-slate-200 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPass((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              aria-label={showPass ? 'Hide password' : 'Show password'}
            >
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && <p className="mt-1.5 text-xs text-red-400">{errors.password}</p>}
        </div>

        <Button type="submit" className="w-full mt-2" loading={loading}>
          Create account
        </Button>

        <p className="text-xs text-slate-600 text-center">
          By signing up you agree to use StudyPilot responsibly.
        </p>
      </form>
    </AuthLayout>
  )
}
