import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { ChatMessage, MacroTargets, Meal, PlannerConstraints, ShoppingItem, UserProfile } from '../types'
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

export const PATIENT_SHARE_CODE = 'NF-72K9'

const DEFAULT_MESSAGES: ChatMessage[] = [
  { from: 'patient', text: 'Bonjour Dr Marchand, le menu de cette semaine me convient très bien !', time: 'Lun 09:14' },
  { from: 'praticien', text: 'Super Camille, continuez ainsi. On garde le cap sur -350 kcal/j.', time: 'Lun 10:02' },
]

const STORAGE_KEY = 'nutriflow_b2c_state_v1'

interface PersistedState {
  onboarded: boolean
  profile: UserProfile
  constraints: PlannerConstraints
  weekPlan: Meal[]
  consumedMealIds: string[]
  consumed: MacroTargets
  shoppingList: ShoppingItem[]
  sentToDrive: boolean
  messages: ChatMessage[]
}

function loadPersisted(): Partial<PersistedState> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
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

  messages: ChatMessage[]
  sendMessage: (from: ChatMessage['from'], text: string) => void
}

const AppContext = createContext<AppState | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [persisted] = useState(() => loadPersisted())

  const [onboarded, setOnboarded] = useState(persisted?.onboarded ?? false)
  const [profile, setProfileState] = useState<UserProfile>(persisted?.profile ?? DEFAULT_PROFILE)
  const [constraints, setConstraintsState] = useState<PlannerConstraints>(persisted?.constraints ?? DEFAULT_CONSTRAINTS)

  const targets = useMemo(() => computeTargets(profile), [profile])

  const [initial] = useState(() => {
    if (persisted?.weekPlan?.length) {
      return {
        plan: persisted.weekPlan,
        shoppingList: persisted.shoppingList ?? consolidateIngredients(persisted.weekPlan),
        consumedMealIds: persisted.consumedMealIds ?? [],
        consumed: persisted.consumed ?? { kcal: 0, protein: 0, carbs: 0, fat: 0 },
      }
    }
    const baseProfile = persisted?.profile ?? DEFAULT_PROFILE
    const baseConstraints = persisted?.constraints ?? DEFAULT_CONSTRAINTS
    const plan = generateWeekPlan(baseProfile, computeTargets(baseProfile), baseConstraints)
    const breakfast = plan.find((m) => m.day === 1 && m.slot === 'petit-dejeuner')
    return {
      plan,
      shoppingList: consolidateIngredients(plan),
      consumedMealIds: breakfast ? [breakfast.id] : [],
      consumed: breakfast
        ? { kcal: breakfast.kcal, protein: breakfast.protein, carbs: breakfast.carbs, fat: breakfast.fat }
        : { kcal: 0, protein: 0, carbs: 0, fat: 0 },
    }
  })

  const [weekPlan, setWeekPlan] = useState<Meal[]>(initial.plan)
  const [consumedMealIds, setConsumedMealIds] = useState<string[]>(initial.consumedMealIds)
  const [consumed, setConsumed] = useState<MacroTargets>(initial.consumed)
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>(initial.shoppingList)
  const [sentToDrive, setSentToDrive] = useState(persisted?.sentToDrive ?? false)
  const [messages, setMessages] = useState<ChatMessage[]>(persisted?.messages ?? DEFAULT_MESSAGES)

  const weekStats = useMemo(() => computeWeekStats(weekPlan, targets, constraints, RECIPE_COST_MAP), [weekPlan, targets, constraints])

  useEffect(() => {
    try {
      const payload: PersistedState = { onboarded, profile, constraints, weekPlan, consumedMealIds, consumed, shoppingList, sentToDrive, messages }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    } catch {
      // Stockage indisponible (navigation privée, quota) : la session continue simplement en mémoire.
    }
  }, [onboarded, profile, constraints, weekPlan, consumedMealIds, consumed, shoppingList, sentToDrive, messages])

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

  function sendMessage(from: ChatMessage['from'], text: string) {
    setMessages((prev) => [...prev, { from, text, time: 'À l’instant' }])
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
        messages,
        sendMessage,
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
