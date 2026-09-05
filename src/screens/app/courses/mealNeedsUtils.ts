import type { DayMealNeeds } from '../../../types'
import type { SlotsValue } from './SlotsField'

/** Reconstruit "quels jours ont au moins un repas prévu" à partir de la grille jour × créneau — utilisé
 *  pour pré-remplir l'assistant Courses ou le panneau Préférences avec les réglages actuels. */
export function aggregateDays(mealNeeds: DayMealNeeds): number[] {
  return Object.entries(mealNeeds)
    .filter(([, d]) => d.matin || d.midi || d.soir)
    .map(([day]) => Number(day))
    .sort((a, b) => a - b)
}

/** Reconstruit la grille jour × créneau utilisée pour éditer les repas à prévoir finement, jour par jour
 *  (ex. "mardi, pas de petit-déjeuner mais midi et soir oui"). Un jour actuellement "libre" (aucun repas
 *  prévu) repart par défaut avec les 3 repas cochés dès qu'il est resélectionné, plutôt que de rester
 *  bloqué à vide. */
export function initSlotsByDay(mealNeeds: DayMealNeeds): Record<number, SlotsValue> {
  const result: Record<number, SlotsValue> = {}
  for (let day = 1; day <= 7; day++) {
    const d = mealNeeds[day]
    result[day] = d && (d.matin || d.midi || d.soir) ? { matin: d.matin, midi: d.midi, soir: d.soir } : { matin: true, midi: true, soir: true }
  }
  return result
}
