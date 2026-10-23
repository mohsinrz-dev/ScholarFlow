import { createContext, useCallback, useContext, useRef, useState } from 'react'
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react'
import { cn } from '../../utils'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const removeRef = useRef(null)
  const add = useCallback((msg, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, msg, type }])
    if (duration > 0) {
      setTimeout(() => removeRef.current(id), duration)
    }
    return id
  }, [])

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])
  removeRef.current = remove

  const toast = {
    success: (msg) => add(msg, 'success'),
    error: (msg) => add(msg, 'error', 6000),
    info: (msg) => add(msg, 'info'),
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-80">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onClose={() => remove(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function ToastItem({ toast, onClose }) {
  const icons = {
    success: <CheckCircle size={16} className="text-emerald-400 shrink-0" />,
    error: <AlertCircle size={16} className="text-red-400 shrink-0" />,
    info: <Info size={16} className="text-blue-400 shrink-0" />,
  }

  const borders = {
    success: 'border-emerald-500/20',
    error: 'border-red-500/20',
    info: 'border-blue-500/20',
  }

  return (
    <div
      className={cn(
        'flex items-start gap-3 px-4 py-3 rounded-xl border bg-surface-850/90 backdrop-blur-sm shadow-xl',
        'animate-slide-up',
        borders[toast.type]
      )}
      role="alert"
    >
      {icons[toast.type]}
      <p className="text-sm text-slate-300 flex-1 leading-relaxed">{toast.msg}</p>
      <button
        onClick={onClose}
        className="shrink-0 text-slate-500 hover:text-slate-300 transition-colors"
        aria-label="Dismiss"
      >
        <X size={14} />
      </button>
    </div>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
