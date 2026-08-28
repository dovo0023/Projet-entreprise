import { CalendarDays, ShoppingBasket, Sparkles, TrendingUp } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const TABS = [
  { to: '/app/planning', label: 'Planning', icon: CalendarDays },
  { to: '/app/today', label: 'Aujourd’hui', icon: Sparkles },
  { to: '/app/shopping', label: 'Courses', icon: ShoppingBasket },
  { to: '/app/progress', label: 'Progression', icon: TrendingUp },
]

export default function BottomNav() {
  return (
    <nav className="shrink-0 bg-cream/95 backdrop-blur border-t border-black/5 pb-[calc(env(safe-area-inset-bottom)+6px)] pt-2 px-2">
      <ul className="flex items-stretch justify-between">
        {TABS.map(({ to, label, icon: Icon }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              className={({ isActive }) =>
                `tap flex flex-col items-center gap-1 py-1.5 rounded-2xl mx-1 transition-colors ${
                  isActive ? 'text-leaf-600' : 'text-ink-soft/60'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={`w-9 h-9 rounded-full flex items-center justify-center ${isActive ? 'bg-leaf-100' : ''}`}>
                    <Icon size={19} strokeWidth={isActive ? 2.4 : 2} />
                  </span>
                  <span className={`text-[10px] ${isActive ? 'font-bold' : 'font-medium'}`}>{label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
