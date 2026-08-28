import { RECIPE_POOL } from './recipes'
import type { MacroTargets, Meal, PlannerConstraints, RecipeTemplate, UserProfile } from '../types'

const DIABETES_TAG = 'Diabète (contrôle glycémique)'

// Répartition indicative des calories/macros journalières entre les 3 repas.
const SLOT_SHARE: Record<Meal['slot'], number> = {
  'petit-dejeuner': 0.25,
  midi: 0.4,
  soir: 0.35,
}

function slotTarget(targets: MacroTargets, slot: Meal['slot']): MacroTargets {
  const share = SLOT_SHARE[slot]
  return {
    kcal: targets.kcal * share,
    protein: targets.protein * share,
    carbs: targets.carbs * share,
    fat: targets.fat * share,
  }
}

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
  target: MacroTargets
  constraints: PlannerConstraints
  usageCount: Map<string, number>
  dayIndex: number // 0-6
  totalDays: number
  budgetSpent: number
  budgetSlotsRemaining: number
}

/** Score composite : plus bas = meilleur choix. Combine macros, budget, fraîcheur et variété. */
function scoreRecipe(recipe: RecipeTemplate, ctx: ScoreContext): number {
  let score = macroDeviation(recipe, ctx.target, ctx.constraints.macroFocus)

  // Contrainte temps : au-delà du plafond, pénalité forte mais pas éliminatoire (on garde une solution de repli).
  if (ctx.constraints.maxPrepTime != null && recipe.prepTime > ctx.constraints.maxPrepTime) {
    score += 1.5 * (recipe.prepTime - ctx.constraints.maxPrepTime) / ctx.constraints.maxPrepTime
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

function toMeal(recipe: RecipeTemplate, day: number): Meal {
  return {
    id: `${recipe.id}-d${day}`,
    day,
    slot: recipe.slot,
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

/** Génère un planning de 7 jours en optimisant simultanément macros, temps, budget, fraîcheur et variété. */
export function generateWeekPlan(profile: UserProfile, targets: MacroTargets, constraints: PlannerConstraints): Meal[] {
  const eligible = RECIPE_POOL.filter((r) => isEligible(r, profile))
  const bySlot: Record<Meal['slot'], RecipeTemplate[]> = {
    'petit-dejeuner': eligible.filter((r) => r.slot === 'petit-dejeuner'),
    midi: eligible.filter((r) => r.slot === 'midi'),
    soir: eligible.filter((r) => r.slot === 'soir'),
  }

  const usageCount = new Map<string, number>()
  const assignments: Assignment[] = []
  let budgetSpent = 0
  const totalSlots = 21
  let slotsFilled = 0

  const slots: Meal['slot'][] = ['petit-dejeuner', 'midi', 'soir']

  for (let day = 1; day <= 7; day++) {
    for (const slot of slots) {
      const candidates = bySlot[slot]
      if (candidates.length === 0) continue
      const target = slotTarget(targets, slot)
      const ctx: ScoreContext = {
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
            scoreRecipe(ai.recipe, buildCtx(ai.day, slot, targets, constraints, usageCount, undoUsage(usageCount, ai.recipe.id))) +
            scoreRecipe(aj.recipe, buildCtx(aj.day, slot, targets, constraints, usageCount, undoUsage(usageCount, aj.recipe.id)))
          const scoreAfter =
            scoreRecipe(aj.recipe, buildCtx(ai.day, slot, targets, constraints, usageCount, undoUsage(usageCount, aj.recipe.id))) +
            scoreRecipe(ai.recipe, buildCtx(aj.day, slot, targets, constraints, usageCount, undoUsage(usageCount, ai.recipe.id)))

          if (scoreAfter < scoreBefore - 0.05) {
            assignments[i] = { ...ai, recipe: aj.recipe }
            assignments[j] = { ...aj, recipe: ai.recipe }
          }
        }
      }
    }
  }

  return assignments.map((a) => toMeal(a.recipe, a.day))
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
  usageOverride?: Map<string, number>,
): ScoreContext {
  return {
    target: slotTarget(targets, slot),
    constraints,
    usageCount: usageOverride ?? usageCount,
    dayIndex: day - 1,
    totalDays: 7,
    budgetSpent: 0,
    budgetSlotsRemaining: 21,
  }
}

/** Remplace une recette précise du planning par la meilleure alternative disponible pour ce créneau. */
export function replaceMealInPlan(plan: Meal[], mealId: string, profile: UserProfile, targets: MacroTargets, constraints: PlannerConstraints): Meal[] {
  const current = plan.find((m) => m.id === mealId)
  if (!current) return plan

  const currentRecipeId = current.id.replace(/-d\d+$/, '')
  const usedElsewhere = new Set(
    plan.filter((m) => m.id !== mealId && m.slot === current.slot).map((m) => m.id.replace(/-d\d+$/, '')),
  )

  const eligible = RECIPE_POOL.filter((r) => r.slot === current.slot && isEligible(r, profile) && r.id !== currentRecipeId)
  if (eligible.length === 0) return plan

  const usageCount = new Map<string, number>()
  usedElsewhere.forEach((id) => usageCount.set(id, 1))

  const ctx: ScoreContext = {
    target: slotTarget(targets, current.slot),
    constraints,
    usageCount,
    dayIndex: current.day - 1,
    totalDays: 7,
    budgetSpent: 0,
    budgetSlotsRemaining: 21,
  }

  let best = eligible[0]
  let bestScore = Infinity
  for (const candidate of eligible) {
    const s = scoreRecipe(candidate, ctx)
    if (s < bestScore) {
      bestScore = s
      best = candidate
    }
  }

  return plan.map((m) => (m.id === mealId ? toMeal(best, current.day) : m))
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
    const recipeId = meal.id.replace(/-d\d+$/, '')
    totalCost += recipeCosts.get(recipeId) ?? 0
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
