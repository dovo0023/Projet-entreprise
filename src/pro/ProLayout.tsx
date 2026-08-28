import { LayoutGrid, LogOut, Settings, Smartphone } from 'lucide-react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { PATIENTS } from '../data/patients'

const NAV = [
  { to: '/pro', label: 'Patients', icon: LayoutGrid, end: true },
  { to: '/pro/compte', label: 'Mon compte', icon: Settings, end: false },
]

export default function ProLayout() {
  const navigate = useNavigate()
  const atRiskCount = PATIENTS.filter((p) => p.riskFlags.length > 0).length

  return (
    <div className="min-h-dvh w-full bg-[#f3f1ea] flex">
      <aside className="w-64 shrink-0 bg-ink text-cream flex flex-col p-5">
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-9 h-9 rounded-xl bg-cream text-ink flex items-center justify-center font-black">N</div>
          <div>
            <p className="font-extrabold leading-none">NutriFlow</p>
            <p className="text-[11px] text-cream/50 leading-none mt-0.5">Espace praticien</p>
          </div>
        </div>

        <nav className="flex flex-col gap-1">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14px] font-semibold transition-colors ${
                  isActive ? 'bg-cream text-ink' : 'text-cream/70 hover:bg-cream/10'
                }`
              }
            >
              <Icon size={17} />
              {label}
              {label === 'Patients' && atRiskCount > 0 && (
                <span className="ml-auto text-[10px] font-bold bg-berry-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
                  {atRiskCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-2">
          <button
            onClick={() => navigate('/')}
            className="tap flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-[13px] font-semibold text-cream/70 hover:bg-cream/10"
          >
            <Smartphone size={16} /> Voir l’app patient
          </button>
          <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-cream/5">
            <div className="w-8 h-8 rounded-full bg-berry-400 flex items-center justify-center text-[13px] font-bold shrink-0">EM</div>
            <div className="min-w-0 flex-1">
              <p className="text-[12.5px] font-bold truncate">Dr. Elise Marchand</p>
              <p className="text-[10.5px] text-cream/50 truncate">Diététicienne</p>
            </div>
            <button onClick={() => navigate('/pro/login')} aria-label="Se déconnecter" className="tap text-cream/50 hover:text-cream">
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 min-w-0 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}

export function PatientAvatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
  return <div className="w-10 h-10 rounded-full bg-leaf-100 text-leaf-700 flex items-center justify-center font-bold text-[13px] shrink-0">{initials}</div>
}
