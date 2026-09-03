import { CalendarDays } from 'lucide-react'

const SHORT_DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

/** Sélecteur de jours (1-7) partagé entre l'assistant Courses (étape 1) et le panneau Préférences. */
export default function DaysField({ days, onChange }: { days: number[]; onChange: (days: number[]) => void }) {
  function toggle(day: number) {
    onChange(days.includes(day) ? days.filter((d) => d !== day) : [...days, day].sort((a, b) => a - b))
  }

  return (
    <section>
      <div className="flex items-center gap-2 mb-1">
        <CalendarDays size={15} className="text-leaf-600" />
        <p className="text-[13px] font-bold text-ink uppercase tracking-wide">Jours à prévoir</p>
      </div>
      <p className="text-[12px] text-ink-soft/70 mb-3">
        Les jours non sélectionnés restent libres : à vous de noter ce que vous mangez.
      </p>
      <div className="grid grid-cols-7 gap-1.5">
        {SHORT_DAYS.map((label, idx) => {
          const day = idx + 1
          const active = days.includes(day)
          return (
            <button
              key={day}
              onClick={() => toggle(day)}
              className={`tap aspect-square rounded-xl flex items-center justify-center text-[12px] font-bold border ${
                active ? 'bg-ink text-cream border-ink' : 'bg-black/[0.03] text-ink-soft border-transparent'
              }`}
            >
              {label}
            </button>
          )
        })}
      </div>
      <p className="text-[11.5px] text-ink-soft/50 mt-2.5">
        {days.length} jour{days.length !== 1 ? 's' : ''} sélectionné{days.length !== 1 ? 's' : ''}
      </p>
    </section>
  )
}
