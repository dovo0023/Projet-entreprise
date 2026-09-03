import { AlertTriangle, ArrowLeftRight, Timer, UtensilsCrossed } from 'lucide-react'
import { useState } from 'react'
import { WEEK_DAYS } from '../../data/mock'
import { useApp } from '../../context/AppContext'
import { getRecipeTemplate } from '../../engine/planner'
import { Card, Pill, SectionTitle } from '../../components/ui'
import FreeMealCard from './FreeMealCard'
import type { Meal, PlannableSlot } from '../../types'

const SLOT_ORDER: Meal['slot'][] = ['petit-dejeuner', 'encas-matin', 'midi', 'encas-apresmidi', 'soir']

const SLOT_LABEL: Record<Meal['slot'], string> = {
  'petit-dejeuner': 'Petit-déjeuner',
  'encas-matin': 'Encas du matin',
  midi: 'Midi',
  'encas-apresmidi': 'Encas de l’après-midi',
  soir: 'Soir',
}

function freshnessLabel(freshnessDay: number) {
  if (freshnessDay <= 2) return { label: `DLC J${freshnessDay}`, tone: 'berry' as const }
  if (freshnessDay <= 4) return { label: `DLC J${freshnessDay}`, tone: 'clementine' as const }
  return { label: `DLC J${freshnessDay}`, tone: 'leaf' as const }
}

/** Avertit si un plat très frais (tier 1) est repoussé trop tard dans la semaine de livraison. */
function isRiskySwapTarget(meal: Meal, targetDay: number) {
  const tier = getRecipeTemplate(meal.id)?.freshnessTier ?? 2
  if (tier === 1 && targetDay >= 4) return true
  if (tier === 2 && targetDay >= 6) return true
  return false
}

const PLANNABLE_SLOTS: Meal['slot'][] = ['petit-dejeuner', 'midi', 'soir']

function mealNeedKey(slot: PlannableSlot): 'matin' | 'midi' | 'soir' {
  return slot === 'petit-dejeuner' ? 'matin' : slot
}

export default function PlanningScreen() {
  const { weekPlan, swapMeals, mealNeeds, setDayMealNeed } = useApp()
  const [expandedMealId, setExpandedMealId] = useState<string | null>(null)

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar">
      <div className="px-5 pt-5 pb-2 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-ink">Planning de la semaine</h1>
          <p className="text-[13px] text-ink-soft">Vue calendrier de vos 7 jours</p>
        </div>
      </div>

      <div className="px-5 mt-6 flex flex-col gap-6 pb-8">
        {WEEK_DAYS.map((dayName, idx) => {
          const dayNum = idx + 1
          const dayMeals = weekPlan.filter((m) => m.day === dayNum).sort((a, b) => SLOT_ORDER.indexOf(a.slot) - SLOT_ORDER.indexOf(b.slot))
          if (dayMeals.length === 0) return null
          return (
            <div key={dayName}>
              <SectionTitle>
                {dayName} · Jour {dayNum}
              </SectionTitle>
              <div className="flex flex-col gap-2.5">
                {dayMeals.map((meal) => {
                  const isPlannable = PLANNABLE_SLOTS.includes(meal.slot)
                  const needed = !isPlannable || (mealNeeds[meal.day]?.[mealNeedKey(meal.slot as PlannableSlot)] ?? true)
                  if (isPlannable && !needed) {
                    return <FreeMealCard key={meal.id} day={meal.day} slot={meal.slot as PlannableSlot} />
                  }

                  const fresh = freshnessLabel(meal.freshnessDay)
                  const isOpen = expandedMealId === meal.id
                  const otherDaysSameSlot = weekPlan.filter((m) => m.slot === meal.slot && m.id !== meal.id).sort((a, b) => a.day - b.day)

                  return (
                    <Card key={meal.id} className="!p-3">
                      <div className="flex items-center gap-2">
                        <button className="flex-1 min-w-0 flex items-center gap-3 text-left" onClick={() => setExpandedMealId(isOpen ? null : meal.id)}>
                          <div className="w-11 h-11 rounded-xl bg-leaf-50 flex items-center justify-center text-xl shrink-0">{meal.image}</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10.5px] font-bold text-leaf-600 uppercase tracking-wide">{SLOT_LABEL[meal.slot]}</p>
                            <p className="font-bold text-ink text-[13.5px] truncate">{meal.name}</p>
                            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                              <Pill>
                                <Timer size={10} /> {meal.prepTime} min
                              </Pill>
                              <Pill tone={fresh.tone}>{fresh.label}</Pill>
                            </div>
                          </div>
                          <ArrowLeftRight size={15} className="text-ink-soft/40 shrink-0" />
                        </button>
                        {isPlannable && (
                          <button
                            onClick={() => setDayMealNeed(meal.day, meal.slot as PlannableSlot, false)}
                            className="tap shrink-0 w-8 h-8 rounded-full bg-black/5 flex items-center justify-center"
                            aria-label="Marquer ce repas comme libre"
                            title="Je ne prépare pas ce repas"
                          >
                            <UtensilsCrossed size={13} className="text-ink-soft/50" />
                          </button>
                        )}
                      </div>

                      {isOpen && (
                        <div className="mt-3 pt-3 border-t border-black/5 fade-up flex flex-col gap-2.5">
                          <p className="text-[11px] font-bold text-ink-soft/60 uppercase">Permuter avec un autre jour ({SLOT_LABEL[meal.slot].toLowerCase()})</p>
                          <div className="flex flex-col gap-1.5">
                            {otherDaysSameSlot.map((other) => {
                              const risky = isRiskySwapTarget(meal, other.day) || isRiskySwapTarget(other, meal.day)
                              return (
                                <button
                                  key={other.id}
                                  onClick={() => {
                                    swapMeals(meal.id, other.id)
                                    setExpandedMealId(null)
                                  }}
                                  className="tap flex items-center gap-2.5 bg-black/[0.03] rounded-2xl px-3 py-2 text-left"
                                >
                                  <span className="text-[11px] font-bold text-ink-soft/60 w-16 shrink-0">{WEEK_DAYS[other.day - 1]}</span>
                                  <span className="flex-1 min-w-0 text-[12.5px] font-semibold text-ink truncate">{other.name}</span>
                                  {risky && <AlertTriangle size={13} className="text-clementine-500 shrink-0" />}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </Card>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
