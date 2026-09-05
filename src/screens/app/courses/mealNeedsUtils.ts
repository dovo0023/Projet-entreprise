import type { DayMealNeeds } from '../../../types'
import type { SlotsValue } from './SlotsField'

/** Reconstruit la grille jour × créneau utilisée pour éditer les repas à prévoir, jour par jour, dans
 *  l'assistant Courses / le panneau Préférences — reflète fidèlement l'état actuel (y compris un jour
 *  totalement "libre", affiché avec ses 3 repas décochés) plutôt que de deviner une valeur par défaut. */
export function toSlotsByDay(mealNeeds: DayMealNeeds): Record<number, SlotsValue> {
  const result: Record<number, SlotsValue> = {}
  for (let day = 1; day <= 7; day++) {
    const d = mealNeeds[day]
    result[day] = d ? { matin: d.matin, midi: d.midi, soir: d.soir } : { matin: true, midi: true, soir: true }
  }
  return result
}
