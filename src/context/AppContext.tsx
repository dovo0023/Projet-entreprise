import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type {
  Appointment,
  AppointmentSlot,
  ChatMessage,
  DayMealNeeds,
  DeliveryMode,
  DietType,
  Goal,
  HouseholdMember,
  JournalEntry,
  KitchenEquipment,
  MacroTargets,
  Meal,
  PersonalRecord,
  PlannerConstraints,
  PractitionerListing,
  RecipeTemplate,
  ShoppingItem,
  UserProfile,
} from '../types'
import {
  aggregateAllergens,
  applyMealChoice,
  computeWeekStats,
  generateWeekPlan,
  getMealAlternatives,
  mostRestrictiveDiet,
  RECIPE_COST_MAP,
  replaceMealInPlan,
  swapMealsBetweenDays,
  type WeekStats,
} from '../engine/planner'
import { consolidateIngredients } from '../engine/shoppingConsolidator'
import { quoteStores, type StoreQuote } from '../engine/storeQuote'
import { ADHERENCE_HISTORY, generatePersonalHistory, SELF_JOURNAL_ENTRIES, WEIGHT_HISTORY } from '../data/mock'

/** Clé du foyer désignant le profil principal dans `personalRecords` (les autres membres utilisent leur `id`). */
export const SELF_RECORD_ID = 'self'

/** La maquette se déroule toujours "aujourd'hui" lundi 1er septembre : une pesée du jour porte cette date. */
const TODAY_LABEL = '01/09'

export const DEFAULT_PROFILE: UserProfile = {
  firstName: 'Camille',
  email: '',
  age: 29,
  sex: 'femme',
  height: 168,
  weight: 71,
  activityLevel: 'modere',
  goal: 'seche',
  dietType: 'omnivore',
  allergens: [],
  plan: 'Starter',
}

export const DEFAULT_CONSTRAINTS: PlannerConstraints = {
  timeBand: null,
  snacks: { enabled: false, timing: 'matin' },
  weeklyBudget: null,
  macroFocus: 'equilibre',
  // 7 = on cuisine chaque jour (comportement classique, aucun changement pour l'existant).
  cookingSessions: { midi: 7, soir: 7 },
  hotSessions: { midi: null, soir: null },
}

/** Par défaut on suppose tout l'équipement disponible : l'utilisateur décoche ce qu'il n'a pas. */
export const DEFAULT_KITCHEN_EQUIPMENT: KitchenEquipment[] = ['four', 'micro_ondes', 'airfryer', 'blender']

export const PATIENT_SHARE_CODE = 'NF-72K9'

export type CourseStep = 'menu' | 'ingredients' | 'store'

const DEFAULT_MESSAGES: ChatMessage[] = [
  { from: 'patient', text: 'Bonjour Dr Marchand, le menu de cette semaine me convient très bien !', time: 'Lun 09:14' },
  { from: 'praticien', text: 'Super Camille, continuez ainsi. On garde le cap sur -350 kcal/j.', time: 'Lun 10:02' },
]

const STORAGE_KEY = 'nutriflow_b2c_state_v6'

interface PersistedState {
  onboarded: boolean
  profile: UserProfile
  householdMembers: HouseholdMember[]
  personalRecords: Record<string, PersonalRecord>
  kitchenEquipment: KitchenEquipment[]
  cookingIntroSeen: boolean
  constraints: PlannerConstraints
  mealNeeds: DayMealNeeds
  weekPlan: Meal[]
  consumedMealIds: string[]
  consumed: MacroTargets
  shoppingList: ShoppingItem[]
  messages: ChatMessage[]
  courseStep: CourseStep
  chosenStoreId: string | null
  chosenDeliveryMode: DeliveryMode | null
  orderPlaced: boolean
  appointments: Appointment[]
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

/** Par défaut, l'app prévoit midi et soir tous les jours (comportement historique, aucune régression). */
function defaultMealNeeds(): DayMealNeeds {
  const needs: DayMealNeeds = {}
  for (let day = 1; day <= 7; day++) needs[day] = { midi: true, soir: true }
  return needs
}

/** Le flux courses (menu → ingrédients → magasin) porte sur les repas de midi, du soir et les encas —
 *  sauf les jours/créneaux marqués "libres" (l'utilisateur mange autre chose, pas besoin de les acheter). */
function shoppableMeals(plan: Meal[], mealNeeds: DayMealNeeds): Meal[] {
  return plan.filter((m) => {
    if (m.slot === 'petit-dejeuner') return false
    if (m.slot === 'midi') return mealNeeds[m.day]?.midi ?? true
    if (m.slot === 'soir') return mealNeeds[m.day]?.soir ?? true
    return true
  })
}

function mergeHaveAtHome(newItems: ShoppingItem[], prevItems: ShoppingItem[]): ShoppingItem[] {
  const owned = new Set(prevItems.filter((i) => i.haveAtHome).map((i) => i.name.toLowerCase()))
  return newItems.map((i) => (owned.has(i.name.toLowerCase()) ? { ...i, haveAtHome: true } : i))
}

interface AppState {
  onboarded: boolean
  profile: UserProfile
  setProfile: (p: Partial<UserProfile>) => void
  updateSelfDietaryProfile: (patch: Partial<Pick<UserProfile, 'goal' | 'dietType' | 'allergens'>>) => void
  completeOnboarding: () => void
  targets: MacroTargets

  householdMembers: HouseholdMember[]
  addHouseholdMember: (name: string, goal: Goal, dietType: DietType, allergens: string[]) => void
  updateHouseholdMember: (id: string, patch: Partial<Omit<HouseholdMember, 'id'>>) => void
  removeHouseholdMember: (id: string) => void

  personalRecords: Record<string, PersonalRecord>
  logWeight: (personId: string, weight: number) => void
  addJournalEntry: (personId: string, entry: Omit<JournalEntry, 'id'>) => void
  removeJournalEntry: (personId: string, entryId: string) => void

  kitchenEquipment: KitchenEquipment[]
  setKitchenEquipment: (equipment: KitchenEquipment[]) => void

  cookingIntroSeen: boolean
  completeCookingIntro: () => void

  weekPlan: Meal[]
  constraints: PlannerConstraints
  setConstraints: (c: Partial<PlannerConstraints>) => void
  weekStats: WeekStats

  mealNeeds: DayMealNeeds
  setMealNeedsForAllDays: (midi: boolean, soir: boolean) => void
  setDayMealNeed: (day: number, slot: 'midi' | 'soir', needed: boolean) => void

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

  appointments: Appointment[]
  bookAppointment: (practitioner: PractitionerListing, slot: AppointmentSlot) => void
  cancelAppointment: (id: string) => void
}

const AppContext = createContext<AppState | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [persisted] = useState(() => loadPersisted())

  const [onboarded, setOnboarded] = useState(persisted?.onboarded ?? false)
  const [profile, setProfileState] = useState<UserProfile>(persisted?.profile ?? DEFAULT_PROFILE)
  const [householdMembers, setHouseholdMembers] = useState<HouseholdMember[]>(persisted?.householdMembers ?? [])
  const [personalRecords, setPersonalRecords] = useState<Record<string, PersonalRecord>>(
    persisted?.personalRecords ?? { [SELF_RECORD_ID]: { weightHistory: WEIGHT_HISTORY, adherenceHistory: ADHERENCE_HISTORY, journalEntries: SELF_JOURNAL_ENTRIES } },
  )
  const [constraints, setConstraintsState] = useState<PlannerConstraints>(persisted?.constraints ?? DEFAULT_CONSTRAINTS)
  const [mealNeeds, setMealNeeds] = useState<DayMealNeeds>(persisted?.mealNeeds ?? defaultMealNeeds())
  const [kitchenEquipment, setKitchenEquipmentState] = useState<KitchenEquipment[]>(persisted?.kitchenEquipment ?? DEFAULT_KITCHEN_EQUIPMENT)
  const [cookingIntroSeen, setCookingIntroSeen] = useState(persisted?.cookingIntroSeen ?? false)

  const targets = useMemo(() => computeTargets(profile), [profile])
  const householdAllergens = useMemo(() => aggregateAllergens(profile, householdMembers), [profile, householdMembers])
  const requiredDiet = useMemo(() => mostRestrictiveDiet(profile, householdMembers), [profile, householdMembers])

  const [initial] = useState(() => {
    const baseMealNeeds = persisted?.mealNeeds ?? defaultMealNeeds()
    if (persisted?.weekPlan?.length) {
      return {
        plan: persisted.weekPlan,
        shoppingList: persisted.shoppingList ?? consolidateIngredients(shoppableMeals(persisted.weekPlan, baseMealNeeds)),
        consumedMealIds: persisted.consumedMealIds ?? [],
        consumed: persisted.consumed ?? { kcal: 0, protein: 0, carbs: 0, fat: 0 },
      }
    }
    const baseProfile = persisted?.profile ?? DEFAULT_PROFILE
    const baseMembers = persisted?.householdMembers ?? []
    const baseConstraints = persisted?.constraints ?? DEFAULT_CONSTRAINTS
    const baseEquipment = persisted?.kitchenEquipment ?? DEFAULT_KITCHEN_EQUIPMENT
    const plan = generateWeekPlan(
      computeTargets(baseProfile),
      baseConstraints,
      aggregateAllergens(baseProfile, baseMembers),
      mostRestrictiveDiet(baseProfile, baseMembers),
      baseEquipment,
    )
    const breakfast = plan.find((m) => m.day === 1 && m.slot === 'petit-dejeuner')
    return {
      plan,
      shoppingList: consolidateIngredients(shoppableMeals(plan, baseMealNeeds)),
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
  const [appointments, setAppointments] = useState<Appointment[]>(persisted?.appointments ?? [])

  const [courseStep, setCourseStep] = useState<CourseStep>(persisted?.courseStep ?? 'menu')
  const [chosenStoreId, setChosenStoreId] = useState<string | null>(persisted?.chosenStoreId ?? null)
  const [chosenDeliveryMode, setChosenDeliveryMode] = useState<DeliveryMode | null>(persisted?.chosenDeliveryMode ?? null)
  const [orderPlaced, setOrderPlaced] = useState(persisted?.orderPlaced ?? false)
  const regenSeed = useRef(0)

  const weekStats = useMemo(() => computeWeekStats(weekPlan, targets, constraints, RECIPE_COST_MAP), [weekPlan, targets, constraints])
  const storeQuotes = useMemo(() => quoteStores(shoppingList.filter((i) => !i.haveAtHome)), [shoppingList])

  useEffect(() => {
    try {
      const payload: PersistedState = {
        onboarded,
        profile,
        householdMembers,
        personalRecords,
        kitchenEquipment,
        cookingIntroSeen,
        constraints,
        mealNeeds,
        weekPlan,
        consumedMealIds,
        consumed,
        shoppingList,
        messages,
        courseStep,
        chosenStoreId,
        chosenDeliveryMode,
        orderPlaced,
        appointments,
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    } catch {
      // Stockage indisponible (navigation privée, quota) : la session continue simplement en mémoire.
    }
  }, [
    onboarded,
    profile,
    householdMembers,
    personalRecords,
    kitchenEquipment,
    cookingIntroSeen,
    constraints,
    mealNeeds,
    weekPlan,
    consumedMealIds,
    consumed,
    shoppingList,
    messages,
    courseStep,
    chosenStoreId,
    chosenDeliveryMode,
    orderPlaced,
    appointments,
  ])

  function setProfile(p: Partial<UserProfile>) {
    setProfileState((prev) => ({ ...prev, ...p }))
  }

  /** Modifier son propre objectif/régime/allergies est aussi un changement du foyer : ça régénère
   *  immédiatement le menu (nouvelles cibles caloriques et/ou nouveaux filtres durs). */
  function updateSelfDietaryProfile(patch: Partial<Pick<UserProfile, 'goal' | 'dietType' | 'allergens'>>) {
    const nextProfile = { ...profile, ...patch }
    setProfileState(nextProfile)
    const plan = generateWeekPlan(
      computeTargets(nextProfile),
      constraints,
      aggregateAllergens(nextProfile, householdMembers),
      mostRestrictiveDiet(nextProfile, householdMembers),
      kitchenEquipment,
      regenSeed.current,
    )
    applyNewPlan(plan)
  }

  /** Un changement de foyer (ajout/modif/suppression) peut changer le régime ou les allergènes à respecter
   *  pour le menu partagé : on régénère immédiatement, comme pour "Valider et régénérer le menu". */
  function regenerateForHousehold(nextMembers: HouseholdMember[]) {
    const plan = generateWeekPlan(
      targets,
      constraints,
      aggregateAllergens(profile, nextMembers),
      mostRestrictiveDiet(profile, nextMembers),
      kitchenEquipment,
      regenSeed.current,
    )
    applyNewPlan(plan)
  }

  function addHouseholdMember(name: string, goal: Goal, dietType: DietType, allergens: string[]) {
    const member: HouseholdMember = { id: `hm-${Date.now()}-${Math.round(Math.random() * 9999)}`, name, goal, dietType, allergens }
    const next = [...householdMembers, member]
    setHouseholdMembers(next)
    setPersonalRecords((prev) => ({ ...prev, [member.id]: generatePersonalHistory(member.id, member.goal) }))
    regenerateForHousehold(next)
  }

  function updateHouseholdMember(id: string, patch: Partial<Omit<HouseholdMember, 'id'>>) {
    const next = householdMembers.map((m) => (m.id === id ? { ...m, ...patch } : m))
    setHouseholdMembers(next)
    regenerateForHousehold(next)
  }

  function removeHouseholdMember(id: string) {
    const next = householdMembers.filter((m) => m.id !== id)
    setHouseholdMembers(next)
    setPersonalRecords((prev) => {
      const { [id]: _removed, ...rest } = prev
      return rest
    })
    regenerateForHousehold(next)
  }

  /** Ajoute (ou met à jour si déjà loggé aujourd'hui) la pesée d'une personne du foyer dans son propre historique. */
  function logWeight(personId: string, weight: number) {
    setPersonalRecords((prev) => {
      const record = prev[personId]
      if (!record) return prev
      const last = record.weightHistory[record.weightHistory.length - 1]
      const weightHistory =
        last?.date === TODAY_LABEL
          ? record.weightHistory.map((w, i) => (i === record.weightHistory.length - 1 ? { ...w, weight } : w))
          : [...record.weightHistory, { date: TODAY_LABEL, weight }]
      return { ...prev, [personId]: { ...record, weightHistory } }
    })
  }

  /** Ajoute une entrée libre au journal alimentaire d'une personne (ce qu'elle a mangé en plus/à la place du menu). */
  function addJournalEntry(personId: string, entry: Omit<JournalEntry, 'id'>) {
    setPersonalRecords((prev) => {
      const record = prev[personId] ?? { weightHistory: [], adherenceHistory: [], journalEntries: [] }
      const newEntry: JournalEntry = { ...entry, id: `je-${Date.now()}-${Math.round(Math.random() * 9999)}` }
      return { ...prev, [personId]: { ...record, journalEntries: [...record.journalEntries, newEntry] } }
    })
  }

  function removeJournalEntry(personId: string, entryId: string) {
    setPersonalRecords((prev) => {
      const record = prev[personId]
      if (!record) return prev
      return { ...prev, [personId]: { ...record, journalEntries: record.journalEntries.filter((e) => e.id !== entryId) } }
    })
  }

  function applyNewPlan(plan: Meal[]) {
    setWeekPlan(plan)
    setConsumedMealIds([])
    setConsumed({ kcal: 0, protein: 0, carbs: 0, fat: 0 })
    setShoppingList((prev) => mergeHaveAtHome(consolidateIngredients(shoppableMeals(plan, mealNeeds)), prev))
    setChosenStoreId(null)
    setChosenDeliveryMode(null)
    setOrderPlaced(false)
  }

  /** Réglage global "combien de repas prévoir cette semaine" (questionnaire Courses / panneau Préférences) :
   *  s'applique aux 7 jours d'un coup. Un ajustement plus fin, jour par jour, se fait ensuite depuis Planning. */
  function setMealNeedsForAllDays(midi: boolean, soir: boolean) {
    const next: DayMealNeeds = {}
    for (let day = 1; day <= 7; day++) next[day] = { midi, soir }
    setMealNeeds(next)
    setShoppingList((prev) => mergeHaveAtHome(consolidateIngredients(shoppableMeals(weekPlan, next)), prev))
  }

  /** Bascule un jour/créneau précis entre "repas prévu par l'app" et "repas libre" (Planning/Aujourd'hui). */
  function setDayMealNeed(day: number, slot: 'midi' | 'soir', needed: boolean) {
    const next: DayMealNeeds = { ...mealNeeds, [day]: { midi: mealNeeds[day]?.midi ?? true, soir: mealNeeds[day]?.soir ?? true, [slot]: needed } }
    setMealNeeds(next)
    setShoppingList((prev) => mergeHaveAtHome(consolidateIngredients(shoppableMeals(weekPlan, next)), prev))
  }

  /** Changer l'équipement disponible régénère le menu comme un changement de foyer : c'est un filtre dur. */
  function setKitchenEquipment(equipment: KitchenEquipment[]) {
    setKitchenEquipmentState(equipment)
    const plan = generateWeekPlan(targets, constraints, householdAllergens, requiredDiet, equipment, regenSeed.current)
    applyNewPlan(plan)
  }

  /** Marque le questionnaire de bienvenue de Courses comme vu, qu'il ait été validé ou passé. */
  function completeCookingIntro() {
    setCookingIntroSeen(true)
  }

  function completeOnboarding() {
    setOnboarded(true)
    const plan = generateWeekPlan(computeTargets(profile), constraints, householdAllergens, requiredDiet, kitchenEquipment)
    setWeekPlan(plan)
    const breakfast = plan.find((m) => m.day === 1 && m.slot === 'petit-dejeuner')
    setConsumedMealIds(breakfast ? [breakfast.id] : [])
    setConsumed(breakfast ? { kcal: breakfast.kcal, protein: breakfast.protein, carbs: breakfast.carbs, fat: breakfast.fat } : { kcal: 0, protein: 0, carbs: 0, fat: 0 })
    setShoppingList((prev) => mergeHaveAtHome(consolidateIngredients(shoppableMeals(plan, mealNeeds)), prev))
    setCourseStep('menu')
    setOrderPlaced(false)
  }

  function setConstraints(c: Partial<PlannerConstraints>) {
    setConstraintsState((prev) => ({ ...prev, ...c }))
  }

  function applyPreferences() {
    regenSeed.current += 1
    const plan = generateWeekPlan(targets, constraints, householdAllergens, requiredDiet, kitchenEquipment, regenSeed.current)
    applyNewPlan(plan)
  }

  function replaceMeal(mealId: string) {
    const old = weekPlan.find((m) => m.id === mealId)
    const newPlan = replaceMealInPlan(weekPlan, mealId, targets, constraints, householdAllergens, requiredDiet, kitchenEquipment)
    setWeekPlan(newPlan)
    subtractIfConsumed(old, mealId)
    setShoppingList((prev) => mergeHaveAtHome(consolidateIngredients(shoppableMeals(newPlan, mealNeeds)), prev))
  }

  function mealAlternatives(mealId: string, count = 3): RecipeTemplate[] {
    return getMealAlternatives(weekPlan, mealId, targets, constraints, householdAllergens, requiredDiet, kitchenEquipment, count)
  }

  function chooseMealAlternative(mealId: string, recipeId: string) {
    const old = weekPlan.find((m) => m.id === mealId)
    const newPlan = applyMealChoice(weekPlan, mealId, recipeId)
    setWeekPlan(newPlan)
    subtractIfConsumed(old, mealId)
    setShoppingList((prev) => mergeHaveAtHome(consolidateIngredients(shoppableMeals(newPlan, mealNeeds)), prev))
  }

  function swapMeals(mealIdA: string, mealIdB: string) {
    const a = weekPlan.find((m) => m.id === mealIdA)
    const b = weekPlan.find((m) => m.id === mealIdB)
    const newPlan = swapMealsBetweenDays(weekPlan, mealIdA, mealIdB)
    setWeekPlan(newPlan)
    subtractIfConsumed(a, mealIdA)
    subtractIfConsumed(b, mealIdB)
    setShoppingList((prev) => mergeHaveAtHome(consolidateIngredients(shoppableMeals(newPlan, mealNeeds)), prev))
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

  /** Réserve un créneau auprès d'un praticien de l'annuaire "près de chez moi". */
  function bookAppointment(practitioner: PractitionerListing, slot: AppointmentSlot) {
    const appointment: Appointment = {
      id: `apt-${Date.now()}-${Math.round(Math.random() * 9999)}`,
      practitionerId: practitioner.id,
      practitionerName: practitioner.name,
      dayLabel: slot.dayLabel,
      time: slot.time,
    }
    setAppointments((prev) => [...prev, appointment])
  }

  function cancelAppointment(id: string) {
    setAppointments((prev) => prev.filter((a) => a.id !== id))
  }

  return (
    <AppContext.Provider
      value={{
        onboarded,
        profile,
        setProfile,
        updateSelfDietaryProfile,
        completeOnboarding,
        targets,
        householdMembers,
        addHouseholdMember,
        updateHouseholdMember,
        removeHouseholdMember,
        personalRecords,
        logWeight,
        addJournalEntry,
        removeJournalEntry,
        kitchenEquipment,
        setKitchenEquipment,
        cookingIntroSeen,
        completeCookingIntro,
        weekPlan,
        constraints,
        setConstraints,
        weekStats,
        mealNeeds,
        setMealNeedsForAllDays,
        setDayMealNeed,
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
        appointments,
        bookAppointment,
        cancelAppointment,
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
