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

/** Couleur d'en-tête par palier dans le tableau comparatif — reprend la palette déjà utilisée ailleurs
 *  dans l'app (Gratuit en neutre, puis leaf/clementine/berry pour Starter/Pro/Ultra). */
const PLAN_HEADER_CLASS: Record<UserProfile['plan'], string> = {
  Gratuit: 'bg-ink-soft',
  Starter: 'bg-leaf-500',
  Pro: 'bg-clementine-500',
  Ultra: 'bg-berry-500',
}

const BLOCKED = '—'

/** Tableau comparatif détaillé (jours × colonnes) : la vue d'ensemble des fonctionnalités par palier —
 *  distinct des cartes ci-dessous qui, elles, servent à choisir/activer une formule. */
const COMPARISON_ROWS: { label: string; values: [string, string, string, string] }[] = [
  { label: 'Tarif mensuel', values: ['0 €', '4,99 €', '9,99 €', '19,99 €'] },
  { label: 'Tarif annuel équivalent', values: ['0 €', '39 €/an', '79 €/an', '159 €/an'] },
  { label: 'Allergies & préférences', values: ['Illimité', 'Illimité', 'Illimité', 'Illimité'] },
  { label: 'Calcul métabolique', values: ['Inclus', 'Inclus', 'Inclus', 'Inclus'] },
  { label: 'Génération du menu', values: ['3 j / semaine', '7 j / semaine', '7 j / semaine', '7 j adaptatif'] },
  { label: 'Fraîcheur (DLC)', values: ['Standard', 'Standard', 'Tri J1→J7', 'Tri J1→J7'] },
  { label: 'Macros (P/G/L)', values: ['Standard', 'Standard', 'Au gramme près', 'Au gramme près'] },
  { label: 'Filtres temps & rythme', values: [BLOCKED, BLOCKED, '<15 min, chaud/froid, jeûne', '<15 min, chaud/froid, jeûne'] },
  { label: 'Plafond budgétaire', values: [BLOCKED, BLOCKED, 'Inclus (€/semaine)', 'Inclus (€/semaine)'] },
  { label: 'Profils du foyer', values: ['1', '1', 'Jusqu’à 2', 'Jusqu’à 4'] },
  { label: 'Export panier drive', values: [BLOCKED, BLOCKED, 'Inclus (1 clic)', 'Inclus (1 clic)'] },
  { label: 'Liaison espace praticien', values: [BLOCKED, BLOCKED, BLOCKED, 'Inclus'] },
  { label: 'Micronutrition & carb-cycling', values: [BLOCKED, BLOCKED, BLOCKED, 'Inclus (Athlètes/Clinique)'] },
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

      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-8 flex flex-col gap-6">
        <div>
          <p className="text-[12px] font-bold text-ink-soft/60 uppercase tracking-wide mb-2">Comparer les formules</p>
          <div className="overflow-x-auto -mx-5 px-5 no-scrollbar">
            <table className="border-separate border-spacing-0 text-[11.5px]" style={{ minWidth: 560 }}>
              <thead>
                <tr>
                  <th className="sticky left-0 z-10 bg-cream w-[118px]" />
                  {PLANS.map((plan) => (
                    <th
                      key={plan.name}
                      className={`text-white font-extrabold text-[12.5px] py-2.5 px-2 w-[110px] ${PLAN_HEADER_CLASS[plan.name]} ${
                        plan.name === profile.plan ? 'ring-2 ring-inset ring-ink' : ''
                      }`}
                    >
                      {plan.name}
                      {plan.name === profile.plan && <div className="text-[9.5px] font-bold opacity-80 mt-0.5">Actif</div>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row, rowIdx) => (
                  <tr key={row.label} className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-black/[0.02]'}>
                    <td className="sticky left-0 z-10 font-bold text-ink-soft px-2.5 py-2.5 w-[118px]" style={{ background: 'inherit' }}>
                      {row.label}
                    </td>
                    {row.values.map((value, i) => (
                      <td
                        key={i}
                        className={`px-2 py-2.5 text-center w-[110px] ${
                          value === BLOCKED ? 'text-ink-soft/30' : 'text-ink font-semibold'
                        }`}
                      >
                        {value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <p className="text-[12px] font-bold text-ink-soft/60 uppercase tracking-wide mb-2">Choisir une formule</p>
          <div className="flex flex-col gap-3">
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
      </div>
    </div>
  )
}
