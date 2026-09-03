import { Moon, Sun, Sunrise } from 'lucide-react'

export interface SlotsValue {
  matin: boolean
  midi: boolean
  soir: boolean
}

const SLOT_OPTIONS: { key: keyof SlotsValue; label: string; icon: typeof Sunrise }[] = [
  { key: 'matin', label: 'Matin', icon: Sunrise },
  { key: 'midi', label: 'Midi', icon: Sun },
  { key: 'soir', label: 'Soir', icon: Moon },
]

/** Sélecteur de repas (matin/midi/soir) partagé entre l'assistant Courses (étape 2) et le panneau Préférences. */
export default function SlotsField({ slots, onChange }: { slots: SlotsValue; onChange: (slots: SlotsValue) => void }) {
  function toggle(key: keyof SlotsValue) {
    onChange({ ...slots, [key]: !slots[key] })
  }

  return (
    <section>
      <div className="flex items-center gap-2 mb-1">
        <Sun size={15} className="text-leaf-600" />
        <p className="text-[13px] font-bold text-ink uppercase tracking-wide">Repas à prévoir</p>
      </div>
      <p className="text-[12px] text-ink-soft/70 mb-3">Appliqué aux jours sélectionnés ci-dessus.</p>
      <div className="grid grid-cols-3 gap-2">
        {SLOT_OPTIONS.map(({ key, label, icon: Icon }) => {
          const active = slots[key]
          return (
            <button
              key={key}
              onClick={() => toggle(key)}
              className={`tap flex flex-col items-center gap-1.5 py-3.5 rounded-2xl border ${
                active ? 'bg-ink text-cream border-ink' : 'bg-black/[0.03] text-ink-soft border-transparent'
              }`}
            >
              <Icon size={18} />
              <span className="text-[12.5px] font-bold">{label}</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
