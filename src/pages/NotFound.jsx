import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export function NotFound() {
  return (
    <div className="min-h-screen bg-[#070b14] flex flex-col items-center justify-center px-4 text-center">
      <div className="mb-6">
        <p className="text-8xl font-display font-bold text-slate-800 select-none">404</p>
      </div>
      <h1 className="text-2xl font-display font-bold text-slate-200 mb-2">Page not found</h1>
      <p className="text-sm text-slate-500 mb-8 max-w-xs">
        This page doesn&apos;t exist or may have been moved.
      </p>
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-500 transition-colors"
      >
        <ArrowLeft size={15} />
        Back to dashboard
      </Link>
    </div>
  )
}
