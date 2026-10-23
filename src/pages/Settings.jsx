import { useState, useEffect } from 'react'
import { User, Moon, Sun, ShieldAlert } from 'lucide-react'
import { AppLayout, PageHeader } from '../components/layout/AppLayout'
import { Card, CardBody, LoadingPage } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input, Select } from '../components/ui/Input'
import { Modal, ConfirmModal } from '../components/ui/Modal'
import { useApi } from '../hooks/useApi'
import { endpoints } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useToast } from '../components/ui/Toast'
import { auth } from '../services/auth'
import { getInitials } from '../utils'
import { useNavigate } from 'react-router-dom'

export function Settings() {
  const { user } = useAuth()
  const { theme, toggle } = useTheme()
  const toast = useToast()
  const navigate = useNavigate()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [passwordOpen, setPasswordOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [pwError, setPwError] = useState('')
  const [changingPw, setChangingPw] = useState(false)

  const { data: profile, loading, refetch } = useApi(
    () => endpoints.profile.get(),
    []
  )

  const [form, setForm] = useState({
    display_name: '',
    preferred_language: 'en',
    goal: '',
    learning_preferences: {},
  })

  useEffect(() => {
    if (profile) {
      setForm({
        display_name: profile.display_name || user?.user_metadata?.display_name || user?.user_metadata?.full_name || '',
        preferred_language: profile.preferred_language || 'en',
        goal: profile.learning_preferences?.goal || '',
        learning_preferences: profile.learning_preferences || {},
      })
    }
  }, [profile, user])

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await endpoints.profile.update({
        display_name: form.display_name,
        preferred_language: form.preferred_language,
        learning_preferences: { ...form.learning_preferences, goal: form.goal },
      })
      toast.success('Settings saved')
      refetch()
    } catch (err) {
      toast.error(err.message || 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  async function handleChangePassword() {
    if (newPassword.length < 8) { setPwError('Password must be at least 8 characters'); return }
    setChangingPw(true)
    setPwError('')
    try {
      await auth.updatePassword(newPassword)
      toast.success('Password updated')
      setPasswordOpen(false)
      setNewPassword('')
    } catch (err) {
      setPwError(err.message || 'Failed to update password')
    } finally {
      setChangingPw(false)
    }
  }

  async function handleDeleteAccount() {
    if (saving) return
    setSaving(true)
    try {
      await auth.deleteAccount()
      navigate('/recover-account')
    } catch (err) {
      toast.error(err.message || 'Account deletion failed. Contact support.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <AppLayout><LoadingPage /></AppLayout>

  const displayName = form.display_name || user?.email?.split('@')[0] || 'Student'

  return (
    <AppLayout>
      <div className="px-5 md:px-8 py-6 max-w-2xl mx-auto">
        <PageHeader title="Settings" description="Manage your profile and preferences" />

        <div className="space-y-5">
          <Card>
            <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-2">
              <User size={15} className="text-slate-400" />
              <h2 className="text-sm font-semibold text-slate-300">Profile</h2>
            </div>
            <CardBody>
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 rounded-full bg-indigo-700 flex items-center justify-center text-xl font-bold text-white shrink-0">
                  {getInitials(displayName)}
                </div>
                <div>
                  <p className="font-medium text-slate-200">{displayName}</p>
                  <p className="text-sm text-slate-500">{user?.email}</p>
                </div>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <Input
                  label="Full name"
                  value={form.display_name}
                  onChange={(e) => setForm(f => ({ ...f, display_name: e.target.value }))}
                  placeholder="Your full name"
                />
                <Select
                  label="AI Tutor language"
                  value={form.preferred_language}
                  onChange={(e) => setForm(f => ({ ...f, preferred_language: e.target.value }))}
                >
                  <option value="en">English</option>
                  <option value="hi">Hinglish (Hindi + English)</option>
                </Select>
                <Button type="submit" loading={saving}>Save changes</Button>
              </form>
            </CardBody>
          </Card>

          <Card>
            <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-2">
              {theme === 'dark' ? <Moon size={15} className="text-slate-400" /> : <Sun size={15} className="text-slate-400" />}
              <h2 className="text-sm font-semibold text-slate-300">Appearance</h2>
            </div>
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-300">Theme</p>
                  <p className="text-xs text-slate-500">Currently using {theme} mode</p>
                </div>
                <button
                  onClick={toggle}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 text-sm text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
                >
                  {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
                  {theme === 'dark' ? 'Light mode' : 'Dark mode'}
                </button>
              </div>
            </CardBody>
          </Card>

          <Card>
            <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-2">
              <ShieldAlert size={15} className="text-slate-400" />
              <h2 className="text-sm font-semibold text-slate-300">Account</h2>
            </div>
            <CardBody className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-300">Password</p>
                  <p className="text-xs text-slate-500">Change your account password</p>
                </div>
                <Button variant="secondary" size="sm" onClick={() => setPasswordOpen(true)}>
                  Change password
                </Button>
              </div>

              <div className="pt-3 border-t border-white/[0.06]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-400">Delete account</p>
                    <p className="text-xs text-slate-500">Schedule deletion with a 30-day recovery window</p>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="text-red-400 border-red-500/20 hover:bg-red-500/10"
                    onClick={() => setDeleteOpen(true)}
                  >
                    Delete account
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        <Modal open={passwordOpen} onClose={() => { setPasswordOpen(false); setNewPassword(''); setPwError('') }} title="Change password" size="sm">
          <div className="space-y-4">
            <Input
              label="New password"
              type="password"
              placeholder="Min. 8 characters"
              value={newPassword}
              onChange={(e) => { setNewPassword(e.target.value); setPwError('') }}
              error={pwError}
            />
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setPasswordOpen(false)}>Cancel</Button>
              <Button onClick={handleChangePassword} loading={changingPw}>Update password</Button>
            </div>
          </div>
        </Modal>

        <ConfirmModal
          open={deleteOpen}
          onClose={() => setDeleteOpen(false)}
          onConfirm={handleDeleteAccount}
          loading={saving}
          title="Delete your account"
          description="Your account is scheduled for deletion. You can restore it within 30 days from the account recovery page."
          confirmLabel="Schedule deletion"
          danger
        />
      </div>
    </AppLayout>
  )
}
