import { Link } from 'react-router-dom'
import { CalendarDays, BrainCircuit, Plus, ArrowRight, CheckCircle, Clock, BookOpen, Zap } from 'lucide-react'
import { AppLayout } from '../components/layout/AppLayout'
import { Card, CardBody, SkeletonLine, ErrorState, EmptyState } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { useApi } from '../hooks/useApi'
import { endpoints } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { relativeTime, priorityBg, formatDate, isDueToday, isOverdue } from '../utils'

function StatCard({ label, value, sub, icon: Icon, iconColor }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-surface-900/60 p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-slate-500">{label}</span>
        <Icon size={15} className={iconColor} />
      </div>
      <p className="text-2xl font-display font-bold text-slate-100">{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
    </div>
  )
}

function TaskRow({ task }) {
  const overdue = isOverdue(task.due_date) && task.status !== 'completed'
  const today = isDueToday(task.due_date)

  return (
    <Link
      to={`/planner/tasks/${task.id}`}
      className="flex items-center gap-3 py-3 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] -mx-4 px-4 transition-colors"
    >
      <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
        task.status === 'completed' ? 'bg-emerald-400' :
        overdue ? 'bg-red-400' : today ? 'bg-amber-400' : 'bg-slate-600'
      }`} />
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-medium truncate ${
          task.status === 'completed' ? 'text-slate-500 line-through' : 'text-slate-200'
        }`}>
          {task.title}
        </p>
        {task.subject?.name && <p className="text-xs text-slate-500 truncate">{task.subject.name}</p>}
      </div>
      <div className="shrink-0 flex items-center gap-2">
        {task.priority && (
          <span className={`text-xs px-1.5 py-0.5 rounded border ${priorityBg(task.priority)}`}>
            {task.priority}
          </span>
        )}
        {task.due_date && (
          <span className={`text-xs ${overdue ? 'text-red-400' : today ? 'text-amber-400' : 'text-slate-500'}`}>
            {today ? 'Today' : relativeTime(task.due_date)}
          </span>
        )}
      </div>
    </Link>
  )
}

export function Dashboard() {
  const { user } = useAuth()
  const { data: dashboard, loading, error, refetch } = useApi(
    () => endpoints.dashboard.get(),
    []
  )

  const displayName = (user?.user_metadata?.display_name || user?.user_metadata?.full_name)?.split(' ')[0] || 'there'

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const todayTasks = (dashboard?.tasks_due_today ?? []).slice(0, 5)

  const upcomingTasks = (dashboard?.upcoming_tasks ?? []).slice(0, 3)

  return (
    <AppLayout>
      <div className="px-5 md:px-8 py-6 max-w-5xl mx-auto">
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-slate-100 tracking-tight">
              {greeting()}, {displayName}
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link to="/planner">
              <Button variant="secondary" size="sm" icon={<Plus size={14} />}>
                New task
              </Button>
            </Link>
            <Link to="/tutor">
              <Button size="sm" icon={<BrainCircuit size={14} />}>
                Ask AI
              </Button>
            </Link>
          </div>
        </div>

        {error && <ErrorState message={error} onRetry={refetch} />}

        {loading && !dashboard && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-xl border border-white/[0.06] bg-surface-900/60 p-4">
                <SkeletonLine className="h-3 w-16 mb-3" />
                <SkeletonLine className="h-7 w-12" />
              </div>
            ))}
          </div>
        )}

        {dashboard && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <StatCard
                label="Tasks today"
                value={todayTasks.length}
                sub={`${dashboard.summary?.completed_tasks ?? 0} completed overall`}
                icon={CheckCircle}
                iconColor="text-emerald-400"
              />
              <StatCard
                label="Pending"
                value={dashboard.summary ? dashboard.summary.total_tasks - dashboard.summary.completed_tasks : 0}
                sub="across all subjects"
                icon={Clock}
                iconColor="text-amber-400"
              />
              <StatCard
                label="Subjects"
                value={dashboard.subjects?.length ?? 0}
                sub="being tracked"
                icon={BookOpen}
                iconColor="text-indigo-400"
              />
              <StatCard
                label="Revisions due"
                value={dashboard.revisions_due?.length ?? 0}
                sub="items to review"
                icon={Zap}
                iconColor="text-violet-400"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="md:col-span-2 space-y-5">
                <Card>
                  <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
                    <h2 className="text-sm font-semibold text-slate-300">Today&apos;s tasks</h2>
                    <Link to="/planner" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                      View all <ArrowRight size={12} />
                    </Link>
                  </div>
                  <CardBody className="py-2">
                    {todayTasks.length === 0 ? (
                      <EmptyState
                        icon={<CheckCircle size={22} />}
                        title="All clear for today"
                        description="No tasks due today. Create one to stay on track."
                        action={
                          <Link to="/planner">
                            <Button size="sm" variant="outline">Add a task</Button>
                          </Link>
                        }
                      />
                    ) : (
                      todayTasks.map((t) => <TaskRow key={t.id} task={t} />)
                    )}
                  </CardBody>
                </Card>

                {dashboard.recent_sessions?.length > 0 && (
                  <Card>
                    <div className="px-5 py-4 border-b border-white/[0.06]">
                      <h2 className="text-sm font-semibold text-slate-300">Recent activity</h2>
                    </div>
                    <CardBody className="py-2">
                      {dashboard.recent_sessions.map((a, i) => (
                        <div key={i} className="flex items-start gap-3 py-2.5 border-b border-white/[0.04] last:border-0">
                          <div className="w-5 h-5 rounded bg-indigo-500/10 flex items-center justify-center shrink-0 mt-0.5">
                            <BrainCircuit size={11} className="text-indigo-400" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm text-slate-300 truncate">{a.topic || 'Study session'}</p>
                            <p className="text-xs text-slate-500">{relativeTime(a.started_at)}</p>
                          </div>
                        </div>
                      ))}
                    </CardBody>
                  </Card>
                )}
              </div>

              <div className="space-y-5">
                {dashboard.suggested_action && (
                  <Card>
                    <CardBody>
                      <div className="flex items-center gap-2 mb-2">
                        <Zap size={14} className="text-indigo-400" />
                        <span className="text-xs font-semibold text-indigo-400">Suggested</span>
                      </div>
                      <p className="text-sm text-slate-300 mb-3">{dashboard.suggested_action.message}</p>
                      {dashboard.suggested_action.link && (
                        <Link to={dashboard.suggested_action.link}>
                          <Button size="sm" variant="outline" className="w-full">
                            {dashboard.suggested_action.label || 'Get started'}
                          </Button>
                        </Link>
                      )}
                    </CardBody>
                  </Card>
                )}

                {upcomingTasks.length > 0 && (
                  <Card>
                    <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
                      <h2 className="text-sm font-semibold text-slate-300">Upcoming</h2>
                    </div>
                    <CardBody className="py-2">
                      {upcomingTasks.map((t) => (
                        <div key={t.id} className="flex items-center gap-2.5 py-2.5 border-b border-white/[0.04] last:border-0">
                          <CalendarDays size={13} className="text-slate-500 shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium text-slate-300 truncate">{t.title}</p>
                            <p className="text-xs text-slate-500">{formatDate(t.due_date)}</p>
                          </div>
                        </div>
                      ))}
                    </CardBody>
                  </Card>
                )}

                <Card>
                  <CardBody>
                    <h3 className="text-sm font-semibold text-slate-300 mb-3">Quick actions</h3>
                    <div className="space-y-2">
                      <Link to="/planner" className="flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-white/5 transition-colors group">
                        <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
                          <Plus size={13} className="text-indigo-400" />
                        </div>
                        <span className="text-sm text-slate-400 group-hover:text-slate-200 transition-colors">New task</span>
                      </Link>
                      <Link to="/tutor" className="flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-white/5 transition-colors group">
                        <div className="w-7 h-7 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0">
                          <BrainCircuit size={13} className="text-violet-400" />
                        </div>
                        <span className="text-sm text-slate-400 group-hover:text-slate-200 transition-colors">Ask AI Tutor</span>
                      </Link>
                      <Link to="/revisions" className="flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-white/5 transition-colors group">
                        <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                          <Zap size={13} className="text-amber-400" />
                        </div>
                        <span className="text-sm text-slate-400 group-hover:text-slate-200 transition-colors">Start revision</span>
                      </Link>
                    </div>
                  </CardBody>
                </Card>
              </div>
            </div>
          </>
        )}

        {!loading && !error && !dashboard && (
          <EmptyState
            icon={<BookOpen size={28} />}
            title="Your dashboard is empty"
            description="Start by creating a task or asking the AI tutor a question."
            action={
              <div className="flex gap-3">
                <Link to="/planner"><Button icon={<Plus size={15} />}>Add task</Button></Link>
                <Link to="/tutor"><Button variant="secondary">Open AI tutor</Button></Link>
              </div>
            }
          />
        )}
      </div>
    </AppLayout>
  )
}
