import { cn } from '../../utils'

export function Input({ label, error, hint, className, ...props }) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-medium text-slate-400 mb-1.5">
          {label}
        </label>
      )}
      <input
        className={cn(
          'w-full rounded-lg border bg-white/5 px-3 py-2.5 text-sm text-slate-200',
          'placeholder:text-slate-500 transition-colors duration-150',
          'focus:outline-none focus:ring-1',
          error
            ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/30'
            : 'border-white/10 focus:border-indigo-500 focus:ring-indigo-500/30',
          className
        )}
        {...props}
      />
      {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
      {hint && !error && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>}
    </div>
  )
}

export function Textarea({ label, error, hint, className, ...props }) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-medium text-slate-400 mb-1.5">
          {label}
        </label>
      )}
      <textarea
        className={cn(
          'w-full rounded-lg border bg-white/5 px-3 py-2.5 text-sm text-slate-200',
          'placeholder:text-slate-500 transition-colors duration-150 resize-none',
          'focus:outline-none focus:ring-1',
          error
            ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/30'
            : 'border-white/10 focus:border-indigo-500 focus:ring-indigo-500/30',
          className
        )}
        {...props}
      />
      {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
      {hint && !error && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>}
    </div>
  )
}

export function Select({ label, error, hint, children, className, ...props }) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-medium text-slate-400 mb-1.5">
          {label}
        </label>
      )}
      <select
        className={cn(
          'w-full rounded-lg border bg-surface-900 px-3 py-2.5 text-sm text-slate-200',
          'transition-colors duration-150 focus:outline-none focus:ring-1',
          error
            ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/30'
            : 'border-white/10 focus:border-indigo-500 focus:ring-indigo-500/30',
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
      {hint && !error && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>}
    </div>
  )
}
