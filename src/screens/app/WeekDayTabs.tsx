import { WEEK_DAYS, SHORT_DAYS } from '../../data/mock'

/** Rangée d'onglets jour par jour (Lun → Dim), partagée entre le menu de Courses et le Planning — les 7
 *  onglets se partagent toujours toute la largeur disponible (flex-1 chacun), jamais de défilement
 *  horizontal caché : le dimanche ne peut pas se retrouver hors champ sans indice pour l'utilisateur. */
export default function WeekDayTabs({ selectedDay, onSelect }: { selectedDay: number; onSelect: (day: number) => void }) {
  return (
    <div className="flex gap-1.5 px-5 pb-3 shrink-0">
      {WEEK_DAYS.map((dayName, idx) => {
        const dayNum = idx + 1
        const active = dayNum === selectedDay
        return (
          <button
            key={dayNum}
            onClick={() => onSelect(dayNum)}
            aria-label={dayName}
            className={`tap flex-1 min-w-0 flex items-center justify-center py-2 rounded-xl border text-[12px] font-bold ${
              active ? 'bg-ink text-cream border-ink' : 'bg-white text-ink-soft border-black/10'
            }`}
          >
            {SHORT_DAYS[idx]}
          </button>
        )
      })}
    </div>
  )
}
