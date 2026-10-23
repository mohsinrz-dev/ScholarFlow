import { useState, useRef, useEffect } from 'react'
import { Send, BrainCircuit, RefreshCw, Trash2, Plus } from 'lucide-react'
import { AppLayout } from '../components/layout/AppLayout'
import { Spinner } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { useApi } from '../hooks/useApi'
import { endpoints } from '../services/api'
import { useToast } from '../components/ui/Toast'
import { relativeTime, cn } from '../utils'

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'Hinglish' },
]
const MODES = [
  { value: 'explain', label: 'Explain to me' },
  { value: 'step_by_step', label: 'Step by step' },
  { value: 'quiz', label: 'Quiz me' },
]

function MessageBubble({ message }) {
  const isUser = message.role === 'user'
  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-indigo-600/20 border border-indigo-500/20 flex items-center justify-center mr-2.5 shrink-0 mt-1">
          <BrainCircuit size={13} className="text-indigo-400" />
        </div>
      )}
      <div className={cn(
        'max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
        isUser
          ? 'bg-indigo-600 text-white rounded-br-md'
          : 'bg-white/[0.05] border border-white/[0.07] text-slate-300 rounded-bl-md'
      )}>
        <p className="whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  )
}

function ConversationSidebar({ conversations, activeId, onSelect, onNew, onDelete, loading }) {
  return (
    <div className="hidden md:flex flex-col w-60 shrink-0 border-r border-white/[0.06] h-full overflow-hidden">
      <div className="px-4 py-4 border-b border-white/[0.06]">
        <Button onClick={onNew} size="sm" className="w-full" icon={<Plus size={13} />}>
          New conversation
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
        {loading && (
          <div className="flex justify-center py-6"><Spinner size="sm" /></div>
        )}
        {!loading && conversations?.length === 0 && (
          <p className="text-xs text-slate-600 text-center py-6">No conversations yet</p>
        )}
        {conversations?.map((c) => (
          <button
            key={c.id}
            onClick={() => onSelect(c)}
            className={cn(
              'w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all duration-150 group flex items-start gap-2',
              activeId === c.id
                ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-300'
                : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
            )}
          >
            <div className="flex-1 min-w-0">
              <p className="truncate text-xs font-medium">{c.title || 'Conversation'}</p>
              <p className="text-xs text-slate-600 mt-0.5">{relativeTime(c.created_at)}</p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(c) }}
              className="opacity-0 group-hover:opacity-100 shrink-0 text-slate-600 hover:text-red-400 transition-colors"
            >
              <Trash2 size={11} />
            </button>
          </button>
        ))}
      </div>
    </div>
  )
}

export function Tutor() {
  const toast = useToast()
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  const [activeConv, setActiveConv] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [subject, setSubject] = useState('General')
  const [language, setLanguage] = useState('en')
  const [mode, setMode] = useState('explain')
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState('')

  const { data: conversations, loading: convLoading, refetch: refetchConvs } = useApi(
    () => endpoints.ai.conversations.list(),
    []
  )
  const { data: subjects } = useApi(() => endpoints.subjects.list(), [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function loadConversation(conv) {
    setActiveConv(conv)
    try {
      const data = await endpoints.ai.conversations.get(conv.id)
      setMessages(data?.messages ?? [])
    } catch {
      setMessages([])
    }
  }

  function startNew() {
    setActiveConv(null)
    setMessages([])
    setInput('')
    setSendError('')
    inputRef.current?.focus()
  }

  async function handleSend(e) {
    e.preventDefault()
    const text = input.trim()
    if (!text || sending) return

    const userMsg = { role: 'user', content: text }
    setMessages((m) => [...m, userMsg])
    setInput('')
    setSending(true)
    setSendError('')

    try {
      const res = await endpoints.ai.tutor({
        message: text,
        subject,
        language,
        learning_mode: mode,
        conversation_id: activeConv?.id,
      })

      const aiMsg = res.message
      if (!aiMsg?.content) throw new Error('The AI service returned an invalid response. Please try again.')
      setMessages((m) => [...m, aiMsg])

      if (res.conversation_id && !activeConv) {
        setActiveConv({ id: res.conversation_id, title: text.slice(0, 40) })
        refetchConvs()
      }
    } catch (err) {
      setSendError(err.message || 'The AI tutor is unavailable right now.')
      setMessages((m) => m.slice(0, -1))
    } finally {
      setSending(false)
    }
  }

  async function handleDeleteConv(conv) {
    try {
      await endpoints.ai.conversations.delete(conv.id)
      if (activeConv?.id === conv.id) startNew()
      refetchConvs()
      toast.success('Conversation deleted')
    } catch (err) {
      toast.error(err.message)
    }
  }

  return (
    <AppLayout>
      <div className="flex h-full" style={{ height: 'calc(100vh - 0px)' }}>
        <ConversationSidebar
          conversations={conversations}
          activeId={activeConv?.id}
          onSelect={loadConversation}
          onNew={startNew}
          onDelete={handleDeleteConv}
          loading={convLoading}
        />

        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex items-center justify-between px-5 md:px-6 py-4 border-b border-white/[0.06] shrink-0">
            <div>
              <h1 className="font-display text-lg font-bold text-slate-100">AI Tutor</h1>
              <p className="text-xs text-slate-500">Ask anything — explanations, concepts, problems</p>
            </div>
            <Button onClick={startNew} size="sm" variant="secondary" icon={<Plus size={13} />} className="md:hidden">
              New
            </Button>
          </div>

          <div className="flex items-center gap-3 px-5 md:px-6 py-2.5 border-b border-white/[0.04] shrink-0 overflow-x-auto">
            <select value={subject} onChange={(e) => setSubject(e.target.value)}
              className="rounded-lg border border-white/10 bg-surface-900 px-2.5 py-1.5 text-xs text-slate-400 focus:outline-none whitespace-nowrap">
              <option value="General">General</option>
              {(subjects ?? []).map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}
            </select>
            <select value={mode} onChange={(e) => setMode(e.target.value)}
              className="rounded-lg border border-white/10 bg-surface-900 px-2.5 py-1.5 text-xs text-slate-400 focus:outline-none whitespace-nowrap">
              {MODES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
            <select value={language} onChange={(e) => setLanguage(e.target.value)}
              className="rounded-lg border border-white/10 bg-surface-900 px-2.5 py-1.5 text-xs text-slate-400 focus:outline-none whitespace-nowrap">
              {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
          </div>

          <div className="flex-1 overflow-y-auto px-5 md:px-6 py-5 space-y-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="w-14 h-14 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4">
                  <BrainCircuit size={24} className="text-indigo-400" />
                </div>
                <h3 className="text-base font-semibold text-slate-300 mb-2">Ask the AI Tutor</h3>
                <p className="text-sm text-slate-500 max-w-xs leading-relaxed">
                  Ask a question, request an explanation, or try a quiz on Newton&apos;s laws.
                </p>
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-sm">
                  {[
                    'Explain Newton\'s second law simply',
                    'What is the difference between mitosis and meiosis?',
                    'How do I solve quadratic equations?',
                    'Explain photosynthesis step by step',
                  ].map((q) => (
                    <button
                      key={q}
                      onClick={() => setInput(q)}
                      className="text-left px-3 py-2.5 rounded-lg border border-white/[0.06] bg-white/[0.03] text-xs text-slate-400 hover:border-indigo-500/20 hover:text-slate-300 transition-all"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <MessageBubble key={i} message={msg} />
            ))}

            {sending && (
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-indigo-600/20 border border-indigo-500/20 flex items-center justify-center shrink-0">
                  <BrainCircuit size={13} className="text-indigo-400" />
                </div>
                <div className="bg-white/[0.05] border border-white/[0.07] rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex gap-1">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {sendError && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
                <p className="text-sm text-red-400 flex-1">{sendError}</p>
                <button
                  onClick={() => { setSendError(''); inputRef.current?.focus() }}
                  className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
                >
                  <RefreshCw size={11} /> Retry
                </button>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          <form
            onSubmit={handleSend}
            className="px-5 md:px-6 py-4 border-t border-white/[0.06] shrink-0"
          >
            <div className="flex items-end gap-3">
              <textarea
                ref={inputRef}
                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition-colors resize-none min-h-[44px] max-h-32"
                placeholder="Ask a question…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSend(e)
                  }
                }}
                rows={1}
                disabled={sending}
              />
              <Button
                type="submit"
                disabled={!input.trim() || sending}
                loading={sending}
                icon={<Send size={15} />}
                className="shrink-0"
              >
                Send
              </Button>
            </div>
            <p className="text-xs text-slate-600 mt-2">Press Enter to send · Shift+Enter for new line</p>
          </form>
        </div>
      </div>
    </AppLayout>
  )
}
