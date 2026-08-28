import { User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

const PLAN_STYLES: Record<string, string> = {
  Gratuit: 'bg-gray-100 text-gray-600',
  Starter: 'bg-leaf-100 text-leaf-700',
  Pro: 'bg-clementine-100 text-clementine-500',
  Ultra: 'bg-ink text-cream',
}

export default function Header({ title }: { title?: string }) {
  const navigate = useNavigate()
  const { profile } = useApp()

  return (
    <header className="flex items-center justify-between px-5 pt-[calc(env(safe-area-inset-top)+14px)] pb-3 bg-cream/95 backdrop-blur border-b border-black/5 shrink-0">
      <button
        onClick={() => navigate('/app/profile')}
        aria-label="Profil et compte"
        className="tap w-10 h-10 rounded-full bg-ink text-cream flex items-center justify-center"
      >
        <User size={18} strokeWidth={2.25} />
      </button>

      {title ? <h1 className="text-[15px] font-bold tracking-tight text-ink">{title}</h1> : <div />}

      <button
        onClick={() => navigate('/app/subscription')}
        className={`tap px-3 py-1.5 rounded-full text-xs font-bold ${PLAN_STYLES[profile.plan]}`}
      >
        {profile.plan}
      </button>
    </header>
  )
}
