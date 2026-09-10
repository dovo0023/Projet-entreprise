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
  /** Aliments non appréciés (texte libre) : préférence, pas une contre-indication — n'exclut jamais une
   *  recette si ça viderait le créneau, contrairement aux allergènes (voir `isEligible` dans planner.ts). */
  dislikedFoods: string[]
  plan: 'Starter' | 'Pro' | 'Ultra'
}

/** Une autre personne du foyer partageant les repas, avec son propre objectif, régime et allergies. */
export interface HouseholdMember {
  id: string
  name: string
  goal: Goal
  dietType: DietType
  allergens: string[]
  dislikedFoods: string[]
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
  weeklyBudget: number | null
  /** Encas du jour, réglable jour par jour : null = pas d'encas ce jour-là. */
  snacksByDay: Record<number, SnackTiming | null>
  /** Répartition chaud/froid pour midi et soir, réglable jour par jour ; null = pas de préférence. */
  hotColdByDay: Record<number, { midi: Temperature | null; soir: Temperature | null }>
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
  /** Site officiel du service drive de l'enseigne (pour "Envoyer vers le Drive") — absent si l'enseigne
   *  n'a pas de service de courses en ligne dédié connu. */
  driveUrl?: string
}

export interface WeightEntry {
  date: string
  weight: number
}

export interface AdherenceEntry {
  date: string
  percent: number
}

/** Pour un jour de la semaine (1-7), indique si l'app doit prévoir une recette matin/midi/soir, ou si la
 *  personne mange "libre" ce jour-là (repas non planifié par l'app, noté à la main dans Planning/Aujourd'hui). */
export type DayMealNeeds = Record<number, { matin: boolean; midi: boolean; soir: boolean }>

/** Créneau planifiable depuis le parcours Courses (choix des jours puis des repas) — le petit-déjeuner y est
 *  désigné "matin" à l'écran mais correspond au créneau `petit-dejeuner` du moteur. */
export type PlannableSlot = 'petit-dejeuner' | 'midi' | 'soir'

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

/** Un créneau proposé par un praticien de l'annuaire (affichage seul, pas de vraie disponibilité en temps réel). */
export interface AppointmentSlot {
  id: string
  dayLabel: string // ex. "Lun 8 sept"
  time: string // ex. "14:30"
}

/** Fiche d'un(e) diététicien(ne) de l'annuaire "près de chez moi" (données de démo, pas de vrai annuaire/géoloc). */
export interface PractitionerListing {
  id: string
  name: string
  photo: string
  specialty: string
  city: string
  distanceKm: number
  rating: number
  reviewCount: number
  slots: AppointmentSlot[]
}

/** Un rendez-vous confirmé par la patiente auprès d'un praticien de l'annuaire. */
export interface Appointment {
  id: string
  practitionerId: string
  practitionerName: string
  dayLabel: string
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
