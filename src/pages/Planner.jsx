import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, CheckCircle, Circle, Trash2, Edit2, Clock, Calendar } from 'lucide-react'
import { AppLayout, PageHeader } from '../components/layout/AppLayout'
import { EmptyState, ErrorState, LoadingPage } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input, Select, Textarea } from '../components/ui/Input'
import { Modal, ConfirmModal } from '../components/ui/Modal'
import { useApi, useDebounce } from '../hooks/useApi'
import { endpoints } from '../services/api'
import { useToast } from '../components/ui/Toast'
import { formatDate, isOverdue, isDueToday, priorityBg, cn } from '../utils'
import { useApi as useApiHook } from '../hooks/useApi'

const PRIORITIES = ['low', 'medium', 'high']
const STATUSES = ['pending', 'in_progress', 'completed']

function TaskCard({ task, onComplete, onDelete, onEdit }) {
  const overdue = isOverdue(task.due_date) && task.status !== 'completed'
  const today = isDueToday(task.due_date)

  return (
    <div className={cn(
      'group flex items-start gap-3 p-4 rounded-xl border transition-all duration-150',
      task.status === 'completed'
        ? 'border-white/[0.04] bg-white/[0.02] opacity-60'
        : 'border-white/[0.06] bg-surface-900/60 hover:border-white/10'
    )}>
      <button
        onClick={() => onComplete(task)}
        className="shrink-0 mt-0.5 text-slate-500 hover:text-emerald-400 transition-colors"
        aria-label={task.status === 'completed' ? 'Mark incomplete' : 'Mark complete'}
      >
        {task.status === 'completed'
          ? <CheckCircle size={18} className="text-emerald-400" />
          : <Circle size={18} />
        }
      </button>

      <div className="flex-1 min-w-0">
        <Link to={`/planner/tasks/${task.id}`}>
          <p className={cn(
            'text-sm font-medium mb-1 hover:text-indigo-300 transition-colors',
            task.status === 'completed' ? 'line-through text-slate-500' : 'text-slate-200'
          )}>
            {task.title}
          </p>
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          {(task.subject?.name || task.subject) && (
            <span className="text-xs text-slate-500">{task.subject?.name || task.subject}</span>
          )}
          {task.priority && (
            <span className={cn('text-xs px-1.5 py-0.5 rounded border', priorityBg(task.priority))}>
              {task.priority}
            </span>
          )}
          {task.due_date && (
            <span className={cn('text-xs flex items-center gap-1',
              overdue ? 'text-red-400' : today ? 'text-amber-400' : 'text-slate-500'
            )}>
              <Calendar size={11} />
              {overdue ? 'Overdue · ' : today ? 'Today · ' : ''}{formatDate(task.due_date)}
            </span>
          )}
          {task.estimated_duration && (
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Clock size={11} />
              {task.estimated_duration}m
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <button
          onClick={() => onEdit(task)}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors"
          aria-label="Edit task"
        >
          <Edit2 size={13} />
        </button>
        <button
          onClick={() => onDelete(task)}
          className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/5 transition-colors"
          aria-label="Delete task"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  )
}

const defaultTaskForm = {
  title: '', subject_id: '', topic: '', priority: 'medium',
  status: 'pending', due_date: '', estimated_duration: '', description: '',
}

function TaskModal({ open, onClose, task, onSaved }) {
  const toast = useToast()
  const [form, setForm] = useState(defaultTaskForm)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const { data: subjects } = useApiHook(() => endpoints.subjects.list(), [])

  useEffect(() => {
    setForm(task ? {
      ...defaultTaskForm,
      ...task,
      subject_id: task.subject_id || '',
      estimated_duration: task.estimated_duration || '',
      due_date: task.due_date ? task.due_date.slice(0, 10) : '',
    } : defaultTaskForm)
    setErrors({})
  }, [task, open])

  function validate() {
    const e = {}
    if (!form.title.trim()) e.title = 'Title is required'
    return e
  }

  async function handleSave() {
    if (loading) return
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length) return

    setLoading(true)
    try {
      const payload = {
        ...form,
        subject_id: form.subject_id || undefined,
        estimated_duration: form.estimated_duration ? Number(form.estimated_duration) : undefined,
        due_date: form.due_date ? new Date(`${form.due_date}T12:00:00`).toISOString() : undefined,
        description: form.description || undefined,
      }
      if (task?.id) {
        await endpoints.tasks.update(task.id, payload)
        toast.success('Task updated')
      } else {
        await endpoints.tasks.create(payload)
        toast.success('Task created')
      }
      onSaved()
      onClose()
    } catch (err) {
      toast.error(err.message || 'Failed to save task')
    } finally {
      setLoading(false)
    }
  }

  const f = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

  return (
    <Modal open={open} onClose={onClose} title={task ? 'Edit task' : 'New task'} size="md">
      <div className="space-y-4">
        <Input label="Title" placeholder="What do you need to study?" value={form.title} onChange={f('title')} error={errors.title} />
        <div className="grid grid-cols-2 gap-3">
          <Select label="Subject" value={form.subject_id} onChange={f('subject_id')}>
            <option value="">No subject</option>
            {(subjects ?? []).map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
          </Select>
          <Input label="Topic" placeholder="e.g. Chapter 5" value={form.topic} onChange={f('topic')} />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Select label="Priority" value={form.priority} onChange={f('priority')}>
            {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
          </Select>
          <Select label="Status" value={form.status} onChange={f('status')}>
            {STATUSES.map(s => <option key={s} value={s}>{s.replace('-', ' ')}</option>)}
          </Select>
          <Input label="Est. minutes" type="number" placeholder="60" value={form.estimated_duration} onChange={f('estimated_duration')} />
        </div>
        <Input label="Due date" type="date" value={form.due_date} onChange={f('due_date')} />
        <Textarea label="Notes" placeholder="Optional notes…" rows={2} value={form.description} onChange={f('description')} />

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} loading={loading}>
            {task ? 'Save changes' : 'Create task'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export function Planner() {
  const toast = useToast()
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterPriority, setFilterPriority] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const debouncedSearch = useDebounce(search, 300)

  const { data: tasksData, loading, error, refetch } = useApi(
    () => endpoints.tasks.list(),
    []
  )

  const tasks = tasksData ?? []

  const filtered = tasks.filter(t => {
    const matchSearch = !debouncedSearch ||
      t.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      (t.subject?.name || '').toLowerCase().includes(debouncedSearch.toLowerCase())
    const matchStatus = !filterStatus || t.status === filterStatus
    const matchPriority = !filterPriority || t.priority === filterPriority
    return matchSearch && matchStatus && matchPriority
  })

  async function handleComplete(task) {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed'
    try {
      await endpoints.tasks.update(task.id, { status: newStatus })
      toast.success(newStatus === 'completed' ? 'Marked complete' : 'Marked incomplete')
      refetch()
    } catch (err) {
      toast.error(err.message || 'Failed to update task')
    }
  }

  async function handleDelete() {
    try {
      await endpoints.tasks.delete(deleteTarget.id)
      toast.success('Task deleted')
      refetch()
    } catch (err) {
      toast.error(err.message || 'Failed to delete task')
    } finally {
      setDeleteTarget(null)
    }
  }

  function openEdit(task) {
    setEditingTask(task)
    setModalOpen(true)
  }

  function openCreate() {
    setEditingTask(null)
    setModalOpen(true)
  }

  return (
    <AppLayout>
      <div className="px-5 md:px-8 py-6 max-w-4xl mx-auto">
        <PageHeader
          title="Study Planner"
          description="Create and manage your study tasks"
          action={
            <Button onClick={openCreate} icon={<Plus size={15} />}>
              New task
            </Button>
          }
        />

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            <input
              className="w-full rounded-lg border border-white/10 bg-white/5 pl-9 pr-3 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition-colors"
              placeholder="Search tasks…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="rounded-lg border border-white/10 bg-surface-900 px-3 py-2.5 text-sm text-slate-400 focus:border-indigo-500 focus:outline-none"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">All statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{s.replace('-', ' ')}</option>)}
          </select>
          <select
            className="rounded-lg border border-white/10 bg-surface-900 px-3 py-2.5 text-sm text-slate-400 focus:border-indigo-500 focus:outline-none"
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
          >
            <option value="">All priorities</option>
            {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        {loading && <LoadingPage />}
        {error && <ErrorState message={error} onRetry={refetch} />}

        {!loading && !error && (
          <>
            {filtered.length === 0 ? (
              <EmptyState
                icon={<CheckCircle size={24} />}
                title={tasks.length === 0 ? 'No tasks yet' : 'No tasks match your filters'}
                description={tasks.length === 0
                  ? 'Create your first study task to get started.'
                  : 'Try adjusting your search or filters.'}
                action={tasks.length === 0 && (
                  <Button onClick={openCreate} icon={<Plus size={15} />}>Create task</Button>
                )}
              />
            ) : (
              <div className="space-y-2.5">
                {filtered.map((t) => (
                  <TaskCard
                    key={t.id}
                    task={t}
                    onComplete={handleComplete}
                    onDelete={setDeleteTarget}
                    onEdit={openEdit}
                  />
                ))}
              </div>
            )}
          </>
        )}

        <TaskModal
          open={modalOpen}
          onClose={() => { setModalOpen(false); setEditingTask(null) }}
          task={editingTask}
          onSaved={refetch}
        />

        <ConfirmModal
          open={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          title="Delete task"
          description={`Delete "${deleteTarget?.title}"? This cannot be undone.`}
          confirmLabel="Delete"
          danger
        />
      </div>
    </AppLayout>
  )
}
