export type ActivityLevel = 'sedentaire' | 'modere' | 'intense'

export type Goal = 'seche' | 'maintien' | 'prise_de_masse'

export type MealSlot = 'petit-dejeuner' | 'midi' | 'soir' | 'encas-matin' | 'encas-apresmidi'

/** Créneaux pour lesquels une recette peut être proposée (l'encas sert aussi bien le matin que l'après-midi). */
export type RecipeSlot = 'petit-dejeuner' | 'midi' | 'soir' | 'encas'

export type Temperature = 'chaud' | 'froid'

export type TimeBand = 'court' | 'moyen' | 'long'

export type SnackTiming = 'matin' | 'apres_midi' | 'les_deux'

/** Régime alimentaire : chacun est un sous-ensemble du précédent (végétalien ⊂ végétarien ⊂ pescétarien ⊂ omnivore). */
export type DietType = 'omnivore' | 'pescetarien' | 'vegetarien' | 'vegetalien'

/** Équipement de cuisine du foyer (la poêle/casserole classique est toujours supposée disponible). */
export type KitchenEquipment = 'four' | 'micro_ondes' | 'airfryer' | 'blender'

export interface UserProfile {
  firstName: string
  email: string
  age: number
  sex: 'femme' | 'homme'
  height: number // cm
  weight: number // kg
  activityLevel: ActivityLevel
  goal: Goal
  dietType: DietType
  allergens: string[]
  plan: 'Gratuit' | 'Starter' | 'Pro' | 'Ultra'
}

/** Une autre personne du foyer partageant les repas, avec son propre objectif, régime et allergies. */
export interface HouseholdMember {
  id: string
  name: string
  goal: Goal
  dietType: DietType
  allergens: string[]
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
  dietTags: DietType[] // régimes que cette recette satisfait (ex. un plat végétalien satisfait les 4)
  requiredEquipment: KitchenEquipment[] // équipement indispensable (hors poêle/casserole) ; 'four' est aussi couvert par un airfryer
  highGI: boolean // pertinent pour le filtre "contrôle glycémique"
  temperature?: Temperature // midi/soir uniquement : chaud ou froid
  ingredients: Ingredient[]
  steps: string[]
  image: string
}

export interface PlannerConstraints {
  timeBand: TimeBand | null // null = peu importe
  snacks: { enabled: boolean; timing: SnackTiming }
  weeklyBudget: number | null
  macroFocus: 'equilibre' | 'riche_proteines'
  /** Nombre de fois par semaine où on cuisine réellement à midi/le soir (1-7). En dessous de 7, la même
   *  recette est reconduite sur plusieurs jours consécutifs (cuisine en lot, ex. 1 kg de poulet pour
   *  plusieurs repas d'affilée au lieu de cuisiner chaque jour). */
  cookingSessions: { midi: number; soir: number }
  /** Parmi ces sessions, combien doivent être un plat chaud (le reste froid) ; null = pas de préférence. */
  hotSessions: { midi: number | null; soir: number | null }
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

/** Créneau libre du journal alimentaire (pas forcément lié à un repas généré par le moteur). */
export type JournalSlot = 'petit-dejeuner' | 'midi' | 'encas' | 'soir' | 'autre'

/** Une entrée que la personne note elle-même dans son journal alimentaire (ce qu'elle a vraiment
 *  mangé, y compris hors menu prévu) — les macros sont une estimation facultative, pas un calcul exact. */
export interface JournalEntry {
  id: string
  day: number // 1-7
  time: string // ex. "10:30", affichage libre
  slot: JournalSlot
  description: string
  kcal: number | null
  protein: number | null
  carbs: number | null
  fat: number | null
}

/** Historique de suivi (poids, observance, journal alimentaire) d'une personne du foyer, suivi individuellement. */
export interface PersonalRecord {
  weightHistory: WeightEntry[]
  adherenceHistory: AdherenceEntry[]
  journalEntries: JournalEntry[]
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
  journalEntries: JournalEntry[]
  lastCheckIn: string
  linkedToApp: boolean
  riskFlags: string[]
  messages: ChatMessage[]
}
