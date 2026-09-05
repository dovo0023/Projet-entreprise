import { Moon, Sun, Sunrise } from 'lucide-react'
import { SHORT_DAYS } from './DaysField'
import type { SlotsValue } from './SlotsField'

const SLOT_OPTIONS: { key: keyof SlotsValue; label: string; icon: typeof Sunrise }[] = [
  { key: 'matin', label: 'Matin', icon: Sunrise },
  { key: 'midi', label: 'Midi', icon: Sun },
  { key: 'soir', label: 'Soir', icon: Moon },
]

/** Grille jour × créneau (étape 2 de l'assistant Courses / panneau Préférences) : contrairement à un
 *  réglage global appliqué à tous les jours sélectionnés, permet d'exclure un repas précis pour un jour
 *  précis (ex. "mardi, pas de petit-déjeuner mais midi et soir oui"). */
export default function DaySlotsGrid({
  days,
  value,
  onToggle,
}: {
  days: number[]
  value: Record<number, SlotsValue>
  onToggle: (day: number, key: keyof SlotsValue) => void
}) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-1">
        <Sun size={15} className="text-leaf-600" />
        <p className="text-[13px] font-bold text-ink uppercase tracking-wide">Repas à prévoir</p>
      </div>
      <p className="text-[12px] text-ink-soft/70 mb-3">Réglable jour par jour, pour les jours sélectionnés ci-dessus.</p>
      <div className="flex flex-col gap-2">
        {days.map((day) => {
          const slots = value[day] ?? { matin: true, midi: true, soir: true }
          return (
            <div key={day} className="flex items-center gap-3 bg-black/[0.03] rounded-2xl px-3.5 py-2.5">
              <p className="w-8 text-[12.5px] font-bold text-ink-soft shrink-0">{SHORT_DAYS[day - 1]}</p>
              <div className="flex-1 grid grid-cols-3 gap-1.5">
                {SLOT_OPTIONS.map(({ key, label, icon: Icon }) => {
                  const active = slots[key]
                  return (
                    <button
                      key={key}
                      onClick={() => onToggle(day, key)}
                      aria-label={`${label} — ${SHORT_DAYS[day - 1]}`}
                      className={`tap flex items-center justify-center py-2 rounded-xl border ${
                        active ? 'bg-ink text-cream border-ink' : 'bg-white text-ink-soft/40 border-transparent'
                      }`}
                    >
                      <Icon size={14} />
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
