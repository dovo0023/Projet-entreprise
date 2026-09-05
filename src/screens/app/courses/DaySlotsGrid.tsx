import { Moon, Sun, Sunrise } from 'lucide-react'
import type { SlotsValue } from './SlotsField'

export const SHORT_DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
export const ALL_DAYS = [1, 2, 3, 4, 5, 6, 7]

const SLOT_OPTIONS: { key: keyof SlotsValue; label: string; icon: typeof Sunrise }[] = [
  { key: 'matin', label: 'Matin', icon: Sunrise },
  { key: 'midi', label: 'Midi', icon: Sun },
  { key: 'soir', label: 'Soir', icon: Moon },
]

/** Grille jour × créneau (étape unique de l'assistant Courses / panneau Préférences) : les 7 jours sont
 *  toujours visibles, chacun réglable indépendamment sur ses 3 repas — pas de présélection "quels jours"
 *  au préalable, pour permettre d'exclure un seul repas d'un jour (ex. "lundi, pas de dîner") sans avoir à
 *  d'abord exclure toute la journée. Un jour dont les 3 repas sont décochés équivaut à un jour "libre". */
export default function DaySlotsGrid({
  value,
  onToggle,
}: {
  value: Record<number, SlotsValue>
  onToggle: (day: number, key: keyof SlotsValue) => void
}) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-1">
        <Sun size={15} className="text-leaf-600" />
        <p className="text-[13px] font-bold text-ink uppercase tracking-wide">Repas à prévoir</p>
      </div>
      <p className="text-[12px] text-ink-soft/70 mb-3">
        Décochez un repas si vous ne comptez pas le prendre chez vous — les jours non concernés restent libres.
      </p>

      <div className="flex items-center gap-3 mb-1.5 px-0.5">
        <div className="w-8 shrink-0" />
        <div className="flex-1 grid grid-cols-3 gap-1.5">
          {SLOT_OPTIONS.map(({ key, label }) => (
            <p key={key} className="text-center text-[10.5px] font-bold text-ink-soft/50 uppercase tracking-wide">
              {label}
            </p>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {ALL_DAYS.map((day) => {
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
