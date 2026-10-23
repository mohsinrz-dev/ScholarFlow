import { useState } from 'react'
import { History, Search, Calendar, Clock } from 'lucide-react'
import { AppLayout, PageHeader } from '../components/layout/AppLayout'
import { Card, EmptyState, ErrorState, LoadingPage } from '../components/ui/Card'
import { useApi, useDebounce } from '../hooks/useApi'
import { endpoints } from '../services/api'
import { formatDate, relativeTime, groupBy } from '../utils'

function HistoryItem({ item }) {
  return (
    <div className="flex items-start gap-3 py-3.5 border-b border-white/[0.04] last:border-0">
      <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0 mt-0.5">
        <Clock size={14} className="text-indigo-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-300 mb-0.5 truncate">{item.topic || 'Study session'}</p>
        {item.subject?.name && <p className="text-xs text-slate-500">{item.subject.name}</p>}
        {item.notes && (
          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{item.notes}</p>
        )}
      </div>
      <div className="text-xs text-slate-600 shrink-0">{relativeTime(item.started_at || item.created_at)}</div>
    </div>
  )
}

export function LearningHistory() {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)

  const { data, loading, error, refetch } = useApi(
    () => endpoints.history.list(),
    []
  )

  const history = data ?? []

  const filtered = history.filter(h =>
    !debouncedSearch ||
    h.subject?.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    h.topic?.toLowerCase().includes(debouncedSearch.toLowerCase())
  )

  const grouped = groupBy(filtered, (h) => {
    const d = new Date(h.started_at || h.created_at)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (d.toDateString() === today.toDateString()) return 'Today'
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
    return formatDate(d, { month: 'long', year: 'numeric' })
  })

  return (
    <AppLayout>
      <div className="px-5 md:px-8 py-6 max-w-3xl mx-auto">
        <PageHeader
          title="Study History"
          description="Your recorded study sessions and topics"
        />

        <div className="relative mb-6">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          <input
            className="w-full rounded-lg border border-white/10 bg-white/5 pl-9 pr-3 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition-colors"
            placeholder="Search topics, subjects…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading && <LoadingPage />}
        {error && <ErrorState message={error} onRetry={refetch} />}

        {!loading && !error && (
          <>
            {filtered.length === 0 ? (
              <EmptyState
                icon={<History size={24} />}
                title={history.length === 0 ? 'No history yet' : 'Nothing matches your search'}
                description={history.length === 0
                  ? 'Your study sessions and topics will appear here.'
                  : 'Try different search terms.'}
              />
            ) : (
              <div className="space-y-5">
                {Object.entries(grouped).map(([date, items]) => (
                  <Card key={date}>
                    <div className="px-5 py-3 border-b border-white/[0.06]">
                      <h3 className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                        <Calendar size={12} />
                        {date}
                      </h3>
                    </div>
                    <div className="px-5 py-1">
                      {items.map((item, i) => (
                        <HistoryItem key={item.id || i} item={item} />
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  )
}
