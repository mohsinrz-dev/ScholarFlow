import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, CheckCircle, Circle, Trash2, Edit2, Calendar, Clock, Tag } from 'lucide-react'
import { AppLayout } from '../components/layout/AppLayout'
import { Card, CardBody, LoadingPage, ErrorState } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { ConfirmModal, Modal } from '../components/ui/Modal'
import { Input, Select, Textarea } from '../components/ui/Input'
import { useApi } from '../hooks/useApi'
import { endpoints } from '../services/api'
import { useToast } from '../components/ui/Toast'
import { formatDate, priorityBg, statusBg, isOverdue, isDueToday } from '../utils'

export function TaskDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [savingSession, setSavingSession] = useState(false)
  const [sessionStartedAt, setSessionStartedAt] = useState(() => localStorage.getItem(`studypilot-session-${id}`))
  const [editForm, setEditForm] = useState({ title: '', topic: '', description: '', due_date: '', priority: 'medium', status: 'pending', estimated_duration: '' })

  const { data: task, loading, error, refetch } = useApi(
    () => endpoints.tasks.get(id),
    [id]
  )

  useEffect(() => {
    if (task) setEditForm({
      title: task.title ?? '', topic: task.topic ?? '', description: task.description ?? '',
      due_date: task.due_date ? task.due_date.slice(0, 10) : '', priority: task.priority ?? 'medium',
      status: task.status ?? 'pending', estimated_duration: task.estimated_duration ?? '',
    })
  }, [task])

  async function handleToggleComplete() {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed'
    try {
      await endpoints.tasks.update(id, { status: newStatus })
      toast.success(newStatus === 'completed' ? 'Marked complete' : 'Marked incomplete')
      refetch()
    } catch (err) {
      toast.error(err.message)
    }
  }

  async function handleDelete() {
    try {
      await endpoints.tasks.delete(id)
      toast.success('Task deleted')
      navigate('/planner')
    } catch (err) {
      toast.error(err.message)
    }
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!editForm.title.trim() || saving) return
    setSaving(true)
    try {
      await endpoints.tasks.update(id, {
        ...editForm,
        due_date: editForm.due_date ? new Date(`${editForm.due_date}T12:00:00`).toISOString() : null,
        estimated_duration: editForm.estimated_duration ? Number(editForm.estimated_duration) : null,
      })
      setEditOpen(false)
      refetch()
      toast.success('Task updated')
    } catch (err) {
      toast.error(err.message || 'Failed to update task')
    } finally {
      setSaving(false)
    }
  }

  async function handleSession() {
    if (!sessionStartedAt) {
      const startedAt = new Date().toISOString()
      localStorage.setItem(`studypilot-session-${id}`, startedAt)
      setSessionStartedAt(startedAt)
      return
    }
    const endedAt = new Date()
    const startedAt = new Date(sessionStartedAt)
    if (savingSession) return
    if (endedAt <= startedAt) return
    setSavingSession(true)
    try {
      const sessionEndedAt = new Date()
      await endpoints.sessions.create({
        task_id: id,
        subject_id: task.subject_id || undefined,
        topic: task.topic || task.title,
        started_at: startedAt.toISOString(),
        ended_at: sessionEndedAt.toISOString(),
      })
      localStorage.removeItem(`studypilot-session-${id}`)
      setSessionStartedAt(null)
      toast.success('Study session saved')
    } catch (err) {
      toast.error(err.message || 'Failed to save study session')
    } finally {
      setSavingSession(false)
    }
  }

  return (
    <AppLayout>
      <div className="px-5 md:px-8 py-6 max-w-2xl mx-auto">
        <Link
          to="/planner"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 transition-colors mb-6"
        >
          <ArrowLeft size={14} /> Back to planner
        </Link>

        {loading && <LoadingPage />}
        {error && <ErrorState message={error} onRetry={refetch} />}

        {task && (
          <>
            <div className="flex items-start gap-3 mb-6">
              <button
                onClick={handleToggleComplete}
                className="shrink-0 mt-1 text-slate-500 hover:text-emerald-400 transition-colors"
              >
                {task.status === 'completed'
                  ? <CheckCircle size={22} className="text-emerald-400" />
                  : <Circle size={22} />
                }
              </button>
              <div className="flex-1 min-w-0">
                <h1 className={`font-display text-2xl font-bold tracking-tight ${
                  task.status === 'completed' ? 'line-through text-slate-500' : 'text-slate-100'
                }`}>
                  {task.title}
                </h1>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  {task.status && (
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${statusBg(task.status)}`}>
                      {task.status.replace('-', ' ')}
                    </span>
                  )}
                  {task.priority && (
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${priorityBg(task.priority)}`}>
                      {task.priority} priority
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button variant="secondary" size="sm" icon={<Edit2 size={13} />}
                  onClick={() => setEditOpen(true)}>
                  Edit
                </Button>
                <Button variant="secondary" size="sm" onClick={handleSession}>
                  {sessionStartedAt ? 'Stop session' : 'Start session'}
                </Button>
                <Button variant="secondary" size="sm" icon={<Trash2 size={13} />}
                  className="text-red-400 hover:bg-red-500/10 hover:border-red-500/20"
                  onClick={() => setDeleteOpen(true)}>
                  Delete
                </Button>
              </div>
            </div>

            <Card>
              <CardBody>
                <dl className="space-y-4">
                  {task.subject?.name && (
                    <div className="flex items-center gap-2">
                      <Tag size={14} className="text-slate-500 shrink-0" />
                      <dt className="text-xs text-slate-500 w-24 shrink-0">Subject</dt>
                      <dd className="text-sm text-slate-300">{task.subject.name}</dd>
                    </div>
                  )}
                  {task.topic && (
                    <div className="flex items-center gap-2">
                      <Tag size={14} className="text-slate-500 shrink-0" />
                      <dt className="text-xs text-slate-500 w-24 shrink-0">Topic</dt>
                      <dd className="text-sm text-slate-300">{task.topic}</dd>
                    </div>
                  )}
                  {task.due_date && (
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className={`shrink-0 ${
                        isOverdue(task.due_date) && task.status !== 'completed' ? 'text-red-400' :
                        isDueToday(task.due_date) ? 'text-amber-400' : 'text-slate-500'
                      }`} />
                      <dt className="text-xs text-slate-500 w-24 shrink-0">Due</dt>
                      <dd className={`text-sm ${
                        isOverdue(task.due_date) && task.status !== 'completed' ? 'text-red-400' :
                        isDueToday(task.due_date) ? 'text-amber-400' : 'text-slate-300'
                      }`}>{formatDate(task.due_date)}</dd>
                    </div>
                  )}
                  {task.estimated_duration && (
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-slate-500 shrink-0" />
                      <dt className="text-xs text-slate-500 w-24 shrink-0">Estimated</dt>
                      <dd className="text-sm text-slate-300">{task.estimated_duration} minutes</dd>
                    </div>
                  )}
                </dl>
              </CardBody>
            </Card>

            {task.description && (
              <Card className="mt-4">
                <div className="px-5 py-4 border-b border-white/[0.06]">
                  <h2 className="text-sm font-semibold text-slate-300">Notes</h2>
                </div>
                <CardBody>
                  <p className="text-sm text-slate-400 leading-relaxed whitespace-pre-wrap">{task.description}</p>
                </CardBody>
              </Card>
            )}
          </>
        )}

        <ConfirmModal
          open={deleteOpen}
          onClose={() => setDeleteOpen(false)}
          onConfirm={handleDelete}
          title="Delete task"
          description={`Delete "${task?.title}"? This cannot be undone.`}
          confirmLabel="Delete"
          danger
        />
        <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit task">
          <form onSubmit={handleSave} className="space-y-4">
            <Input label="Title" value={editForm.title} onChange={(event) => setEditForm({ ...editForm, title: event.target.value })} required />
            <Input label="Topic" value={editForm.topic} onChange={(event) => setEditForm({ ...editForm, topic: event.target.value })} />
            <Textarea label="Description" value={editForm.description} onChange={(event) => setEditForm({ ...editForm, description: event.target.value })} rows={3} />
            <div className="grid grid-cols-2 gap-3">
              <Select label="Priority" value={editForm.priority} onChange={(event) => setEditForm({ ...editForm, priority: event.target.value })}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></Select>
              <Select label="Status" value={editForm.status} onChange={(event) => setEditForm({ ...editForm, status: event.target.value })}><option value="pending">Pending</option><option value="in_progress">In progress</option><option value="completed">Completed</option></Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Due date" type="date" value={editForm.due_date} onChange={(event) => setEditForm({ ...editForm, due_date: event.target.value })} />
              <Input label="Estimated minutes" type="number" min="1" max="1440" value={editForm.estimated_duration} onChange={(event) => setEditForm({ ...editForm, estimated_duration: event.target.value })} />
            </div>
            <div className="flex justify-end gap-3"><Button type="button" variant="secondary" onClick={() => setEditOpen(false)}>Cancel</Button><Button type="submit" loading={saving}>Save changes</Button></div>
          </form>
        </Modal>
      </div>
    </AppLayout>
  )
}
