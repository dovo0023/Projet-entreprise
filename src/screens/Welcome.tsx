import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui'

export default function Welcome() {
  const navigate = useNavigate()

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

      <div className="fade-up flex flex-col gap-3" style={{ animationDelay: '80ms' }}>
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
    </div>
  )
}
