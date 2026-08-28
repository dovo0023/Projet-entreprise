import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type { MacroTargets, ShoppingItem, UserProfile } from '../types'
import { SHOPPING_LIST } from '../data/mock'

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

interface AppState {
  onboarded: boolean
  profile: UserProfile
  setProfile: (p: Partial<UserProfile>) => void
  completeOnboarding: () => void
  targets: MacroTargets
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
  const [consumedMealIds, setConsumedMealIds] = useState<string[]>(['d1-pdj'])
  const [consumed, setConsumed] = useState<MacroTargets>({ kcal: 380, protein: 28, carbs: 45, fat: 9 })
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>(SHOPPING_LIST)
  const [sentToDrive, setSentToDrive] = useState(false)

  const targets = useMemo(() => computeTargets(profile), [profile])

  function setProfile(p: Partial<UserProfile>) {
    setProfileState((prev) => ({ ...prev, ...p }))
  }

  function completeOnboarding() {
    setOnboarded(true)
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
