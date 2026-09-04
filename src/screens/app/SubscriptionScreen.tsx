import { ArrowLeft, Check } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import type { UserProfile } from '../../types'

const PLANS: { name: UserProfile['plan']; price: string; features: string[]; highlight?: boolean }[] = [
  { name: 'Gratuit', price: '0 €', features: ['Calcul BMR / DEJ', 'Socle allergènes illimité', '3 recettes / semaine'] },
  {
    name: 'Starter',
    price: '4,99 €/mois (39 €/an)',
    features: [
      'Planning complet sur 7 jours (contre 3 jours en Gratuit)',
      'Liste de courses de toute la semaine',
      'Allergies, intolérances & préférences illimitées',
      'Calcul métabolique (BMR/TDEE) inclus',
    ],
  },
  {
    name: 'Pro',
    price: '14,99 €/mois',
    highlight: true,
    features: ['Tout Starter', 'Envoi automatique au Drive', 'Mode Duo / Famille', 'Suivi de poids & graphiques'],
  },
  {
    name: 'Ultra',
    price: '24,99 €/mois',
    features: ['Tout Pro', 'Boucle adaptative IA', 'Espace praticien dédié', 'Support prioritaire'],
  },
]

export default function SubscriptionScreen() {
  const navigate = useNavigate()
  const { profile, setProfile } = useApp()

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-cream">
      <div className="px-5 pt-[calc(env(safe-area-inset-top)+18px)] pb-4 flex items-center gap-3 shrink-0">
        <button onClick={() => navigate(-1)} className="tap w-9 h-9 rounded-full bg-black/5 flex items-center justify-center">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-[16px] font-extrabold text-ink">Votre abonnement</h1>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-8 flex flex-col gap-3">
        {PLANS.map((plan) => {
          const active = plan.name === profile.plan
          return (
            <div
              key={plan.name}
              className={`rounded-3xl p-5 border-2 ${
                plan.highlight ? 'border-leaf-500 bg-leaf-50' : active ? 'border-ink bg-white' : 'border-black/5 bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <p className="font-extrabold text-ink text-[16px]">{plan.name}</p>
                {active && <span className="text-[11px] font-bold bg-ink text-cream px-2.5 py-1 rounded-full">Actif</span>}
              </div>
              <p className="text-[13px] text-ink-soft mb-3">{plan.price}</p>
              <ul className="flex flex-col gap-1.5 mb-4">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-[13px] text-ink-soft">
                    <Check size={14} className="text-leaf-600 shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <button
                disabled={active}
                onClick={() => setProfile({ plan: plan.name })}
                className={`tap w-full py-3 rounded-2xl font-bold text-[13.5px] disabled:opacity-40 ${
                  plan.highlight ? 'bg-leaf-500 text-white' : 'bg-ink text-cream'
                }`}
              >
                {active ? 'Formule actuelle' : 'Choisir cette formule'}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
