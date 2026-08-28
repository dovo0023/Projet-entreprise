export type ActivityLevel = 'sedentaire' | 'modere' | 'intense'

export type Goal = 'seche' | 'maintien' | 'prise_de_masse'

export type MealSlot = 'petit-dejeuner' | 'midi' | 'soir'

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

export interface ShoppingItem {
  id: string
  name: string
  quantity: string
  category: string
  checked: boolean
}

export interface WeightEntry {
  date: string
  weight: number
}

export interface AdherenceEntry {
  date: string
  percent: number
}
