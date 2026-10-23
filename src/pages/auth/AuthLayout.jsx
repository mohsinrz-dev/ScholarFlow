import { Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'

export function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-screen bg-[#070b14] flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center">
              <Sparkles size={18} className="text-white" />
            </div>
            <span className="font-display font-bold text-xl text-slate-100">StudyPilot</span>
          </Link>
          <h1 className="font-display text-2xl font-bold text-slate-100 mb-2">{title}</h1>
          {subtitle && <p className="text-sm text-slate-400">{subtitle}</p>}
        </div>

        <div className="rounded-2xl border border-white/[0.07] bg-surface-900/60 p-6 backdrop-blur-sm">
          {children}
        </div>

        {footer && (
          <div className="mt-5 text-center text-sm text-slate-500">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
