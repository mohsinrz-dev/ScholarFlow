export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

export function formatDate(date, options = {}) {
  const d = date instanceof Date ? date : new Date(date)
  if (isNaN(d)) return ''
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...options,
  })
}

export function formatTime(date) {
  const d = date instanceof Date ? date : new Date(date)
  if (isNaN(d)) return ''
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
}

export function relativeTime(date) {
  const d = date instanceof Date ? date : new Date(date)
  if (isNaN(d)) return ''

  const now = new Date()
  const diff = now - d
  const abs = Math.abs(diff)
  const future = diff < 0

  if (abs < 60_000) return 'just now'
  if (abs < 3_600_000) {
    const m = Math.round(abs / 60_000)
    return future ? `in ${m}m` : `${m}m ago`
  }
  if (abs < 86_400_000) {
    const h = Math.round(abs / 3_600_000)
    return future ? `in ${h}h` : `${h}h ago`
  }
  const days = Math.round(abs / 86_400_000)
  if (days === 1) return future ? 'tomorrow' : 'yesterday'
  if (days < 7) return future ? `in ${days}d` : `${days}d ago`
  return formatDate(d)
}

export function isOverdue(dateStr) {
  if (!dateStr) return false
  return new Date(dateStr) < new Date()
}

export function isDueToday(dateStr) {
  if (!dateStr) return false
  const d = new Date(dateStr)
  const today = new Date()
  return (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  )
}

export function priorityColor(priority) {
  switch (priority?.toLowerCase()) {
    case 'high': return 'text-red-400'
    case 'medium': return 'text-amber-400'
    case 'low': return 'text-emerald-400'
    default: return 'text-slate-400'
  }
}

export function priorityBg(priority) {
  switch (priority?.toLowerCase()) {
    case 'high': return 'bg-red-500/10 text-red-400 border-red-500/20'
    case 'medium': return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
    case 'low': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20'
  }
}

export function statusBg(status) {
  switch (status?.toLowerCase()) {
    case 'completed': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    case 'in-progress':
    case 'in_progress': return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
    case 'pending': return 'bg-slate-500/10 text-slate-400 border-slate-500/20'
    default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20'
  }
}

export function groupBy(arr, key) {
  return arr.reduce((acc, item) => {
    const k = typeof key === 'function' ? key(item) : item[key]
    if (!acc[k]) acc[k] = []
    acc[k].push(item)
    return acc
  }, {})
}

export function truncate(str, n = 60) {
  if (!str) return ''
  return str.length > n ? str.slice(0, n) + '…' : str
}

export function getInitials(name) {
  if (!name) return '?'
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}
