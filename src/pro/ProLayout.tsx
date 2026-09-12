import { Leaf, LayoutGrid, LogOut, Settings } from 'lucide-react'
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
    <div className="min-h-dvh w-full bg-pro-bg flex flex-col md:flex-row">
      <aside className="w-full md:w-64 shrink-0 bg-pro-blue-500 text-white flex md:flex-col p-4 md:p-5 items-center md:items-stretch gap-3 md:gap-0">
        <div className="flex items-center gap-2.5 md:mb-8">
          <div className="w-9 h-9 rounded-xl bg-white text-pro-blue-500 flex items-center justify-center shrink-0">
            <Leaf size={17} strokeWidth={2.5} />
          </div>
          <div className="hidden sm:block">
            <p className="font-display font-semibold leading-none text-[15px]">
              Nutri<span className="text-pro-coral-500">Drive</span>
            </p>
            <p className="text-[11px] text-white/60 leading-none mt-1">Espace praticien</p>
          </div>
        </div>

        <nav className="flex md:flex-col gap-1 flex-1 md:flex-none">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `pro-nav-item flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14px] font-semibold ${
                  isActive ? 'bg-white text-pro-blue-600 shadow-sm' : 'text-white/75 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <Icon size={17} />
              <span className="hidden sm:inline">{label}</span>
              {label === 'Patients' && atRiskCount > 0 && (
                <span className="ml-auto text-[10px] font-bold bg-pro-coral-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
                  {atRiskCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:flex mt-auto flex-col gap-2">
          <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-white/10">
            <div className="w-8 h-8 rounded-full bg-pro-lavender-500 flex items-center justify-center text-[13px] font-bold shrink-0">EM</div>
            <div className="min-w-0 flex-1">
              <p className="text-[12.5px] font-bold truncate">Dr. Elise Marchand</p>
              <p className="text-[10.5px] text-white/60 truncate">Diététicienne</p>
            </div>
            <button onClick={() => navigate('/pro/login')} aria-label="Se déconnecter" className="tap text-white/60 hover:text-white transition-colors">
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

/** Rotation de 4 accents (issus de l'identité praticien) assignés de façon stable par patient, pour
 *  que les avatars ne soient pas tous de la même couleur — cohérent avec les cartes patient du deck. */
const AVATAR_ACCENTS = [
  { bg: 'bg-pro-mint-100', text: 'text-pro-mint-600' },
  { bg: 'bg-pro-coral-100', text: 'text-pro-coral-600' },
  { bg: 'bg-pro-gold-100', text: 'text-pro-gold-600' },
  { bg: 'bg-pro-lavender-100', text: 'text-pro-lavender-600' },
]

function accentFor(seed: string) {
  let hash = 0
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) | 0
  return AVATAR_ACCENTS[Math.abs(hash) % AVATAR_ACCENTS.length]
}

export function PatientAvatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
  const accent = accentFor(name)
  return (
    <div className={`w-10 h-10 rounded-full ${accent.bg} ${accent.text} flex items-center justify-center font-bold text-[13px] shrink-0`}>
      {initials}
    </div>
  )
}
