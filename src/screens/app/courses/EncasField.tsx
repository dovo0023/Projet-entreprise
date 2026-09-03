import { Coffee } from 'lucide-react'
import { useApp } from '../../../context/AppContext'
import type { SnackTiming } from '../../../types'

const SNACK_TIMING_OPTIONS: { value: SnackTiming; label: string }[] = [
  { value: 'matin', label: 'Le matin' },
  { value: 'apres_midi', label: 'L’après-midi' },
  { value: 'les_deux', label: 'Les deux' },
]

/** Réglage "Encas" partagé entre le questionnaire de bienvenue et le panneau Préférences — désactivé par
 *  défaut : sans lui, une journée reste à 3 repas (petit-déjeuner, midi, soir). */
export default function EncasField() {
  const { constraints, setConstraints } = useApp()

  return (
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
  )
}
