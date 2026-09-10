import { Flame, Snowflake, Thermometer } from 'lucide-react'
import { useApp } from '../../../context/AppContext'
import { SHORT_DAYS } from './DaySlotsGrid'
import type { Temperature } from '../../../types'

const SLOTS: { key: 'midi' | 'soir'; label: string }[] = [
  { key: 'midi', label: 'Midi' },
  { key: 'soir', label: 'Soir' },
]

/** Cycle Peu importe → Chaud → Froid → Peu importe au tap. */
function nextTemp(current: Temperature | null): Temperature | null {
  if (current == null) return 'chaud'
  if (current === 'chaud') return 'froid'
  return null
}

/** Réglage "Répartition chaud / froid" jour par jour, pour midi et soir — partagé entre l'assistant
 *  Courses et le panneau Préférences. Remplace l'ancien réglage par nombre de sessions de cuisine. */
export default function HotColdField() {
  const { constraints, setConstraints } = useApp()

  function cycle(day: number, slot: 'midi' | 'soir') {
    const current = constraints.hotColdByDay[day] ?? { midi: null, soir: null }
    setConstraints({ hotColdByDay: { ...constraints.hotColdByDay, [day]: { ...current, [slot]: nextTemp(current[slot]) } } })
  }

  return (
    <section>
      <div className="flex items-center gap-2 mb-1">
        <Thermometer size={15} className="text-leaf-600" />
        <p className="text-[13px] font-bold text-ink uppercase tracking-wide">Répartition chaud / froid</p>
      </div>
      <p className="text-[12px] text-ink-soft/70 mb-3">Réglable jour par jour — appuyez pour faire défiler peu importe / chaud / froid.</p>

      <div className="flex items-center gap-3 mb-1.5 px-0.5">
        <div className="w-8 shrink-0" />
        <div className="flex-1 grid grid-cols-2 gap-1.5">
          {SLOTS.map(({ key, label }) => (
            <p key={key} className="text-center text-[10.5px] font-bold text-ink-soft/50 uppercase tracking-wide">
              {label}
            </p>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {Array.from({ length: 7 }, (_, i) => i + 1).map((day) => {
          const value = constraints.hotColdByDay[day] ?? { midi: null, soir: null }
          return (
            <div key={day} className="flex items-center gap-3 bg-black/[0.03] rounded-2xl px-3.5 py-2.5">
              <p className="w-8 text-[12.5px] font-bold text-ink-soft shrink-0">{SHORT_DAYS[day - 1]}</p>
              <div className="flex-1 grid grid-cols-2 gap-1.5">
                {SLOTS.map(({ key, label }) => {
                  const temp = value[key]
                  return (
                    <button
                      key={key}
                      onClick={() => cycle(day, key)}
                      aria-label={`${label} — ${SHORT_DAYS[day - 1]} : ${temp === 'chaud' ? 'chaud' : temp === 'froid' ? 'froid' : 'peu importe'}`}
                      className={`tap flex items-center justify-center py-2 rounded-xl border text-[11px] font-bold ${
                        temp === 'chaud'
                          ? 'bg-clementine-500 text-white border-clementine-500'
                          : temp === 'froid'
                            ? 'bg-leaf-500 text-white border-leaf-500'
                            : 'bg-white text-ink-soft/40 border-transparent'
                      }`}
                    >
                      {temp === 'chaud' ? <Flame size={14} /> : temp === 'froid' ? <Snowflake size={14} /> : '—'}
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
