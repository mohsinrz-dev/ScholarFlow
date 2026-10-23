import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, CalendarDays, BrainCircuit, History,
  RotateCcw, BarChart2, Settings, LogOut,
  Sparkles, ChevronLeft, ChevronRight,
} from 'lucide-react'
import { useState } from 'react'
import { cn, getInitials } from '../../utils'
import { auth } from '../../services/auth'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../ui/Toast'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/planner', icon: CalendarDays, label: 'Study Planner' },
  { to: '/tutor', icon: BrainCircuit, label: 'AI Tutor' },
  { to: '/history', icon: History, label: 'Learning History' },
  { to: '/revisions', icon: RotateCcw, label: 'Revision Center' },
  { to: '/analytics', icon: BarChart2, label: 'Analytics' },
]

export function Sidebar() {
  const { user } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Student'

  async function handleSignOut() {
    try {
      await auth.signOut()
      navigate('/signin')
    } catch {
      toast.error('Sign out failed. Please try again.')
    }
  }

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col h-screen sticky top-0 border-r border-white/[0.06]',
        'bg-surface-950 transition-all duration-300 z-30',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      <div className={cn('flex items-center gap-3 px-4 py-5', collapsed && 'justify-center')}>
        <div className="shrink-0 w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
          <Sparkles size={16} className="text-white" />
        </div>
        {!collapsed && (
          <span className="font-display font-bold text-slate-100 text-lg tracking-tight">
            StudyPilot
          </span>
        )}
      </div>

      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                collapsed && 'justify-center',
                isActive
                  ? 'text-indigo-300 bg-indigo-500/10 border border-indigo-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              )
            }
            title={collapsed ? label : undefined}
          >
            <Icon size={17} className="shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-3 border-t border-white/[0.06] space-y-1">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
              collapsed && 'justify-center',
              isActive
                ? 'text-indigo-300 bg-indigo-500/10 border border-indigo-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            )
          }
        >
          <Settings size={17} className="shrink-0" />
          {!collapsed && <span>Settings</span>}
        </NavLink>

        <button
          onClick={handleSignOut}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium',
            'text-slate-400 hover:text-red-400 hover:bg-red-500/5 transition-all duration-150',
            collapsed && 'justify-center'
          )}
        >
          <LogOut size={17} className="shrink-0" />
          {!collapsed && <span>Sign out</span>}
        </button>

        {!collapsed && (
          <div className="flex items-center gap-2.5 px-3 py-2 mt-2 rounded-lg bg-white/[0.03]">
            <div className="w-7 h-7 rounded-full bg-indigo-700 flex items-center justify-center text-xs font-semibold text-white shrink-0">
              {getInitials(displayName)}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-300 truncate">{displayName}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
        )}
      </div>

      <button
        onClick={() => setCollapsed((c) => !c)}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border border-white/10 bg-surface-900 flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  )
}
