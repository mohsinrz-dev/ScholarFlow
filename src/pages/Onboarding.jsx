import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Select } from '../components/ui/Input'
import { useCallback } from 'react'
import { endpoints } from '../services/api'
import { useToast } from '../components/ui/Toast'

const GOALS = ['Exam preparation', 'Self-learning', 'Improving grades', 'Building consistency', 'Revision & recall']
const HOURS = ['< 1 hour', '1–2 hours', '2–4 hours', '4+ hours']

export function Onboarding() {
  const navigate = useNavigate()
  const toast = useToast()
  const showSubjectError = useCallback((message) => toast.error(message), [toast])
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [subjectsLoading, setSubjectsLoading] = useState(true)
  const [availableSubjects, setAvailableSubjects] = useState([])
  const [form, setForm] = useState({
    subjects: [],
    goal: '',
    dailyHours: '',
    language: 'english',
  })

  useEffect(() => {
    endpoints.subjects.list().then((items) => {
      setAvailableSubjects(items ?? [])
      if (items?.length) setForm((current) => ({ ...current, subjects: items.map((subject) => subject.name) }))
    }).catch((error) => showSubjectError(error.message || 'Could not load your subjects.')).finally(() => setSubjectsLoading(false))
  }, [showSubjectError])

  const steps = [
    { title: 'What are you studying?', subtitle: 'Pick the subjects you want to track. You can change these later.' },
    { title: 'What\'s your main goal?', subtitle: 'This helps StudyPilot suggest how to structure your time.' },
    { title: 'Daily study time', subtitle: 'How much time can you commit each day?' },
  ]

  function toggleSubject(s) {
    setForm((f) => ({
      ...f,
      subjects: f.subjects.includes(s)
        ? f.subjects.filter((x) => x !== s)
        : [...f.subjects, s],
    }))
  }

  async function handleFinish() {
    if (!form.subjects.length || !form.goal || !form.dailyHours) {
      toast.error('Select at least one subject and complete each onboarding step.')
      return
    }
    setLoading(true)
    try {
      await endpoints.profile.update({
        preferred_language: form.language === 'hinglish' ? 'hi' : 'en',
        learning_preferences: {
          subjects: form.subjects,
          goal: form.goal,
          daily_hours: form.dailyHours,
          onboarded: true,
        },
      })
      navigate('/dashboard')
    } catch (error) {
      toast.error(error.message || 'Could not save preferences. Please retry.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#070b14] flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Sparkles size={16} className="text-white" />
            </div>
            <span className="font-display font-bold text-lg text-slate-100">StudyPilot</span>
          </div>
          <div className="flex items-center justify-center gap-2 mb-6">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === step ? 'w-8 bg-indigo-400' : i < step ? 'w-4 bg-indigo-600' : 'w-4 bg-white/10'
                }`}
              />
            ))}
          </div>
          <h1 className="font-display text-2xl font-bold text-slate-100 mb-2">{steps[step].title}</h1>
          <p className="text-sm text-slate-400">{steps[step].subtitle}</p>
        </div>

        <div className="rounded-2xl border border-white/[0.07] bg-surface-900/60 p-6 backdrop-blur-sm">
          {step === 0 && (
            <div className="grid grid-cols-2 gap-2">
              {subjectsLoading && <p className="col-span-2 text-sm text-slate-500">Loading your subjects…</p>}
              {!subjectsLoading && availableSubjects.length === 0 && <p className="col-span-2 text-sm text-slate-500">Add subjects from the study planner before continuing onboarding.</p>}
              {availableSubjects.map(({ name: s }) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSubject(s)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium border text-left transition-all duration-150 ${
                    form.subjects.includes(s)
                      ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300'
                      : 'bg-white/[0.03] border-white/[0.06] text-slate-400 hover:border-white/10 hover:text-slate-300'
                  }`}
                >
                  {form.subjects.includes(s) && <CheckCircle size={13} className="shrink-0 text-indigo-400" />}
                  <span>{s}</span>
                </button>
              ))}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-2">
              {GOALS.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, goal: g }))}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium border text-left transition-all duration-150 ${
                    form.goal === g
                      ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300'
                      : 'bg-white/[0.03] border-white/[0.06] text-slate-400 hover:border-white/10 hover:text-slate-300'
                  }`}
                >
                  {form.goal === g ? (
                    <CheckCircle size={15} className="shrink-0 text-indigo-400" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-white/15 shrink-0" />
                  )}
                  {g}
                </button>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {HOURS.map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, dailyHours: h }))}
                    className={`px-4 py-3 rounded-lg text-sm font-medium border transition-all duration-150 ${
                      form.dailyHours === h
                        ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300'
                        : 'bg-white/[0.03] border-white/[0.06] text-slate-400 hover:border-white/10 hover:text-slate-300'
                    }`}
                  >
                    {h}
                  </button>
                ))}
              </div>
              <Select
                label="Preferred language for AI Tutor"
                value={form.language}
                onChange={(e) => setForm((f) => ({ ...f, language: e.target.value }))}
              >
                <option value="english">English</option>
                <option value="hinglish">Hinglish (Hindi + English)</option>
              </Select>
            </div>
          )}

          <div className="flex items-center justify-between mt-6 pt-5 border-t border-white/[0.06]">
            <button
              type="button"
              onClick={() => step > 0 ? setStep(s => s - 1) : navigate('/dashboard')}
              disabled={step === 0 && subjectsLoading}
              className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
            >
              {step === 0 ? 'Skip for now' : 'Back'}
            </button>

            <Button
              onClick={() => {
                if (step < steps.length - 1) setStep(s => s + 1)
                else handleFinish()
              }}
              loading={loading}
              icon={<ArrowRight size={15} />}
            >
              {step === steps.length - 1 ? 'Go to Dashboard' : 'Continue'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
