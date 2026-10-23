import { Link } from 'react-router-dom'
import { Sparkles, CalendarDays, BrainCircuit, BarChart2, RotateCcw, ArrowRight, CheckCircle } from 'lucide-react'

const features = [
  {
    icon: CalendarDays,
    title: 'Structured Planning',
    desc: 'Build daily and weekly study schedules around your subjects, deadlines, and available time.',
  },
  {
    icon: BrainCircuit,
    title: 'AI Tutor',
    desc: 'Ask anything — get step-by-step explanations in plain English or Hinglish, at your level.',
  },
  {
    icon: RotateCcw,
    title: 'Spaced Revision',
    desc: 'Never forget what you studied. Track topics and revisit them at the right intervals.',
  },
  {
    icon: BarChart2,
    title: 'Real Progress',
    desc: 'Charts built from your actual activity — see which subjects need more attention.',
  },
]

const steps = [
  {
    step: '1',
    title: 'Set your subjects',
    desc: 'Tell StudyPilot what you\'re studying and when exams or deadlines are.',
  },
  {
    step: '2',
    title: 'Get a study plan',
    desc: 'Your planner organizes tasks by priority, subject, and how much time you have.',
  },
  {
    step: '3',
    title: 'Learn with the AI tutor',
    desc: 'Stuck on a concept? Ask the AI tutor — it explains, guides, and remembers your sessions.',
  },
  {
    step: '4',
    title: 'Track and revise',
    desc: 'Review what you\'ve learned. The revision center surfaces topics before they fade.',
  },
]

export function Landing() {
  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100">
      <nav className="flex items-center justify-between px-6 md:px-12 py-5 border-b border-white/[0.05] sticky top-0 z-50 backdrop-blur-md bg-[#070b14]/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
            <Sparkles size={16} className="text-white" />
          </div>
          <span className="font-display font-bold text-lg text-slate-100">StudyPilot</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/signin"
            className="text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors px-4 py-2"
          >
            Sign in
          </Link>
          <Link
            to="/signup"
            className="text-sm font-medium bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-500 transition-colors"
          >
            Get started free
          </Link>
        </div>
      </nav>

      <section className="relative px-6 md:px-12 pt-24 pb-20 text-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-indigo-600/10 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-indigo-400 text-xs font-medium mb-8">
            <Sparkles size={12} />
            AI-powered study planning
          </div>
          <h1 className="font-display font-bold text-5xl md:text-6xl text-slate-100 leading-[1.1] tracking-tight mb-6">
            Study smarter.{' '}
            <span className="text-indigo-400">Stay consistent.</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-xl mx-auto leading-relaxed mb-10">
            StudyPilot helps you organize your learning, understand difficult topics with an AI tutor,
            and track your real progress — not estimated streaks.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-500 transition-colors"
            >
              Start studying free
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/signin"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/10 text-slate-300 font-medium hover:bg-white/5 transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      <section className="px-6 md:px-12 py-16 max-w-5xl mx-auto">
        <div className="rounded-2xl border border-white/[0.07] bg-surface-900/40 overflow-hidden">
          <div className="px-4 py-3 border-b border-white/[0.06] flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/40" />
              <div className="w-3 h-3 rounded-full bg-amber-500/40" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/40" />
            </div>
            <span className="text-xs text-slate-500 font-mono">StudyPilot — Dashboard</span>
          </div>
          <div className="p-6 grid grid-cols-3 gap-4">
            <div className="col-span-3 md:col-span-1 space-y-3">
              {['Physics — Ch. 5 review', 'Maths problem set', 'Chemistry notes'].map((task) => (
                <div key={task} className="flex items-center gap-2.5 p-3 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                  <CheckCircle size={14} className="text-emerald-400 shrink-0" />
                  <span className="text-sm text-slate-300">{task}</span>
                </div>
              ))}
            </div>
            <div className="col-span-3 md:col-span-2 rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
              <p className="text-xs text-slate-500 mb-3 font-medium">AI Tutor conversation</p>
              <div className="space-y-3">
                <div className="rounded-lg bg-indigo-600/15 border border-indigo-500/20 p-3">
                  <p className="text-sm text-slate-300">Why does current flow from high to low potential?</p>
                </div>
                <div className="rounded-lg bg-white/[0.04] border border-white/[0.06] p-3">
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Think of electric potential like height — charges naturally move downhill, from high potential to low potential, just like water flows downhill. This movement is what we call current...
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 md:px-12 py-20 max-w-5xl mx-auto">
        <h2 className="font-display text-3xl font-bold text-slate-100 text-center mb-3 tracking-tight">
          Everything for serious students
        </h2>
        <p className="text-slate-400 text-center mb-12 max-w-xl mx-auto">
          Not another productivity app. StudyPilot is built around how students actually learn.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {features.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="p-5 rounded-xl border border-white/[0.06] bg-surface-900/40 hover:border-indigo-500/20 hover:bg-indigo-500/[0.03] transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4">
                <Icon size={18} className="text-indigo-400" />
              </div>
              <h3 className="font-semibold text-slate-200 mb-1.5">{title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 md:px-12 py-20 max-w-3xl mx-auto">
        <h2 className="font-display text-3xl font-bold text-slate-100 text-center mb-12 tracking-tight">
          How it works
        </h2>
        <div className="space-y-8">
          {steps.map(({ step, title, desc }, i) => (
            <div key={step} className="flex gap-5">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full border border-indigo-500/30 bg-indigo-500/10 flex items-center justify-center text-sm font-semibold text-indigo-400 shrink-0">
                  {step}
                </div>
                {i < steps.length - 1 && (
                  <div className="w-px flex-1 bg-white/[0.06] my-2" />
                )}
              </div>
              <div className="pb-8">
                <h3 className="font-semibold text-slate-200 mb-1">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 md:px-12 py-20 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="font-display text-4xl font-bold text-slate-100 tracking-tight mb-4">
            Ready to study with purpose?
          </h2>
          <p className="text-slate-400 mb-8">
            Create your free account and build your first study plan in minutes.
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-500 transition-colors text-base"
          >
            Start for free
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <footer className="border-t border-white/[0.06] px-6 md:px-12 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 max-w-5xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center">
              <Sparkles size={12} className="text-white" />
            </div>
            <span className="font-display font-semibold text-slate-400 text-sm">StudyPilot</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/signup" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">Sign up</Link>
            <Link to="/signin" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">Sign in</Link>
          </div>
          <p className="text-xs text-slate-600">Study smarter. Stay consistent. Reach further.</p>
        </div>
      </footer>
    </div>
  )
}
