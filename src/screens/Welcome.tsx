import { Stethoscope, User } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui'

type Role = 'patient' | 'praticien'

export default function Welcome() {
  const navigate = useNavigate()
  const [role, setRole] = useState<Role>('patient')

  return (
    <div className="flex-1 flex flex-col justify-between px-7 pt-16 pb-10 bg-gradient-to-b from-leaf-50 to-cream overflow-y-auto no-scrollbar">
      <div className="fade-up flex flex-col items-center text-center mt-10">
        <div className="w-20 h-20 rounded-3xl bg-ink text-cream flex items-center justify-center text-3xl font-black mb-6 shadow-lg shadow-black/10">
          N
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-ink">NutriFlow</h1>
        <p className="mt-3 text-[15px] text-ink-soft leading-relaxed max-w-[280px]">
          Votre nutrition sur mesure, livrée dans votre coffre.
        </p>
      </div>

      <div className="fade-up flex flex-col gap-4" style={{ animationDelay: '80ms' }}>
        <div>
          <p className="text-[12px] font-bold text-ink-soft/60 text-center mb-2">Vous êtes…</p>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => setRole('patient')}
              className={`tap flex flex-col items-center gap-1.5 rounded-2xl border-2 py-3.5 ${
                role === 'patient' ? 'border-leaf-500 bg-leaf-50' : 'border-black/10 bg-white'
              }`}
            >
              <User size={18} className={role === 'patient' ? 'text-leaf-600' : 'text-ink-soft/50'} />
              <span className={`text-[13px] font-bold ${role === 'patient' ? 'text-leaf-700' : 'text-ink-soft'}`}>Un(e) patient(e)</span>
            </button>
            <button
              onClick={() => setRole('praticien')}
              className={`tap flex flex-col items-center gap-1.5 rounded-2xl border-2 py-3.5 ${
                role === 'praticien' ? 'border-leaf-500 bg-leaf-50' : 'border-black/10 bg-white'
              }`}
            >
              <Stethoscope size={18} className={role === 'praticien' ? 'text-leaf-600' : 'text-ink-soft/50'} />
              <span className={`text-[13px] font-bold ${role === 'praticien' ? 'text-leaf-700' : 'text-ink-soft'}`}>Un(e) praticien(ne)</span>
            </button>
          </div>
        </div>

        {role === 'patient' ? (
          <div className="fade-up flex flex-col gap-3">
            <Button full onClick={() => navigate('/onboarding')}>
              S’inscrire
            </Button>
            <Button full variant="secondary" onClick={() => navigate('/login')}>
              Se connecter
            </Button>

            <div className="flex items-center gap-3 my-2">
              <div className="h-px flex-1 bg-black/10" />
              <span className="text-[11px] text-ink-soft/60 font-medium">ou en 1 clic</span>
              <div className="h-px flex-1 bg-black/10" />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => navigate('/onboarding')}
                className="tap flex-1 flex items-center justify-center gap-2 rounded-2xl border border-black/10 bg-white py-3 text-[13px] font-bold text-ink"
              >
                <span className="text-[15px]">G</span> Google
              </button>
              <button
                onClick={() => navigate('/onboarding')}
                className="tap flex-1 flex items-center justify-center gap-2 rounded-2xl border border-black/10 bg-white py-3 text-[13px] font-bold text-ink"
              >
                <span className="text-[15px]"></span> Apple
              </button>
            </div>
          </div>
        ) : (
          <div className="fade-up flex flex-col gap-3">
            <p className="text-[12.5px] text-ink-soft text-center leading-relaxed px-2">
              Suivez l’observance réelle de vos patients depuis votre espace praticien dédié.
            </p>
            <Button full variant="dark" onClick={() => navigate('/pro/login')}>
              Accéder à mon espace praticien
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
