import { cn } from '../../utils'

const variants = {
  primary: 'bg-indigo-600 text-white hover:bg-indigo-500 border-transparent',
  secondary: 'border border-white/10 text-slate-300 hover:bg-white/5 bg-transparent',
  ghost: 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border-transparent bg-transparent',
  danger: 'bg-red-600 text-white hover:bg-red-500 border-transparent',
  outline: 'border border-indigo-500/40 text-indigo-400 hover:bg-indigo-500/10 bg-transparent',
}

const sizes = {
  xs: 'px-2.5 py-1.5 text-xs rounded-md',
  sm: 'px-3 py-2 text-sm rounded-lg',
  md: 'px-4 py-2.5 text-sm rounded-lg',
  lg: 'px-5 py-3 text-base rounded-xl',
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  loading = false,
  disabled,
  icon,
  ...props
}) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium border transition-all duration-150',
        'active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      {children}
    </button>
  )
}
