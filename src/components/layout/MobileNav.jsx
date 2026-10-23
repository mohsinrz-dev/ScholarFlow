import { NavLink } from 'react-router-dom'
import { LayoutDashboard, CalendarDays, BrainCircuit, BarChart2, Settings } from 'lucide-react'
import { cn } from '../../utils'

const items = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { to: '/planner', icon: CalendarDays, label: 'Planner' },
  { to: '/tutor', icon: BrainCircuit, label: 'Tutor' },
  { to: '/analytics', icon: BarChart2, label: 'Analytics' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export function MobileNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 border-t border-white/[0.06] bg-surface-950/90 backdrop-blur-md">
      <div className="flex items-center justify-around px-2 py-2">
        {items.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors text-xs font-medium',
                isActive
                  ? 'text-indigo-400'
                  : 'text-slate-500 hover:text-slate-300'
              )
            }
          >
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

export function TopBar({ title }) {
  return (
    <header className="md:hidden flex items-center gap-3 px-4 py-4 border-b border-white/[0.06] bg-surface-950/90 backdrop-blur-md sticky top-0 z-20">
      <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
        <span className="text-xs font-bold text-white">SP</span>
      </div>
      <h1 className="font-display font-semibold text-slate-100 text-base">{title}</h1>
    </header>
  )
}
