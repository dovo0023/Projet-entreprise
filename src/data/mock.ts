import type { AdherenceEntry, Goal, PersonalRecord, WeightEntry } from '../types'

export const WEEK_DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']

export const WEIGHT_HISTORY: WeightEntry[] = [
  { date: '01/07', weight: 78.4 },
  { date: '08/07', weight: 77.9 },
  { date: '15/07', weight: 77.6 },
  { date: '22/07', weight: 77.1 },
  { date: '29/07', weight: 76.8 },
  { date: '05/08', weight: 76.3 },
  { date: '12/08', weight: 76.0 },
  { date: '19/08', weight: 75.6 },
  { date: '26/08', weight: 75.3 },
]

export const ADHERENCE_HISTORY: AdherenceEntry[] = [
  { date: 'S1', percent: 78 },
  { date: 'S2', percent: 85 },
  { date: 'S3', percent: 90 },
  { date: 'S4', percent: 82 },
  { date: 'S5', percent: 94 },
  { date: 'S6', percent: 97 },
  { date: 'S7', percent: 91 },
  { date: 'S8', percent: 96 },
]

const WEIGHT_DATES = WEIGHT_HISTORY.map((w) => w.date)
const ADHERENCE_DATES = ADHERENCE_HISTORY.map((a) => a.date)
const GOAL_WEEKLY_TREND: Record<Goal, number> = { seche: -0.32, maintien: 0, prise_de_masse: 0.25 }

/** Petit hash déterministe (0..1) pour générer un historique plausible et stable à partir d'un identifiant. */
function hash01(key: string, salt: number): number {
  let h = salt | 0
  for (let i = 0; i < key.length; i++) h = (Math.imul(h, 31) + key.charCodeAt(i)) | 0
  return (h >>> 0) / 4294967295
}

/** Génère un historique de poids/observance individuel et stable pour une personne du foyer, cohérent
 *  avec son objectif (tendance à la baisse en sèche, à la hausse en prise de masse, stable en maintien). */
export function generatePersonalHistory(seedKey: string, goal: Goal): PersonalRecord {
  const trend = GOAL_WEEKLY_TREND[goal]
  let weight = 58 + hash01(seedKey, 1) * 40
  const weightHistory: WeightEntry[] = WEIGHT_DATES.map((date, i) => {
    if (i > 0) weight += trend + (hash01(seedKey, 10 + i) - 0.5) * 0.4
    return { date, weight: Math.round(weight * 10) / 10 }
  })

  const adherenceHistory: AdherenceEntry[] = ADHERENCE_DATES.map((date, i) => ({
    date,
    percent: Math.round(Math.min(99, 80 + hash01(seedKey, 30 + i) * 16)),
  }))

  return { weightHistory, adherenceHistory }
}

export const ALLERGEN_OPTIONS = [
  'Gluten',
  'Lactose',
  'Arachides',
  'Fruits à coque',
  'Œufs',
  'Poisson / Crustacés',
  'Soja',
  'Diabète (contrôle glycémique)',
]
