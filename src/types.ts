export type ActivityLevel = 'sedentaire' | 'modere' | 'intense'

export type Goal = 'seche' | 'maintien' | 'prise_de_masse'

export type MealSlot = 'petit-dejeuner' | 'midi' | 'soir' | 'encas-matin' | 'encas-apresmidi'

/** Créneaux pour lesquels une recette peut être proposée (l'encas sert aussi bien le matin que l'après-midi). */
export type RecipeSlot = 'petit-dejeuner' | 'midi' | 'soir' | 'encas'

export type Temperature = 'chaud' | 'froid'

export type TimeBand = 'court' | 'moyen' | 'long'

/** Température souhaitée à midi puis au soir (ex. "froid_chaud" = froid le midi, chaud le soir). */
export type HotColdPattern = 'chaud_chaud' | 'froid_chaud' | 'chaud_froid' | 'froid_froid'

export type SnackTiming = 'matin' | 'apres_midi' | 'les_deux'

export interface UserProfile {
  firstName: string
  email: string
  age: number
  sex: 'femme' | 'homme'
  height: number // cm
  weight: number // kg
  activityLevel: ActivityLevel
  goal: Goal
  allergens: string[]
  duoMode: boolean
  plan: 'Gratuit' | 'Starter' | 'Pro' | 'Ultra'
}

export interface MacroTargets {
  kcal: number
  protein: number
  carbs: number
  fat: number
}

export interface Ingredient {
  name: string
  quantity: string
}

export interface Meal {
  id: string
  day: number // 1-7
  slot: MealSlot
  name: string
  kcal: number
  protein: number
  carbs: number
  fat: number
  prepTime: number // minutes
  freshnessDay: number // J1..J7, lower = eat first (ultra-fresh)
  ingredients: Ingredient[]
  steps: string[]
  image: string
}

export interface RecipeTemplate {
  id: string
  slot: RecipeSlot
  name: string
  kcal: number
  protein: number
  carbs: number
  fat: number
  prepTime: number // minutes
  cost: number // euros per portion
  freshnessTier: number // 1 (ultra-frais, à consommer tôt) .. 3 (longue conservation)
  allergenTags: string[] // subset of ALLERGEN_OPTIONS
  highGI: boolean // pertinent pour le filtre "contrôle glycémique"
  temperature?: Temperature // midi/soir uniquement : chaud ou froid
  ingredients: Ingredient[]
  steps: string[]
  image: string
}

export interface PlannerConstraints {
  timeBand: TimeBand | null // null = peu importe
  hotColdPattern: HotColdPattern | null // null = peu importe
  snacks: { enabled: boolean; timing: SnackTiming }
  weeklyBudget: number | null
  macroFocus: 'equilibre' | 'riche_proteines'
}

export interface ShoppingItem {
  id: string
  name: string
  quantity: string
  category: string
  haveAtHome: boolean
}

export type DeliveryMode = 'click_collect' | 'click_collect_delivery'

export interface Store {
  id: string
  name: string
  distanceKm: number
  logo: string
  priceMultiplier: number
  deliveryModes: DeliveryMode[]
}

export interface WeightEntry {
  date: string
  weight: number
}

export interface AdherenceEntry {
  date: string
  percent: number
}

export interface ChatMessage {
  from: 'patient' | 'praticien'
  text: string
  time: string
}

export interface PatientSummary {
  id: string
  name: string
  goal: Goal
  allergens: string[]
  targets: MacroTargets
  actualToday: MacroTargets
  weightHistory: WeightEntry[]
  adherenceHistory: AdherenceEntry[]
  lastCheckIn: string
  linkedToApp: boolean
  riskFlags: string[]
  messages: ChatMessage[]
}
