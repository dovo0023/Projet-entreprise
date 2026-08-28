import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type { MacroTargets, Meal, PlannerConstraints, ShoppingItem, UserProfile } from '../types'
import { computeWeekStats, generateWeekPlan, RECIPE_COST_MAP, replaceMealInPlan, type WeekStats } from '../engine/planner'
import { consolidateIngredients } from '../engine/shoppingConsolidator'

export const DEFAULT_PROFILE: UserProfile = {
  firstName: 'Camille',
  email: '',
  age: 29,
  sex: 'femme',
  height: 168,
  weight: 71,
  activityLevel: 'modere',
  goal: 'seche',
  allergens: [],
  duoMode: false,
  plan: 'Starter',
}

export const DEFAULT_CONSTRAINTS: PlannerConstraints = {
  maxPrepTime: null,
  weeklyBudget: null,
  macroFocus: 'equilibre',
}

function activityFactor(level: UserProfile['activityLevel']) {
  return { sedentaire: 1.2, modere: 1.55, intense: 1.8 }[level]
}

export function computeBMR(p: UserProfile) {
  // Mifflin-St Jeor
  const base = 10 * p.weight + 6.25 * p.height - 5 * p.age
  return Math.round(p.sex === 'homme' ? base + 5 : base - 161)
}

export function computeTDEE(p: UserProfile) {
  return Math.round(computeBMR(p) * activityFactor(p.activityLevel))
}

export function computeTargets(p: UserProfile): MacroTargets {
  const tdee = computeTDEE(p)
  const kcal = tdee + (p.goal === 'seche' ? -350 : p.goal === 'prise_de_masse' ? 300 : 0)
  const protein = Math.round((kcal * 0.3) / 4)
  const fat = Math.round((kcal * 0.3) / 9)
  const carbs = Math.round((kcal - protein * 4 - fat * 9) / 4)
  return { kcal, protein, carbs, fat }
}

function mergeShoppingChecks(newItems: ShoppingItem[], prevItems: ShoppingItem[]): ShoppingItem[] {
  const checkedNames = new Set(prevItems.filter((i) => i.checked).map((i) => i.name.toLowerCase()))
  return newItems.map((i) => (checkedNames.has(i.name.toLowerCase()) ? { ...i, checked: true } : i))
}

interface AppState {
  onboarded: boolean
  profile: UserProfile
  setProfile: (p: Partial<UserProfile>) => void
  completeOnboarding: () => void
  targets: MacroTargets

  weekPlan: Meal[]
  constraints: PlannerConstraints
  setConstraints: (c: Partial<PlannerConstraints>) => void
  regenerateWeek: () => void
  replaceMeal: (mealId: string) => void
  weekStats: WeekStats

  consumedMealIds: string[]
  toggleMealConsumed: (mealId: string, kcal: number, protein: number, carbs: number, fat: number) => void
  consumed: MacroTargets

  shoppingList: ShoppingItem[]
  toggleShoppingItem: (id: string) => void
  sentToDrive: boolean
  sendToDrive: () => void
}

const AppContext = createContext<AppState | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [onboarded, setOnboarded] = useState(false)
  const [profile, setProfileState] = useState<UserProfile>(DEFAULT_PROFILE)
  const [constraints, setConstraintsState] = useState<PlannerConstraints>(DEFAULT_CONSTRAINTS)

  const targets = useMemo(() => computeTargets(profile), [profile])

  const [initial] = useState(() => {
    const plan = generateWeekPlan(DEFAULT_PROFILE, computeTargets(DEFAULT_PROFILE), DEFAULT_CONSTRAINTS)
    const breakfast = plan.find((m) => m.day === 1 && m.slot === 'petit-dejeuner')
    const shoppingList = consolidateIngredients(plan)
    return { plan, breakfast, shoppingList }
  })

  const [weekPlan, setWeekPlan] = useState<Meal[]>(initial.plan)
  const [consumedMealIds, setConsumedMealIds] = useState<string[]>(initial.breakfast ? [initial.breakfast.id] : [])
  const [consumed, setConsumed] = useState<MacroTargets>(
    initial.breakfast
      ? { kcal: initial.breakfast.kcal, protein: initial.breakfast.protein, carbs: initial.breakfast.carbs, fat: initial.breakfast.fat }
      : { kcal: 0, protein: 0, carbs: 0, fat: 0 },
  )
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>(initial.shoppingList)
  const [sentToDrive, setSentToDrive] = useState(false)

  const weekStats = useMemo(() => computeWeekStats(weekPlan, targets, constraints, RECIPE_COST_MAP), [weekPlan, targets, constraints])

  function setProfile(p: Partial<UserProfile>) {
    setProfileState((prev) => ({ ...prev, ...p }))
  }

  function completeOnboarding() {
    setOnboarded(true)
    const plan = generateWeekPlan(profile, computeTargets(profile), constraints)
    setWeekPlan(plan)
    const breakfast = plan.find((m) => m.day === 1 && m.slot === 'petit-dejeuner')
    setConsumedMealIds(breakfast ? [breakfast.id] : [])
    setConsumed(breakfast ? { kcal: breakfast.kcal, protein: breakfast.protein, carbs: breakfast.carbs, fat: breakfast.fat } : { kcal: 0, protein: 0, carbs: 0, fat: 0 })
    setShoppingList((prev) => mergeShoppingChecks(consolidateIngredients(plan), prev))
    setSentToDrive(false)
  }

  function setConstraints(c: Partial<PlannerConstraints>) {
    setConstraintsState((prev) => ({ ...prev, ...c }))
  }

  function regenerateWeek() {
    const plan = generateWeekPlan(profile, targets, constraints)
    setWeekPlan(plan)
    setConsumedMealIds([])
    setConsumed({ kcal: 0, protein: 0, carbs: 0, fat: 0 })
    setShoppingList((prev) => mergeShoppingChecks(consolidateIngredients(plan), prev))
    setSentToDrive(false)
  }

  function replaceMeal(mealId: string) {
    const old = weekPlan.find((m) => m.id === mealId)
    const newPlan = replaceMealInPlan(weekPlan, mealId, profile, targets, constraints)
    setWeekPlan(newPlan)

    if (old && consumedMealIds.includes(mealId)) {
      setConsumedMealIds((prev) => prev.filter((id) => id !== mealId))
      setConsumed((c) => ({
        kcal: Math.max(0, c.kcal - old.kcal),
        protein: Math.max(0, c.protein - old.protein),
        carbs: Math.max(0, c.carbs - old.carbs),
        fat: Math.max(0, c.fat - old.fat),
      }))
    }
    setShoppingList((prev) => mergeShoppingChecks(consolidateIngredients(newPlan), prev))
  }

  function toggleMealConsumed(mealId: string, kcal: number, protein: number, carbs: number, fat: number) {
    setConsumedMealIds((prev) => {
      const already = prev.includes(mealId)
      const sign = already ? -1 : 1
      setConsumed((c) => ({
        kcal: Math.max(0, c.kcal + sign * kcal),
        protein: Math.max(0, c.protein + sign * protein),
        carbs: Math.max(0, c.carbs + sign * carbs),
        fat: Math.max(0, c.fat + sign * fat),
      }))
      return already ? prev.filter((id) => id !== mealId) : [...prev, mealId]
    })
  }

  function toggleShoppingItem(id: string) {
    setShoppingList((prev) => prev.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i)))
  }

  function sendToDrive() {
    setSentToDrive(true)
  }

  return (
    <AppContext.Provider
      value={{
        onboarded,
        profile,
        setProfile,
        completeOnboarding,
        targets,
        weekPlan,
        constraints,
        setConstraints,
        regenerateWeek,
        replaceMeal,
        weekStats,
        consumedMealIds,
        toggleMealConsumed,
        consumed,
        shoppingList,
        toggleShoppingItem,
        sentToDrive,
        sendToDrive,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
