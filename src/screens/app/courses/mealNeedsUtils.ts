import type { DayMealNeeds } from '../../../types'

/** Reconstruit "quels jours ont au moins un repas prévu" à partir de la grille jour × créneau — utilisé
 *  pour pré-remplir l'assistant Courses ou le panneau Préférences avec les réglages actuels. */
export function aggregateDays(mealNeeds: DayMealNeeds): number[] {
  return Object.entries(mealNeeds)
    .filter(([, d]) => d.matin || d.midi || d.soir)
    .map(([day]) => Number(day))
    .sort((a, b) => a - b)
}

/** Reconstruit "quels repas sont prévus au moins un jour" à partir de la grille jour × créneau. */
export function aggregateSlots(mealNeeds: DayMealNeeds): { matin: boolean; midi: boolean; soir: boolean } {
  const values = Object.values(mealNeeds)
  return {
    matin: values.some((d) => d.matin),
    midi: values.some((d) => d.midi),
    soir: values.some((d) => d.soir),
  }
}
