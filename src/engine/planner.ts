import { RECIPE_POOL } from './recipes'
import type { HotColdPattern, MacroTargets, Meal, PlannerConstraints, RecipeSlot, RecipeTemplate, Temperature, TimeBand, UserProfile } from '../types'

const DIABETES_TAG = 'Diabète (contrôle glycémique)'

const SLOT_CODE: Record<Meal['slot'], string> = {
  'petit-dejeuner': 'pdj',
  midi: 'midi',
  soir: 'soir',
  'encas-matin': 'am',
  'encas-apresmidi': 'pm',
}

/** Les créneaux encas partagent un seul pool de recettes ("encas"), matin ou après-midi. */
function recipeSlotFor(slot: Meal['slot']): RecipeSlot {
  if (slot === 'encas-matin' || slot === 'encas-apresmidi') return 'encas'
  return slot
}

/** Créneaux actifs de la journée, selon que des encas sont activés et à quel moment. */
function activeSlots(constraints: PlannerConstraints): Meal['slot'][] {
  const slots: Meal['slot'][] = ['petit-dejeuner', 'midi', 'soir']
  if (constraints.snacks.enabled) {
    if (constraints.snacks.timing === 'matin' || constraints.snacks.timing === 'les_deux') slots.push('encas-matin')
    if (constraints.snacks.timing === 'apres_midi' || constraints.snacks.timing === 'les_deux') slots.push('encas-apresmidi')
  }
  return slots
}

/** Répartition indicative des calories/macros journalières entre les créneaux actifs. */
function computeSlotShares(constraints: PlannerConstraints): Partial<Record<Meal['slot'], number>> {
  const { enabled, timing } = constraints.snacks
  if (!enabled) return { 'petit-dejeuner': 0.25, midi: 0.4, soir: 0.35 }
  if (timing === 'les_deux') return { 'petit-dejeuner': 0.2, midi: 0.35, soir: 0.3, 'encas-matin': 0.075, 'encas-apresmidi': 0.075 }
  const base = { 'petit-dejeuner': 0.22, midi: 0.37, soir: 0.32 }
  return timing === 'matin' ? { ...base, 'encas-matin': 0.09 } : { ...base, 'encas-apresmidi': 0.09 }
}

function slotTarget(targets: MacroTargets, slot: Meal['slot'], constraints: PlannerConstraints): MacroTargets {
  const share = computeSlotShares(constraints)[slot] ?? 0.1
  return {
    kcal: targets.kcal * share,
    protein: targets.protein * share,
    carbs: targets.carbs * share,
    fat: targets.fat * share,
  }
}

/** Température souhaitée pour un créneau donné d'après la répartition chaud/froid choisie. */
function desiredTemperature(slot: Meal['slot'], pattern: HotColdPattern): Temperature | null {
  if (slot !== 'midi' && slot !== 'soir') return null
  const [midi, soir] = pattern.split('_') as [Temperature, Temperature]
  return slot === 'midi' ? midi : soir
}

function timeBandOf(prepTime: number): TimeBand {
  if (prepTime <= 15) return 'court'
  if (prepTime <= 30) return 'moyen'
  return 'long'
}

const TIME_BAND_INDEX: Record<TimeBand, number> = { court: 0, moyen: 1, long: 2 }

/** Filtre dur : allergènes/contre-indications du profil, jamais négociables. */
function isEligible(recipe: RecipeTemplate, profile: UserProfile): boolean {
  const hasForbiddenAllergen = recipe.allergenTags.some((tag) => profile.allergens.includes(tag))
  if (hasForbiddenAllergen) return false
  if (recipe.highGI && profile.allergens.includes(DIABETES_TAG)) return false
  return true
}

/** Écart relatif pondéré entre une recette et la cible macro du repas : 0 = parfait. */
function macroDeviation(recipe: RecipeTemplate, target: MacroTargets, macroFocus: PlannerConstraints['macroFocus']): number {
  const weights = macroFocus === 'riche_proteines' ? { kcal: 1, protein: 2.2, carbs: 0.6, fat: 0.6 } : { kcal: 1.2, protein: 1, carbs: 0.8, fat: 0.8 }
  const rel = (value: number, ref: number) => Math.abs(value - ref) / Math.max(ref, 1)
  return (
    rel(recipe.kcal, target.kcal) * weights.kcal +
    rel(recipe.protein, target.protein) * weights.protein +
    rel(recipe.carbs, target.carbs) * weights.carbs +
    rel(recipe.fat, target.fat) * weights.fat
  )
}

interface ScoreContext {
  slot: Meal['slot']
  target: MacroTargets
  constraints: PlannerConstraints
  usageCount: Map<string, number>
  dayIndex: number // 0-6
  totalDays: number
  budgetSpent: number
  budgetSlotsRemaining: number
}

/** Score composite : plus bas = meilleur choix. Combine macros, temps, chaud/froid, budget, fraîcheur et variété. */
function scoreRecipe(recipe: RecipeTemplate, ctx: ScoreContext): number {
  let score = macroDeviation(recipe, ctx.target, ctx.constraints.macroFocus)

  // Temps de préparation souhaité (bande large plutôt que seuil strict).
  if (ctx.constraints.timeBand) {
    const diff = Math.abs(TIME_BAND_INDEX[timeBandOf(recipe.prepTime)] - TIME_BAND_INDEX[ctx.constraints.timeBand])
    score += diff * 0.5
  }

  // Répartition chaud/froid choisie pour midi et soir.
  if (ctx.constraints.hotColdPattern && recipe.temperature) {
    const desired = desiredTemperature(ctx.slot, ctx.constraints.hotColdPattern)
    if (desired && recipe.temperature !== desired) score += 0.6
  }

  // Contrainte budget : pénalise les recettes chères quand le budget restant par repas est serré.
  if (ctx.constraints.weeklyBudget != null && ctx.budgetSlotsRemaining > 0) {
    const remainingBudget = ctx.constraints.weeklyBudget - ctx.budgetSpent
    const affordablePerSlot = remainingBudget / ctx.budgetSlotsRemaining
    if (recipe.cost > affordablePerSlot) {
      score += 0.8 * (recipe.cost - affordablePerSlot) / Math.max(affordablePerSlot, 0.5)
    }
  }

  // Séquençage fraîcheur : les recettes ultra-fraîches (tier 1) sont favorisées en début de semaine,
  // les recettes longue conservation (tier 3) favorisées en fin de semaine.
  const idealPosition = (recipe.freshnessTier - 1) / 2 // 0, 0.5, 1
  const actualPosition = ctx.dayIndex / Math.max(ctx.totalDays - 1, 1)
  score += 0.35 * Math.abs(idealPosition - actualPosition)

  // Variété : pénalise fortement la répétition d'une même recette dans la semaine.
  const used = ctx.usageCount.get(recipe.id) ?? 0
  score += used * 0.9

  return score
}

function freshnessDayFor(recipe: RecipeTemplate, day: number): number {
  const offset = recipe.freshnessTier === 1 ? 0 : recipe.freshnessTier === 2 ? 1 : 3
  return Math.min(7, day + offset)
}

function toMeal(recipe: RecipeTemplate, day: number, slot: Meal['slot']): Meal {
  return {
    id: `${recipe.id}-d${day}-${SLOT_CODE[slot]}`,
    day,
    slot,
    name: recipe.name,
    kcal: recipe.kcal,
    protein: recipe.protein,
    carbs: recipe.carbs,
    fat: recipe.fat,
    prepTime: recipe.prepTime,
    freshnessDay: freshnessDayFor(recipe, day),
    ingredients: recipe.ingredients,
    steps: recipe.steps,
    image: recipe.image,
  }
}

interface Assignment {
  day: number
  slot: Meal['slot']
  recipe: RecipeTemplate
}

/** Génère un planning de 7 jours en optimisant simultanément macros, temps, chaud/froid, budget, fraîcheur et variété. */
export function generateWeekPlan(profile: UserProfile, targets: MacroTargets, constraints: PlannerConstraints): Meal[] {
  const eligible = RECIPE_POOL.filter((r) => isEligible(r, profile))
  const byRecipeSlot: Record<RecipeSlot, RecipeTemplate[]> = {
    'petit-dejeuner': eligible.filter((r) => r.slot === 'petit-dejeuner'),
    midi: eligible.filter((r) => r.slot === 'midi'),
    soir: eligible.filter((r) => r.slot === 'soir'),
    encas: eligible.filter((r) => r.slot === 'encas'),
  }

  const slots = activeSlots(constraints)
  const usageCount = new Map<string, number>()
  const assignments: Assignment[] = []
  let budgetSpent = 0
  const totalSlots = 7 * slots.length
  let slotsFilled = 0

  for (let day = 1; day <= 7; day++) {
    for (const slot of slots) {
      const candidates = byRecipeSlot[recipeSlotFor(slot)]
      if (candidates.length === 0) continue
      const target = slotTarget(targets, slot, constraints)
      const ctx: ScoreContext = {
        slot,
        target,
        constraints,
        usageCount,
        dayIndex: day - 1,
        totalDays: 7,
        budgetSpent,
        budgetSlotsRemaining: totalSlots - slotsFilled,
      }
      let best = candidates[0]
      let bestScore = Infinity
      for (const candidate of candidates) {
        const s = scoreRecipe(candidate, ctx)
        if (s < bestScore) {
          bestScore = s
          best = candidate
        }
      }
      assignments.push({ day, slot, recipe: best })
      usageCount.set(best.id, (usageCount.get(best.id) ?? 0) + 1)
      budgetSpent += best.cost
      slotsFilled++
    }
  }

  // Passe d'amélioration locale (recherche 2-opt) : on tente d'échanger deux repas du même créneau
  // entre deux jours si cela réduit le score combiné, sans jamais casser une contrainte de fraîcheur logique.
  for (let pass = 0; pass < 2; pass++) {
    for (const slot of slots) {
      const idxs = assignments.map((a, i) => (a.slot === slot ? i : -1)).filter((i) => i >= 0)
      for (let a = 0; a < idxs.length; a++) {
        for (let b = a + 1; b < idxs.length; b++) {
          const i = idxs[a]
          const j = idxs[b]
          const ai = assignments[i]
          const aj = assignments[j]
          if (ai.recipe.id === aj.recipe.id) continue

          const scoreBefore =
            scoreRecipe(ai.recipe, buildCtx(ai.day, slot, targets, constraints, undoUsage(usageCount, ai.recipe.id))) +
            scoreRecipe(aj.recipe, buildCtx(aj.day, slot, targets, constraints, undoUsage(usageCount, aj.recipe.id)))
          const scoreAfter =
            scoreRecipe(aj.recipe, buildCtx(ai.day, slot, targets, constraints, undoUsage(usageCount, aj.recipe.id))) +
            scoreRecipe(ai.recipe, buildCtx(aj.day, slot, targets, constraints, undoUsage(usageCount, ai.recipe.id)))

          if (scoreAfter < scoreBefore - 0.05) {
            assignments[i] = { ...ai, recipe: aj.recipe }
            assignments[j] = { ...aj, recipe: ai.recipe }
          }
        }
      }
    }
  }

  return assignments.map((a) => toMeal(a.recipe, a.day, a.slot))
}

function undoUsage(usageCount: Map<string, number>, recipeId: string): Map<string, number> {
  const clone = new Map(usageCount)
  clone.set(recipeId, Math.max(0, (clone.get(recipeId) ?? 1) - 1))
  return clone
}

function buildCtx(
  day: number,
  slot: Meal['slot'],
  targets: MacroTargets,
  constraints: PlannerConstraints,
  usageCount: Map<string, number>,
): ScoreContext {
  return {
    slot,
    target: slotTarget(targets, slot, constraints),
    constraints,
    usageCount,
    dayIndex: day - 1,
    totalDays: 7,
    budgetSpent: 0,
    budgetSlotsRemaining: 21,
  }
}

function recipeIdFromMealId(mealId: string): string {
  return mealId.replace(/-d\d+-[a-z]+$/, '')
}

/** Retrouve la fiche recette d'origine d'un repas du planning (pour connaître son tier de fraîcheur réel). */
export function getRecipeTemplate(mealId: string): RecipeTemplate | undefined {
  return RECIPE_POOL.find((r) => r.id === recipeIdFromMealId(mealId))
}

/** Classe les recettes candidates pour le créneau d'un repas donné, meilleure en premier. */
function rankAlternatives(plan: Meal[], mealId: string, profile: UserProfile, targets: MacroTargets, constraints: PlannerConstraints): RecipeTemplate[] {
  const current = plan.find((m) => m.id === mealId)
  if (!current) return []

  const currentRecipeId = recipeIdFromMealId(current.id)
  const usedElsewhere = new Set(plan.filter((m) => m.id !== mealId && m.slot === current.slot).map((m) => recipeIdFromMealId(m.id)))

  const eligible = RECIPE_POOL.filter((r) => r.slot === recipeSlotFor(current.slot) && isEligible(r, profile) && r.id !== currentRecipeId)
  const usageCount = new Map<string, number>()
  usedElsewhere.forEach((id) => usageCount.set(id, 1))

  const ctx: ScoreContext = {
    slot: current.slot,
    target: slotTarget(targets, current.slot, constraints),
    constraints,
    usageCount,
    dayIndex: current.day - 1,
    totalDays: 7,
    budgetSpent: 0,
    budgetSlotsRemaining: 21,
  }

  return [...eligible].sort((a, b) => scoreRecipe(a, ctx) - scoreRecipe(b, ctx))
}

/** Remplace une recette précise du planning par la meilleure alternative disponible pour ce créneau. */
export function replaceMealInPlan(plan: Meal[], mealId: string, profile: UserProfile, targets: MacroTargets, constraints: PlannerConstraints): Meal[] {
  const current = plan.find((m) => m.id === mealId)
  const best = rankAlternatives(plan, mealId, profile, targets, constraints)[0]
  if (!current || !best) return plan
  return plan.map((m) => (m.id === mealId ? toMeal(best, current.day, current.slot) : m))
}

/** Renvoie jusqu'à `count` propositions de recettes alternatives pour un repas, pour laisser l'utilisateur choisir. */
export function getMealAlternatives(
  plan: Meal[],
  mealId: string,
  profile: UserProfile,
  targets: MacroTargets,
  constraints: PlannerConstraints,
  count = 3,
): RecipeTemplate[] {
  return rankAlternatives(plan, mealId, profile, targets, constraints).slice(0, count)
}

/** Applique un choix explicite de recette (proposée par getMealAlternatives) à un repas du planning. */
export function applyMealChoice(plan: Meal[], mealId: string, recipeId: string): Meal[] {
  const current = plan.find((m) => m.id === mealId)
  const recipe = RECIPE_POOL.find((r) => r.id === recipeId)
  if (!current || !recipe) return plan
  return plan.map((m) => (m.id === mealId ? toMeal(recipe, current.day, current.slot) : m))
}

/**
 * Permute deux repas du même créneau entre deux jours (ex. avancer un plat très frais, repousser
 * un plat de longue conservation). La DLC affichée est recalculée pour rester cohérente avec le
 * nouveau jour de préparation.
 */
export function swapMealsBetweenDays(plan: Meal[], mealIdA: string, mealIdB: string): Meal[] {
  const a = plan.find((m) => m.id === mealIdA)
  const b = plan.find((m) => m.id === mealIdB)
  if (!a || !b || a.slot !== b.slot || a.day === b.day) return plan

  const recipeA = RECIPE_POOL.find((r) => r.id === recipeIdFromMealId(a.id))
  const recipeB = RECIPE_POOL.find((r) => r.id === recipeIdFromMealId(b.id))
  if (!recipeA || !recipeB) return plan

  const updated = plan.map((m) => {
    if (m.id === mealIdA) return toMeal(recipeA, b.day, a.slot)
    if (m.id === mealIdB) return toMeal(recipeB, a.day, a.slot)
    return m
  })

  // Un repas change de jour sans bouger dans le tableau : on retrie pour que l'ordre
  // d'affichage (petit-déj → midi → soir → encas, jour par jour) reste cohérent après la permutation.
  const slotOrder: Record<Meal['slot'], number> = { 'petit-dejeuner': 0, 'encas-matin': 1, midi: 2, 'encas-apresmidi': 3, soir: 4 }
  return [...updated].sort((x, y) => x.day - y.day || slotOrder[x.slot] - slotOrder[y.slot])
}

export interface WeekStats {
  avgKcalMatch: number // % de correspondance moyenne à la cible calorique
  avgMacroMatch: number // % de correspondance moyenne toutes macros confondues
  totalCost: number
  avgPrepTime: number
  budgetOk: boolean
}

export function computeWeekStats(plan: Meal[], targets: MacroTargets, constraints: PlannerConstraints, recipeCosts: Map<string, number>): WeekStats {
  const days = Array.from(new Set(plan.map((m) => m.day)))
  let kcalMatchSum = 0
  let macroMatchSum = 0
  let totalCost = 0
  let totalPrep = 0

  for (const day of days) {
    const dayMeals = plan.filter((m) => m.day === day)
    const totals = dayMeals.reduce(
      (acc, m) => ({ kcal: acc.kcal + m.kcal, protein: acc.protein + m.protein, carbs: acc.carbs + m.carbs, fat: acc.fat + m.fat }),
      { kcal: 0, protein: 0, carbs: 0, fat: 0 },
    )
    kcalMatchSum += 1 - Math.min(1, Math.abs(totals.kcal - targets.kcal) / targets.kcal)
    const macroMatch =
      1 -
      Math.min(
        1,
        (Math.abs(totals.protein - targets.protein) / targets.protein +
          Math.abs(totals.carbs - targets.carbs) / targets.carbs +
          Math.abs(totals.fat - targets.fat) / targets.fat) /
          3,
      )
    macroMatchSum += macroMatch
  }

  for (const meal of plan) {
    totalCost += recipeCosts.get(recipeIdFromMealId(meal.id)) ?? 0
    totalPrep += meal.prepTime
  }

  return {
    avgKcalMatch: Math.round((kcalMatchSum / days.length) * 100),
    avgMacroMatch: Math.round((macroMatchSum / days.length) * 100),
    totalCost: Math.round(totalCost * 100) / 100,
    avgPrepTime: Math.round(totalPrep / plan.length),
    budgetOk: constraints.weeklyBudget == null || totalCost <= constraints.weeklyBudget,
  }
}

export const RECIPE_COST_MAP = new Map(RECIPE_POOL.map((r) => [r.id, r.cost]))
