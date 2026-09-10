import { Clock } from 'lucide-react'
import { useApp } from '../../../context/AppContext'
import type { TimeBand } from '../../../types'

const TIME_OPTIONS: { value: TimeBand | null; label: string }[] = [
  { value: null, label: 'Peu importe' },
  { value: 'court', label: '< 15 min' },
  { value: 'moyen', label: '15 – 30 min' },
  { value: 'long', label: '30 min +' },
]

/** Réglage "Temps de préparation", partagé entre l'assistant Courses et le panneau Préférences. */
export default function TimeBandField() {
  const { constraints, setConstraints } = useApp()

  return (
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
  )
}
