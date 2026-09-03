import { ChefHat, Minus, Plus, Thermometer } from 'lucide-react'
import { useApp } from '../../../context/AppContext'
import { computeBatches } from '../../../engine/planner'

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

/** Champs "Sessions de cuisine" + "Répartition chaud/froid" partagés entre le panneau Préférences et le
 *  questionnaire de bienvenue de Courses. Corrélés avec "Repas à prévoir cette semaine" : un créneau que
 *  personne ne prévoit cette semaine (ex. "Seulement le midi") n'a pas de question de rythme de cuisine. */
export default function CookingSessionsFields() {
  const { constraints, setConstraints, mealNeeds } = useApp()
  const activeSlots = MEAL_SLOTS.filter(({ key }) => Object.values(mealNeeds).some((d) => d[key]))

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
    <>
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
          {activeSlots.map(({ key, label }) => (
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
          {activeSlots.map(({ key, label }) => {
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
                      <span>
                        {sessions} chaud{sessions > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>
    </>
  )
}
