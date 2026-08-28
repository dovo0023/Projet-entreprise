import { ArrowLeft, ChevronRight, FileText, KeyRound, LogOut, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { Card } from '../../components/ui'

const ROWS = [
  { icon: KeyRound, label: 'Mot de passe & sécurité' },
  { icon: Users, label: 'Mode Duo / Famille' },
  { icon: FileText, label: 'Historique médical & prescriptions' },
]

export default function ProfileScreen() {
  const navigate = useNavigate()
  const { profile, setProfile } = useApp()

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="px-5 pt-[calc(env(safe-area-inset-top)+18px)] pb-4 flex items-center gap-3 shrink-0">
        <button onClick={() => navigate(-1)} className="tap w-9 h-9 rounded-full bg-black/5 flex items-center justify-center">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-[16px] font-extrabold text-ink">Profil & compte</h1>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-8">
        <Card className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-ink text-cream flex items-center justify-center text-xl font-extrabold">
            {profile.firstName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-extrabold text-ink text-[16px]">{profile.firstName}</p>
            <p className="text-[12px] text-ink-soft/60">{profile.email || 'email@nutriflow.app'}</p>
          </div>
        </Card>

        <div className="mt-5 bg-white rounded-3xl border border-black/5 overflow-hidden">
          {ROWS.map(({ icon: Icon, label }, i) => (
            <button
              key={label}
              onClick={() => label.includes('Duo') && setProfile({ duoMode: !profile.duoMode })}
              className={`tap w-full flex items-center gap-3 px-4 py-4 ${i !== ROWS.length - 1 ? 'border-b border-black/5' : ''}`}
            >
              <div className="w-9 h-9 rounded-xl bg-leaf-50 flex items-center justify-center shrink-0">
                <Icon size={16} className="text-leaf-600" />
              </div>
              <span className="flex-1 text-left text-[14px] font-semibold text-ink">{label}</span>
              {label.includes('Duo') ? (
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${profile.duoMode ? 'bg-leaf-100 text-leaf-700' : 'bg-black/5 text-ink-soft/50'}`}>
                  {profile.duoMode ? 'Activé' : 'Désactivé'}
                </span>
              ) : (
                <ChevronRight size={16} className="text-ink-soft/40" />
              )}
            </button>
          ))}
        </div>

        <button className="tap w-full flex items-center justify-center gap-2 mt-6 py-3.5 rounded-2xl bg-berry-100 text-berry-500 font-bold text-[14px]" onClick={() => navigate('/')}>
          <LogOut size={16} /> Se déconnecter
        </button>
      </div>
    </div>
  )
}
