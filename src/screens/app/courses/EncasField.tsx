import { Coffee, Sun, Sunrise } from 'lucide-react'
import { useApp } from '../../../context/AppContext'
import { SHORT_DAYS } from '../../../data/mock'
import type { SnackTiming } from '../../../types'

/** Un encas se règle jour par jour comme "matin ✕ après-midi" : les deux réglages combinés donnent la
 *  valeur `SnackTiming` stockée (aucun coché = pas d'encas ce jour-là). */
function toTiming(matin: boolean, apresMidi: boolean): SnackTiming | null {
  if (matin && apresMidi) return 'les_deux'
  if (matin) return 'matin'
  if (apresMidi) return 'apres_midi'
  return null
}

/** Réglage "Encas" jour par jour, partagé entre l'assistant Courses et le panneau Préférences — permet
 *  par exemple un encas le matin seulement le mardi, et les deux le vendredi. */
export default function EncasField() {
  const { constraints, setConstraints } = useApp()

  function toggle(day: number, part: 'matin' | 'apres_midi') {
    const current = constraints.snacksByDay[day] ?? null
    const hasMatin = current === 'matin' || current === 'les_deux'
    const hasApresMidi = current === 'apres_midi' || current === 'les_deux'
    const next = toTiming(part === 'matin' ? !hasMatin : hasMatin, part === 'apres_midi' ? !hasApresMidi : hasApresMidi)
    setConstraints({ snacksByDay: { ...constraints.snacksByDay, [day]: next } })
  }

  return (
    <section>
      <div className="flex items-center gap-2 mb-1">
        <Coffee size={15} className="text-leaf-600" />
        <p className="text-[13px] font-bold text-ink uppercase tracking-wide">Encas</p>
      </div>
      <p className="text-[12px] text-ink-soft/70 mb-3">Réglable jour par jour — aucun coché, pas d'encas ce jour-là.</p>

      <div className="flex items-center gap-3 mb-1.5 px-0.5">
        <div className="w-8 shrink-0" />
        <div className="flex-1 grid grid-cols-2 gap-1.5">
          <p className="text-center text-[10.5px] font-bold text-ink-soft/50 uppercase tracking-wide">Matin</p>
          <p className="text-center text-[10.5px] font-bold text-ink-soft/50 uppercase tracking-wide">Après-midi</p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {Array.from({ length: 7 }, (_, i) => i + 1).map((day) => {
          const current = constraints.snacksByDay[day] ?? null
          const hasMatin = current === 'matin' || current === 'les_deux'
          const hasApresMidi = current === 'apres_midi' || current === 'les_deux'
          return (
            <div key={day} className="flex items-center gap-3 bg-black/[0.03] rounded-2xl px-3.5 py-2.5">
              <p className="w-8 text-[12.5px] font-bold text-ink-soft shrink-0">{SHORT_DAYS[day - 1]}</p>
              <div className="flex-1 grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => toggle(day, 'matin')}
                  aria-label={`Encas du matin — ${SHORT_DAYS[day - 1]}`}
                  className={`tap flex items-center justify-center py-2 rounded-xl border ${
                    hasMatin ? 'bg-ink text-cream border-ink' : 'bg-white text-ink-soft/40 border-transparent'
                  }`}
                >
                  <Sunrise size={14} />
                </button>
                <button
                  onClick={() => toggle(day, 'apres_midi')}
                  aria-label={`Encas de l’après-midi — ${SHORT_DAYS[day - 1]}`}
                  className={`tap flex items-center justify-center py-2 rounded-xl border ${
                    hasApresMidi ? 'bg-ink text-cream border-ink' : 'bg-white text-ink-soft/40 border-transparent'
                  }`}
                >
                  <Sun size={14} />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
