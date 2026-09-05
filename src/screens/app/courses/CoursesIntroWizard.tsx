import { Sparkles } from 'lucide-react'
import { useState } from 'react'
import { useApp } from '../../../context/AppContext'
import { Button } from '../../../components/ui'
import DaySlotsGrid from './DaySlotsGrid'
import { toSlotsByDay } from './mealNeedsUtils'
import type { SlotsValue } from './SlotsField'

/** Assistant réaffiché à chaque passage dans l'onglet Courses : une grille des 7 jours, chacun réglable
 *  indépendamment sur ses 3 repas (matin/midi/soir) — pas de présélection "quels jours" au préalable, pour
 *  pouvoir exclure un seul repas d'un jour (ex. "lundi, pas de dîner, mais matin et midi oui") sans avoir à
 *  d'abord exclure toute la journée. */
export default function CoursesIntroWizard({ onDone }: { onDone: () => void }) {
  const { mealNeeds, applyDaySlotSelection } = useApp()
  const [slotsByDay, setSlotsByDay] = useState<Record<number, SlotsValue>>(() => toSlotsByDay(mealNeeds))

  function toggleSlot(day: number, key: keyof SlotsValue) {
    setSlotsByDay((prev) => ({ ...prev, [day]: { ...prev[day], [key]: !prev[day][key] } }))
  }

  const hasAnySlot = Object.values(slotsByDay).some((s) => s.matin || s.midi || s.soir)

  function validate() {
    // Changer les repas à prévoir ne change pas les recettes elles-mêmes (generateWeekPlan ne dépend pas
    // de mealNeeds) : pas besoin de régénérer le menu, juste de recalculer la grille jour × créneau et la
    // liste de courses en conséquence.
    applyDaySlotSelection(slotsByDay)
    onDone()
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="px-5 pt-[calc(env(safe-area-inset-top)+18px)] pb-2 shrink-0">
        <div className="w-12 h-12 rounded-2xl bg-leaf-100 flex items-center justify-center mb-3">
          <Sparkles className="text-leaf-600" size={22} />
        </div>
        <h1 className="text-xl font-extrabold text-ink">Quels repas voulez-vous prévoir cette semaine ?</h1>
        <p className="text-[13px] text-ink-soft mt-1">
          Réglez matin/midi/soir jour par jour — par exemple, pas de dîner lundi, mais matin et midi oui.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-5 py-4">
        <DaySlotsGrid value={slotsByDay} onToggle={toggleSlot} />
      </div>

      <div className="px-5 pb-[calc(env(safe-area-inset-bottom)+16px)] pt-2 shrink-0 border-t border-black/5 flex flex-col gap-2.5">
        <Button full disabled={!hasAnySlot} onClick={validate}>
          Valider et découvrir mon menu
        </Button>
        <button onClick={onDone} className="tap text-center text-[12.5px] font-semibold text-ink-soft/60 py-1">
          Continuer sans changer
        </button>
      </div>
    </div>
  )
}
