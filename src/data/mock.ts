import type { AdherenceEntry, WeightEntry } from '../types'

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
