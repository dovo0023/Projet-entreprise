import { ChefHat, Clock, Coffee, Flame, Minus, Plus, Thermometer, Wallet, X } from 'lucide-react'
import { useApp } from '../../../context/AppContext'
import { computeBatches } from '../../../engine/planner'
import { Button } from '../../../components/ui'
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

const MEAL_SLOTS: { key: 'midi' | 'soir'; label: string }[] = [
  { key: 'midi', label: 'Midi' },
  { key: 'soir', label: 'Soir' },
]

/** Résume le regroupement en lots pour l'aide contextuelle (ex. "≈ 1 recette pour 3 jours d'affilée"). */
function batchHint(sessions: number): string {
  if (sessions >= 7) return 'Une recette différente possible chaque jour.'
  const sizes = computeBatches(sessions).map((b) => b.length)
  const maxSize = Math.max(...sizes)
  return `1 recette cuisinée en une fois, reconduite jusqu’à ${maxSize} jour${maxSize > 1 ? 's' : ''} d’affilée.`
}

function Stepper({ value, min, max, onChange }: { value: number; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-2.5 shrink-0">
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="tap w-7 h-7 rounded-full bg-white border border-black/10 flex items-center justify-center disabled:opacity-30"
        aria-label="Diminuer"
      >
        <Minus size={13} />
      </button>
      <span className="font-extrabold text-ink text-[15px] w-5 text-center">{value}</span>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="tap w-7 h-7 rounded-full bg-white border border-black/10 flex items-center justify-center disabled:opacity-30"
        aria-label="Augmenter"
      >
        <Plus size={13} />
      </button>
    </div>
  )
}

export default function PreferencesPanel({ onClose }: { onClose: () => void }) {
  const { constraints, setConstraints, applyPreferences } = useApp()
  const budgetActive = constraints.weeklyBudget != null

  function apply() {
    applyPreferences()
    onClose()
  }

  function setSessions(slot: 'midi' | 'soir', next: number) {
    const clamped = Math.max(1, Math.min(7, next))
    const currentHot = constraints.hotSessions[slot]
    setConstraints({
      cookingSessions: { ...constraints.cookingSessions, [slot]: clamped },
      hotSessions: { ...constraints.hotSessions, [slot]: currentHot == null ? null : Math.min(currentHot, clamped) },
    })
  }

  function toggleHotPreference(slot: 'midi' | 'soir') {
    const active = constraints.hotSessions[slot] != null
    setConstraints({
      hotSessions: { ...constraints.hotSessions, [slot]: active ? null : Math.ceil(constraints.cookingSessions[slot] / 2) },
    })
  }

  function setHotCount(slot: 'midi' | 'soir', value: number) {
    setConstraints({ hotSessions: { ...constraints.hotSessions, [slot]: value } })
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
        <section>
          <div className="flex items-center gap-2 mb-1">
            <ChefHat size={15} className="text-leaf-600" />
            <p className="text-[13px] font-bold text-ink uppercase tracking-wide">Sessions de cuisine</p>
          </div>
          <p className="text-[12px] text-ink-soft/70 mb-3">
            Combien de fois comptez-vous cuisiner cette semaine ? En dessous de 7, on prévoit plus grand pour cuisiner en une fois et manger
            les jours suivants (ex. 1 kg de poulet cuisiné une fois pour plusieurs repas).
          </p>
          <div className="flex flex-col gap-2">
            {MEAL_SLOTS.map(({ key, label }) => (
              <div key={key} className="bg-black/[0.03] rounded-2xl px-4 py-3">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-[13px] text-ink">{label}</p>
                  <Stepper value={constraints.cookingSessions[key]} min={1} max={7} onChange={(v) => setSessions(key, v)} />
                </div>
                <p className="text-[11.5px] text-ink-soft/60 mt-1">{batchHint(constraints.cookingSessions[key])}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <Thermometer size={15} className="text-leaf-600" />
            <p className="text-[13px] font-bold text-ink uppercase tracking-wide">Répartition chaud / froid</p>
          </div>
          <div className="flex flex-col gap-2">
            {MEAL_SLOTS.map(({ key, label }) => {
              const sessions = constraints.cookingSessions[key]
              const hot = constraints.hotSessions[key]
              const active = hot != null
              return (
                <div key={key} className="bg-black/[0.03] rounded-2xl px-4 py-3">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-[13px] text-ink">{label}</p>
                    <button
                      onClick={() => toggleHotPreference(key)}
                      className={`tap px-3 py-1.5 rounded-full text-[12px] font-bold ${active ? 'bg-leaf-500 text-white' : 'bg-white text-ink-soft border border-black/10'}`}
                    >
                      {active ? `${hot} chaud${hot > 1 ? 's' : ''} / ${sessions}` : 'Peu importe'}
                    </button>
                  </div>
                  {active && (
                    <div className="fade-up mt-2.5">
                      <input
                        type="range"
                        min={0}
                        max={sessions}
                        step={1}
                        value={hot ?? 0}
                        onChange={(e) => setHotCount(key, Number(e.target.value))}
                        className="w-full accent-leaf-500"
                      />
                      <div className="flex justify-between text-[11px] text-ink-soft/50 mt-0.5">
                        <span>0 chaud</span>
                        <span>{sessions} chaud{sessions > 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>

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
