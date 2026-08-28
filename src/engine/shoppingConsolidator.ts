import type { Ingredient, Meal, ShoppingItem } from '../types'

const CATEGORY_RULES: { category: string; keywords: string[] }[] = [
  { category: 'Fruits & Légumes', keywords: ['courgette', 'poivron', 'brocoli', 'avocat', 'carotte', 'banane', 'kiwi', 'mangue', 'tomate', 'chou', 'épinard', 'salade', 'roquette', 'citron', 'champignon', 'patate douce'] },
  { category: 'Boucherie', keywords: ['poulet', 'dinde', 'bœuf', 'boeuf'] },
  { category: 'Poissonnerie', keywords: ['saumon', 'cabillaud', 'thon', 'crevette'] },
  { category: 'Frais / Laitiers', keywords: ['skyr', 'yaourt', 'œuf', 'oeuf', 'fromage', 'mozzarella', 'cottage', 'lait', 'parmesan', 'whey'] },
  { category: 'Surgelés', keywords: ['surgelé', 'surgelée'] },
  { category: 'Épicerie', keywords: [] }, // fallback
]

function categoryFor(name: string): string {
  const lower = name.toLowerCase()
  for (const rule of CATEGORY_RULES) {
    if (rule.keywords.some((k) => lower.includes(k))) return rule.category
  }
  return 'Épicerie'
}

function parseQuantity(raw: string): { value: number; unit: string } | null {
  const match = raw.trim().match(/^([\d.,/]+)\s*(.*)$/)
  if (!match) return null
  const [, numPart, unit] = match
  let value: number
  if (numPart.includes('/')) {
    const [a, b] = numPart.split('/').map(Number)
    value = b ? a / b : Number(numPart)
  } else {
    value = Number(numPart.replace(',', '.'))
  }
  if (Number.isNaN(value)) return null
  return { value, unit: unit.trim() }
}

function formatQuantity(value: number, unit: string): string {
  const rounded = Math.round(value * 100) / 100
  return unit ? `${rounded} ${unit}` : `${rounded}`
}

/** Consolide les ingrédients de tout le planning en une liste de courses groupée par rayon, sans doublons. */
export function consolidateIngredients(plan: Meal[]): ShoppingItem[] {
  const groups = new Map<string, { ingredient: Ingredient; total: number | null; unit: string; rawQuantities: string[] }>()

  for (const meal of plan) {
    for (const ing of meal.ingredients) {
      const key = ing.name.toLowerCase()
      const parsed = parseQuantity(ing.quantity)
      const existing = groups.get(key)

      if (!existing) {
        groups.set(key, {
          ingredient: ing,
          total: parsed?.value ?? null,
          unit: parsed?.unit ?? '',
          rawQuantities: parsed ? [] : [ing.quantity],
        })
        continue
      }

      if (parsed && existing.total != null && parsed.unit === existing.unit) {
        existing.total += parsed.value
      } else if (parsed) {
        existing.rawQuantities.push(formatQuantity(parsed.value, parsed.unit))
      } else {
        existing.rawQuantities.push(ing.quantity)
      }
    }
  }

  const items: ShoppingItem[] = []
  let i = 0
  for (const [, group] of groups) {
    const quantityLabel =
      group.total != null
        ? [formatQuantity(group.total, group.unit), ...group.rawQuantities].join(' + ')
        : group.rawQuantities.join(' + ') || group.ingredient.quantity

    items.push({
      id: `sh-${i++}`,
      name: group.ingredient.name,
      quantity: quantityLabel,
      category: categoryFor(group.ingredient.name),
      checked: false,
    })
  }

  return items.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name))
}
