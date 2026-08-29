import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { ChatMessage, DeliveryMode, MacroTargets, Meal, PlannerConstraints, RecipeTemplate, ShoppingItem, UserProfile } from '../types'
import {
  applyMealChoice,
  computeWeekStats,
  generateWeekPlan,
  getMealAlternatives,
  RECIPE_COST_MAP,
  replaceMealInPlan,
  swapMealsBetweenDays,
  type WeekStats,
} from '../engine/planner'
import { consolidateIngredients } from '../engine/shoppingConsolidator'
import { quoteStores, type StoreQuote } from '../engine/storeQuote'

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
  timeBand: null,
  hotColdPattern: null,
  snacks: { enabled: false, timing: 'matin' },
  weeklyBudget: null,
  macroFocus: 'equilibre',
}

export const PATIENT_SHARE_CODE = 'NF-72K9'

export type CourseStep = 'menu' | 'ingredients' | 'store'

const DEFAULT_MESSAGES: ChatMessage[] = [
  { from: 'patient', text: 'Bonjour Dr Marchand, le menu de cette semaine me convient très bien !', time: 'Lun 09:14' },
  { from: 'praticien', text: 'Super Camille, continuez ainsi. On garde le cap sur -350 kcal/j.', time: 'Lun 10:02' },
]

const STORAGE_KEY = 'nutriflow_b2c_state_v2'

interface PersistedState {
  onboarded: boolean
  profile: UserProfile
  constraints: PlannerConstraints
  weekPlan: Meal[]
  consumedMealIds: string[]
  consumed: MacroTargets
  shoppingList: ShoppingItem[]
  messages: ChatMessage[]
  courseStep: CourseStep
  chosenStoreId: string | null
  chosenDeliveryMode: DeliveryMode | null
  orderPlaced: boolean
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

/** Le flux courses (menu → ingrédients → magasin) porte sur les repas de midi, du soir et les encas. */
function shoppableMeals(plan: Meal[]): Meal[] {
  return plan.filter((m) => m.slot !== 'petit-dejeuner')
}

function mergeHaveAtHome(newItems: ShoppingItem[], prevItems: ShoppingItem[]): ShoppingItem[] {
  const owned = new Set(prevItems.filter((i) => i.haveAtHome).map((i) => i.name.toLowerCase()))
  return newItems.map((i) => (owned.has(i.name.toLowerCase()) ? { ...i, haveAtHome: true } : i))
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
  weekStats: WeekStats

  applyPreferences: () => void

  courseStep: CourseStep
  setCourseStep: (s: CourseStep) => void

  mealAlternatives: (mealId: string, count?: number) => RecipeTemplate[]
  chooseMealAlternative: (mealId: string, recipeId: string) => void
  swapMeals: (mealIdA: string, mealIdB: string) => void
  replaceMeal: (mealId: string) => void

  consumedMealIds: string[]
  toggleMealConsumed: (mealId: string, kcal: number, protein: number, carbs: number, fat: number) => void
  consumed: MacroTargets

  shoppingList: ShoppingItem[]
  toggleHaveAtHome: (id: string) => void
  storeQuotes: StoreQuote[]
  chosenStoreId: string | null
  chosenDeliveryMode: DeliveryMode | null
  orderPlaced: boolean
  placeOrder: (storeId: string, mode: DeliveryMode) => void
  resetOrder: () => void

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
        shoppingList: persisted.shoppingList ?? consolidateIngredients(shoppableMeals(persisted.weekPlan)),
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
      shoppingList: consolidateIngredients(shoppableMeals(plan)),
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
  const [messages, setMessages] = useState<ChatMessage[]>(persisted?.messages ?? DEFAULT_MESSAGES)

  const [courseStep, setCourseStep] = useState<CourseStep>(persisted?.courseStep ?? 'menu')
  const [chosenStoreId, setChosenStoreId] = useState<string | null>(persisted?.chosenStoreId ?? null)
  const [chosenDeliveryMode, setChosenDeliveryMode] = useState<DeliveryMode | null>(persisted?.chosenDeliveryMode ?? null)
  const [orderPlaced, setOrderPlaced] = useState(persisted?.orderPlaced ?? false)

  const weekStats = useMemo(() => computeWeekStats(weekPlan, targets, constraints, RECIPE_COST_MAP), [weekPlan, targets, constraints])
  const storeQuotes = useMemo(() => quoteStores(shoppingList.filter((i) => !i.haveAtHome)), [shoppingList])

  useEffect(() => {
    try {
      const payload: PersistedState = {
        onboarded,
        profile,
        constraints,
        weekPlan,
        consumedMealIds,
        consumed,
        shoppingList,
        messages,
        courseStep,
        chosenStoreId,
        chosenDeliveryMode,
        orderPlaced,
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    } catch {
      // Stockage indisponible (navigation privée, quota) : la session continue simplement en mémoire.
    }
  }, [onboarded, profile, constraints, weekPlan, consumedMealIds, consumed, shoppingList, messages, courseStep, chosenStoreId, chosenDeliveryMode, orderPlaced])

  function setProfile(p: Partial<UserProfile>) {
    setProfileState((prev) => ({ ...prev, ...p }))
  }

  function applyNewPlan(plan: Meal[]) {
    setWeekPlan(plan)
    setConsumedMealIds([])
    setConsumed({ kcal: 0, protein: 0, carbs: 0, fat: 0 })
    setShoppingList((prev) => mergeHaveAtHome(consolidateIngredients(shoppableMeals(plan)), prev))
    setChosenStoreId(null)
    setChosenDeliveryMode(null)
    setOrderPlaced(false)
  }

  function completeOnboarding() {
    setOnboarded(true)
    const plan = generateWeekPlan(profile, computeTargets(profile), constraints)
    setWeekPlan(plan)
    const breakfast = plan.find((m) => m.day === 1 && m.slot === 'petit-dejeuner')
    setConsumedMealIds(breakfast ? [breakfast.id] : [])
    setConsumed(breakfast ? { kcal: breakfast.kcal, protein: breakfast.protein, carbs: breakfast.carbs, fat: breakfast.fat } : { kcal: 0, protein: 0, carbs: 0, fat: 0 })
    setShoppingList((prev) => mergeHaveAtHome(consolidateIngredients(shoppableMeals(plan)), prev))
    setCourseStep('menu')
    setOrderPlaced(false)
  }

  function setConstraints(c: Partial<PlannerConstraints>) {
    setConstraintsState((prev) => ({ ...prev, ...c }))
  }

  function applyPreferences() {
    const plan = generateWeekPlan(profile, targets, constraints)
    applyNewPlan(plan)
  }

  function replaceMeal(mealId: string) {
    const old = weekPlan.find((m) => m.id === mealId)
    const newPlan = replaceMealInPlan(weekPlan, mealId, profile, targets, constraints)
    setWeekPlan(newPlan)
    subtractIfConsumed(old, mealId)
    setShoppingList((prev) => mergeHaveAtHome(consolidateIngredients(shoppableMeals(newPlan)), prev))
  }

  function mealAlternatives(mealId: string, count = 3): RecipeTemplate[] {
    return getMealAlternatives(weekPlan, mealId, profile, targets, constraints, count)
  }

  function chooseMealAlternative(mealId: string, recipeId: string) {
    const old = weekPlan.find((m) => m.id === mealId)
    const newPlan = applyMealChoice(weekPlan, mealId, recipeId)
    setWeekPlan(newPlan)
    subtractIfConsumed(old, mealId)
    setShoppingList((prev) => mergeHaveAtHome(consolidateIngredients(shoppableMeals(newPlan)), prev))
  }

  function swapMeals(mealIdA: string, mealIdB: string) {
    const a = weekPlan.find((m) => m.id === mealIdA)
    const b = weekPlan.find((m) => m.id === mealIdB)
    const newPlan = swapMealsBetweenDays(weekPlan, mealIdA, mealIdB)
    setWeekPlan(newPlan)
    subtractIfConsumed(a, mealIdA)
    subtractIfConsumed(b, mealIdB)
    setShoppingList((prev) => mergeHaveAtHome(consolidateIngredients(shoppableMeals(newPlan)), prev))
  }

  function subtractIfConsumed(old: Meal | undefined, mealId: string) {
    if (!old || !consumedMealIds.includes(mealId)) return
    setConsumedMealIds((prev) => prev.filter((id) => id !== mealId))
    setConsumed((c) => ({
      kcal: Math.max(0, c.kcal - old.kcal),
      protein: Math.max(0, c.protein - old.protein),
      carbs: Math.max(0, c.carbs - old.carbs),
      fat: Math.max(0, c.fat - old.fat),
    }))
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

  function toggleHaveAtHome(id: string) {
    setShoppingList((prev) => prev.map((i) => (i.id === id ? { ...i, haveAtHome: !i.haveAtHome } : i)))
  }

  function placeOrder(storeId: string, mode: DeliveryMode) {
    setChosenStoreId(storeId)
    setChosenDeliveryMode(mode)
    setOrderPlaced(true)
  }

  function resetOrder() {
    setOrderPlaced(false)
    setChosenStoreId(null)
    setChosenDeliveryMode(null)
    setCourseStep('menu')
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
        weekStats,
        applyPreferences,
        courseStep,
        setCourseStep,
        mealAlternatives,
        chooseMealAlternative,
        swapMeals,
        replaceMeal,
        consumedMealIds,
        toggleMealConsumed,
        consumed,
        shoppingList,
        toggleHaveAtHome,
        storeQuotes,
        chosenStoreId,
        chosenDeliveryMode,
        orderPlaced,
        placeOrder,
        resetOrder,
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
