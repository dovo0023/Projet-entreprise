import { CalendarRange } from 'lucide-react'
import { useApp } from '../../../context/AppContext'

const OPTIONS: { midi: boolean; soir: boolean; label: string; hint: string }[] = [
  { midi: true, soir: true, label: 'Midi et soir', hint: 'Un repas prévu par l’app aux deux créneaux, chaque jour.' },
  { midi: true, soir: false, label: 'Seulement le midi', hint: 'Le soir reste libre : à vous de noter ce que vous mangez.' },
  { midi: false, soir: true, label: 'Seulement le soir', hint: 'Le midi reste libre : à vous de noter ce que vous mangez.' },
]

/** Réglage global "combien de repas prévoir cette semaine" : s'applique aux 7 jours d'un coup, ajustable
 *  ensuite jour par jour depuis Planning ou Aujourd'hui (un repas peut y être basculé en "libre"). */
export default function MealNeedsFields() {
  const { mealNeeds, setMealNeedsForAllDays } = useApp()
  const allDays = Object.values(mealNeeds)
  const current = OPTIONS.find((o) => allDays.length > 0 && allDays.every((d) => d.midi === o.midi && d.soir === o.soir))

  return (
    <section>
      <div className="flex items-center gap-2 mb-1">
        <CalendarRange size={15} className="text-leaf-600" />
        <p className="text-[13px] font-bold text-ink uppercase tracking-wide">Repas à prévoir cette semaine</p>
      </div>
      <p className="text-[12px] text-ink-soft/70 mb-3">
        Certains jours vous mangez peut-être ailleurs ou improvisez : dites-nous quels repas l’app doit vous préparer.
        Vous pourrez ajuster jour par jour depuis Planning ou Aujourd’hui.
      </p>
      <div className="flex flex-col gap-2">
        {OPTIONS.map((opt) => {
          const active = current?.label === opt.label
          return (
            <button
              key={opt.label}
              onClick={() => setMealNeedsForAllDays(opt.midi, opt.soir)}
              className={`tap text-left px-4 py-3 rounded-2xl border ${
                active ? 'bg-ink text-cream border-ink' : 'bg-black/[0.03] text-ink border-transparent'
              }`}
            >
              <p className="font-bold text-[13px]">{opt.label}</p>
              <p className={`text-[11.5px] mt-0.5 ${active ? 'text-cream/70' : 'text-ink-soft/60'}`}>{opt.hint}</p>
            </button>
          )
        })}
      </div>
    </section>
  )
}
