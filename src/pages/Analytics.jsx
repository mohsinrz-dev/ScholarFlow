import { AppLayout, PageHeader } from '../components/layout/AppLayout'
import { Card, CardBody, EmptyState, ErrorState, LoadingPage } from '../components/ui/Card'
import { useApi } from '../hooks/useApi'
import { endpoints } from '../services/api'
import { BarChart2 } from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend
} from 'recharts'

const COLORS = ['#818cf8', '#34d399', '#fbbf24', '#f87171', '#a78bfa', '#60a5fa']

const customTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-white/10 bg-surface-900 px-3 py-2 shadow-xl">
      {label && <p className="text-xs text-slate-500 mb-1">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} className="text-xs font-medium" style={{ color: p.color }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  )
}

export function Analytics() {
  const { data, loading, error, refetch } = useApi(
    () => endpoints.analytics.get(),
    []
  )

  const analytics = data

  return (
    <AppLayout>
      <div className="px-5 md:px-8 py-6 max-w-5xl mx-auto">
        <PageHeader
          title="Analytics"
          description="Your study activity based on saved tasks and sessions"
        />

        {loading && <LoadingPage />}
        {error && <ErrorState message={error} onRetry={refetch} />}

        {!loading && !error && !analytics && (
          <EmptyState
            icon={<BarChart2 size={24} />}
            title="No data yet"
            description="Complete tasks and study sessions to see your progress charts here."
          />
        )}

        {analytics && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Tasks completed', value: analytics.tasks?.completed ?? 0 },
                { label: 'Tasks pending', value: analytics.tasks?.pending ?? 0 },
                { label: 'Study sessions', value: analytics.study_time?.session_count ?? 0 },
                { label: 'Study hours', value: analytics.study_time?.total_hours ?? 0 },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-xl border border-white/[0.06] bg-surface-900/60 p-4">
                  <p className="text-xs text-slate-500 mb-1">{label}</p>
                  <p className="text-2xl font-display font-bold text-slate-100">{value}</p>
                </div>
              ))}
            </div>

            {analytics.study_time_by_subject?.length > 0 && (
              <Card>
                <div className="px-5 py-4 border-b border-white/[0.06]">
                  <h2 className="text-sm font-semibold text-slate-300">Study time by subject (minutes)</h2>
                </div>
                <CardBody>
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={analytics.study_time_by_subject.map((item) => ({ date: item.subject || 'Unassigned', count: item.minutes }))} margin={{ left: -10, right: 10, top: 5, bottom: 5 }}>
                      <defs>
                        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                      <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip content={customTooltip} />
                      <Area type="monotone" dataKey="count" name="Minutes" stroke="#6366f1" strokeWidth={2} fill="url(#areaGrad)" dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardBody>
              </Card>
            )}

            {analytics.tasks_by_subject?.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Card>
                  <div className="px-5 py-4 border-b border-white/[0.06]">
                    <h2 className="text-sm font-semibold text-slate-300">Tasks by subject</h2>
                  </div>
                  <CardBody>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={analytics.tasks_by_subject} margin={{ left: -10, right: 10, top: 5, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                        <XAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                        <Tooltip content={customTooltip} />
                        <Bar dataKey="completed" name="Completed" fill="#6366f1" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="pending" name="Pending" fill="#334155" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardBody>
                </Card>

                {analytics.study_time_by_subject?.length > 0 && (
                  <Card>
                    <div className="px-5 py-4 border-b border-white/[0.06]">
                      <h2 className="text-sm font-semibold text-slate-300">Subject distribution</h2>
                    </div>
                    <CardBody className="flex items-center justify-center">
                      <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                          <Pie
                            data={analytics.study_time_by_subject.map((item) => ({ subject: item.subject || 'Unassigned', value: item.minutes }))}
                            dataKey="value"
                            nameKey="subject"
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={85}
                            paddingAngle={3}
                          >
                            {analytics.study_time_by_subject.map((_, i) => (
                              <Cell key={i} fill={COLORS[i % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip content={customTooltip} />
                          <Legend
                            formatter={(v) => <span style={{ color: '#94a3b8', fontSize: 11 }}>{v}</span>}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardBody>
                  </Card>
                )}
              </div>
            )}

            {analytics.study_time?.session_count === 0 && analytics.tasks?.total === 0 && (
              <Card>
                <CardBody>
                  <EmptyState
                    icon={<BarChart2 size={22} />}
                    title="Not enough data for charts"
                    description="Complete more tasks to populate your analytics."
                  />
                </CardBody>
              </Card>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
