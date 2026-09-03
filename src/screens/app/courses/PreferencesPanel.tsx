import { Clock, Coffee, Flame, Wallet, X } from 'lucide-react'
import { useApp } from '../../../context/AppContext'
import { Button } from '../../../components/ui'
import CookingSessionsFields from './CookingSessionsFields'
import MealNeedsFields from './MealNeedsFields'
import type { SnackTiming, TimeBand } from '../../../types'

const TIME_OPTIONS: { value: TimeBand | null; label: string }[] = [
  { value: null, label: 'Peu importe' },
  { value: 'court', label: '< 15 min' },
  { value: 'moyen', label: '15 – 30 min' },
  { value: 'long', label: '30 min +' },
]

const SNACK_TIMING_OPTIONS: { value: SnackTiming; label: string }[] = [
  { value: 'matin', label: 'Le matin' },
  { value: 'apres_midi', label: 'L’après-midi' },
  { value: 'les_deux', label: 'Les deux' },
]

export default function PreferencesPanel({ onClose }: { onClose: () => void }) {
  const { constraints, setConstraints, applyPreferences } = useApp()
  const budgetActive = constraints.weeklyBudget != null

  function apply() {
    applyPreferences()
    onClose()
  }

  return (
    <div className="absolute inset-0 z-20 bg-cream flex flex-col">
      <div className="flex items-center justify-between px-5 pt-[calc(env(safe-area-inset-top)+16px)] pb-3 border-b border-black/5 shrink-0">
        <h1 className="text-lg font-extrabold text-ink">Préférences</h1>
        <button onClick={onClose} className="tap w-8 h-8 rounded-full bg-black/5 flex items-center justify-center" aria-label="Fermer sans régénérer">
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-5 py-5 flex flex-col gap-7">
        <MealNeedsFields />
        <CookingSessionsFields />

        <section>
          <div className="flex items-center gap-2 mb-3">
            <Clock size={15} className="text-leaf-600" />
            <p className="text-[13px] font-bold text-ink uppercase tracking-wide">Temps de préparation</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {TIME_OPTIONS.map((opt) => (
              <button
                key={opt.label}
                onClick={() => setConstraints({ timeBand: opt.value })}
                className={`tap px-3.5 py-2 rounded-full text-[12.5px] font-bold border ${
                  constraints.timeBand === opt.value ? 'bg-ink text-cream border-ink' : 'bg-white text-ink-soft border-black/10'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Coffee size={15} className="text-leaf-600" />
              <p className="text-[13px] font-bold text-ink uppercase tracking-wide">Encas</p>
            </div>
            <button
              onClick={() => setConstraints({ snacks: { ...constraints.snacks, enabled: !constraints.snacks.enabled } })}
              className={`tap px-3.5 py-1.5 rounded-full text-[12px] font-bold ${
                constraints.snacks.enabled ? 'bg-leaf-500 text-white' : 'bg-black/5 text-ink-soft'
              }`}
            >
              {constraints.snacks.enabled ? 'Activés' : 'Désactivés'}
            </button>
          </div>
          {constraints.snacks.enabled && (
            <div className="flex gap-2 fade-up">
              {SNACK_TIMING_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setConstraints({ snacks: { ...constraints.snacks, timing: opt.value } })}
                  className={`tap flex-1 px-2 py-2 rounded-xl text-[12px] font-bold border ${
                    constraints.snacks.timing === opt.value ? 'bg-ink text-cream border-ink' : 'bg-white text-ink-soft border-black/10'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Wallet size={15} className="text-leaf-600" />
              <p className="text-[13px] font-bold text-ink uppercase tracking-wide">Budget</p>
            </div>
            <button
              onClick={() => setConstraints({ weeklyBudget: budgetActive ? null : 50 })}
              className={`tap px-3.5 py-1.5 rounded-full text-[12px] font-bold ${budgetActive ? 'bg-leaf-500 text-white' : 'bg-black/5 text-ink-soft'}`}
            >
              {budgetActive ? 'Maîtrisé' : 'Libre'}
            </button>
          </div>
          {budgetActive && (
            <div className="fade-up">
              <div className="flex justify-between text-[12px] mb-1.5">
                <span className="font-semibold text-ink-soft">Budget hebdomadaire max</span>
                <span className="font-extrabold text-ink">{constraints.weeklyBudget} €</span>
              </div>
              <input
                type="range"
                min={25}
                max={90}
                step={5}
                value={constraints.weeklyBudget ?? 50}
                onChange={(e) => setConstraints({ weeklyBudget: Number(e.target.value) })}
                className="w-full accent-leaf-500"
              />
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame size={15} className="text-leaf-600" />
              <p className="text-[13px] font-bold text-ink uppercase tracking-wide">Profil nutritionnel</p>
            </div>
            <button
              onClick={() => setConstraints({ macroFocus: constraints.macroFocus === 'riche_proteines' ? 'equilibre' : 'riche_proteines' })}
              className={`tap px-3.5 py-1.5 rounded-full text-[12px] font-bold ${
                constraints.macroFocus === 'riche_proteines' ? 'bg-leaf-500 text-white' : 'bg-black/5 text-ink-soft'
              }`}
            >
              {constraints.macroFocus === 'riche_proteines' ? 'Riche en protéines' : 'Équilibré'}
            </button>
          </div>
        </section>
      </div>

      <div className="px-5 pb-[calc(env(safe-area-inset-bottom)+16px)] pt-3 shrink-0 border-t border-black/5">
        <Button full onClick={apply}>
          Valider et régénérer le menu
        </Button>
      </div>
    </div>
  )
}
