import { useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '../../utils'

export function Modal({ open, onClose, title, children, size = 'md', className }) {
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    if (open) {
      document.addEventListener('keydown', handleKey)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={cn(
          'relative w-full rounded-2xl border border-white/10 bg-surface-900 shadow-2xl',
          'animate-slide-up',
          sizes[size],
          className
        )}
      >
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
            <h2 className="text-base font-semibold text-slate-100">{title}</h2>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

export function ConfirmModal({ open, onClose, onConfirm, title, description, confirmLabel = 'Delete', danger = true, loading = false }) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <p className="text-sm text-slate-400 mb-6">{description}</p>
      <div className="flex items-center gap-3 justify-end">
        <button
          onClick={onClose}
          disabled={loading}
          className="px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={async () => { if (loading) return; await onConfirm() }}
          disabled={loading}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            danger
              ? 'bg-red-600 text-white hover:bg-red-500'
              : 'bg-indigo-600 text-white hover:bg-indigo-500'
          )}
        >
          {loading ? 'Working…' : confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
