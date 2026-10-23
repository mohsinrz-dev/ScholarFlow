import { useState } from 'react'
import { Plus, RotateCcw, CheckCircle, Search, Calendar, Tag } from 'lucide-react'
import { AppLayout, PageHeader } from '../components/layout/AppLayout'
import { EmptyState, ErrorState, LoadingPage } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input, Select } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { useApi, useDebounce } from '../hooks/useApi'
import { endpoints } from '../services/api'
import { useApi as useApiHook } from '../hooks/useApi'
import { useToast } from '../components/ui/Toast'
import { formatDate, isOverdue, isDueToday, cn } from '../utils'

function RevisionCard({ item, onMarkReviewed }) {
  const reviewed = item.status === 'reviewed' && !isOverdue(item.due_date) && !isDueToday(item.due_date)
  const overdue = isOverdue(item.due_date)
  const today = isDueToday(item.due_date)

  return (
    <div className={cn(
      'group flex items-start gap-3 p-4 rounded-xl border transition-all duration-150',
      reviewed
        ? 'border-white/[0.04] bg-white/[0.02] opacity-60'
        : overdue
          ? 'border-red-500/10 bg-red-500/[0.02] hover:border-red-500/20'
          : today
            ? 'border-amber-500/10 bg-amber-500/[0.02] hover:border-amber-500/20'
            : 'border-white/[0.06] bg-surface-900/60 hover:border-white/10'
    )}>
      <button
        onClick={() => !reviewed && onMarkReviewed(item)}
        disabled={reviewed}
        className={cn(
          'shrink-0 mt-0.5 transition-colors',
          reviewed ? 'text-emerald-400 cursor-default' : 'text-slate-500 hover:text-emerald-400'
        )}
        aria-label="Mark as reviewed"
      >
        {reviewed
          ? <CheckCircle size={18} className="text-emerald-400" />
          : <RotateCcw size={18} />
        }
      </button>

      <div className="flex-1 min-w-0">
        <p className={cn('text-sm font-medium mb-1', reviewed ? 'line-through text-slate-500' : 'text-slate-200')}>
          {item.topic}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {item.subject?.name && (
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Tag size={10} />
              {item.subject.name}
            </span>
          )}
          {item.due_date && (
            <span className={cn('text-xs flex items-center gap-1',
              overdue ? 'text-red-400' : today ? 'text-amber-400' : 'text-slate-500'
            )}>
              <Calendar size={10} />
              {overdue ? 'Overdue since ' : today ? 'Due today · ' : 'Review '}{formatDate(item.due_date)}
            </span>
          )}
        </div>
        {item.review_count > 0 && (
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">Reviewed {item.review_count} times</p>
        )}
      </div>
    </div>
  )
}

const defaultForm = { topic: '', subject_id: '', due_date: '' }

export function Revisions() {
  const toast = useToast()
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('due')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(defaultForm)
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)
  const debouncedSearch = useDebounce(search, 300)
  const { data: subjects } = useApiHook(() => endpoints.subjects.list(), [])

  const { data, loading, error, refetch } = useApi(
    () => endpoints.revisions.list(),
    []
  )

  const revisions = data ?? []

  const filtered = revisions.filter(r => {
    const matchSearch = !debouncedSearch ||
      r.topic?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      r.subject?.name?.toLowerCase().includes(debouncedSearch.toLowerCase())
    const matchTab = tab === 'all' ||
      (tab === 'due' && (isOverdue(r.due_date) || isDueToday(r.due_date)) && ['pending', 'reviewed'].includes(r.status)) ||
      (tab === 'reviewed' && r.status === 'reviewed')
    return matchSearch && matchTab
  })

  async function handleMarkReviewed(item) {
    try {
      await endpoints.revisions.update(item.id, {
        status: 'reviewed',
      })
      toast.success('Marked as reviewed and rescheduled.')
      refetch()
    } catch (err) {
      toast.error(err.message || 'Failed to update revision')
    }
  }

  async function handleCreate(e) {
    e.preventDefault()
    if (!form.topic.trim()) { setFormError('Topic is required'); return }
    setSaving(true)
    try {
      await endpoints.revisions.create({
        topic: form.topic,
        subject_id: form.subject_id || undefined,
        due_date: form.due_date ? new Date(`${form.due_date}T12:00:00`).toISOString() : new Date(Date.now() + 86400000).toISOString(),
      })
      toast.success('Revision item added')
      setModalOpen(false)
      setForm(defaultForm)
      refetch()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  const dueCount = revisions.filter(r =>
    (isOverdue(r.due_date) || isDueToday(r.due_date)) && ['pending', 'reviewed'].includes(r.status)
  ).length

  return (
    <AppLayout>
      <div className="px-5 md:px-8 py-6 max-w-3xl mx-auto">
        <PageHeader
          title="Revision Center"
          description="Track topics you need to revisit"
          action={
            <Button onClick={() => setModalOpen(true)} icon={<Plus size={15} />}>
              Add revision
            </Button>
          }
        />

        <div className="flex items-center gap-4 mb-5">
          <div className="flex items-center gap-1 border border-white/[0.06] rounded-lg p-1">
            {[
              { key: 'due', label: `Due${dueCount > 0 ? ` (${dueCount})` : ''}` },
              { key: 'all', label: 'All' },
              { key: 'reviewed', label: 'Reviewed' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={cn(
                  'px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-150',
                  tab === key
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="relative flex-1">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            <input
              className="w-full rounded-lg border border-white/10 bg-white/5 pl-9 pr-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none transition-colors"
              placeholder="Search topics…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading && <LoadingPage />}
        {error && <ErrorState message={error} onRetry={refetch} />}

        {!loading && !error && (
          <>
            {filtered.length === 0 ? (
              <EmptyState
                icon={<RotateCcw size={24} />}
                title={revisions.length === 0 ? 'No revision items' : 'Nothing here'}
                description={revisions.length === 0
                  ? 'Add topics you want to revise regularly. StudyPilot tracks when to review them.'
                  : 'No items match your current filter.'}
                action={revisions.length === 0 && (
                  <Button onClick={() => setModalOpen(true)} icon={<Plus size={15} />}>
                    Add first topic
                  </Button>
                )}
              />
            ) : (
              <div className="space-y-2.5">
                {filtered.map((r) => (
                  <RevisionCard key={r.id} item={r} onMarkReviewed={handleMarkReviewed} />
                ))}
              </div>
            )}
          </>
        )}

        <Modal open={modalOpen} onClose={() => { setModalOpen(false); setForm(defaultForm); setFormError('') }} title="Add revision item">
          <form onSubmit={handleCreate} className="space-y-4" noValidate>
            <Input
              label="Topic"
              placeholder="e.g. Newton's Laws of Motion"
              value={form.topic}
              onChange={(e) => { setForm(f => ({ ...f, topic: e.target.value })); setFormError('') }}
              error={formError}
            />
            <Select
              label="Subject"
              value={form.subject_id}
              onChange={(e) => setForm(f => ({ ...f, subject_id: e.target.value }))}
            >
              <option value="">No subject</option>
              {(subjects ?? []).map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
            </Select>
            <Input
              label="First review date"
              type="date"
              value={form.due_date}
              onChange={(e) => setForm(f => ({ ...f, due_date: e.target.value }))}
              hint="Leave blank to review tomorrow"
            />
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button type="submit" loading={saving}>Save topic</Button>
            </div>
          </form>
        </Modal>
      </div>
    </AppLayout>
  )
}
