import { AlertTriangle, ArrowLeftRight, RefreshCcw, Sparkles, Timer } from 'lucide-react'
import { useState } from 'react'
import { WEEK_DAYS } from '../../data/mock'
import { useApp } from '../../context/AppContext'
import { getRecipeTemplate } from '../../engine/planner'
import { Button, Card, Pill, SectionTitle } from '../../components/ui'
import type { Meal } from '../../types'

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

export default function PlanningScreen() {
  const { weekPlan, replaceMeal, swapMeals, weekStats } = useApp()
  const [expandedMealId, setExpandedMealId] = useState<string | null>(null)

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar">
      <div className="px-5 pt-5 pb-2 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-ink">Planning de la semaine</h1>
          <p className="text-[13px] text-ink-soft">Vue calendrier de vos 7 jours</p>
        </div>
      </div>

      <div className="px-5 mt-3">
        <Card className="!bg-ink text-cream">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={15} className="text-clementine-400" />
            <p className="text-[12px] font-bold uppercase tracking-wide text-cream/70">Moteur d’optimisation</p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-xl font-extrabold">{weekStats.avgKcalMatch}%</p>
              <p className="text-[10.5px] text-cream/60 mt-0.5">match calories</p>
            </div>
            <div>
              <p className="text-xl font-extrabold">{weekStats.avgMacroMatch}%</p>
              <p className="text-[10.5px] text-cream/60 mt-0.5">match macros</p>
            </div>
            <div>
              <p className="text-xl font-extrabold">{weekStats.avgPrepTime} min</p>
              <p className="text-[10.5px] text-cream/60 mt-0.5">prépa. moyenne</p>
            </div>
          </div>
          <p className="text-[11px] text-cream/50 mt-3 pt-3 border-t border-cream/10">
            Envie de changer de menu ou d’ajuster votre budget ? Ça se passe dans l’onglet Courses.
          </p>
        </Card>
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
                  const fresh = freshnessLabel(meal.freshnessDay)
                  const isOpen = expandedMealId === meal.id
                  const otherDaysSameSlot = weekPlan.filter((m) => m.slot === meal.slot && m.id !== meal.id).sort((a, b) => a.day - b.day)

                  return (
                    <Card key={meal.id} className="!p-3">
                      <button className="w-full flex items-center gap-3 text-left" onClick={() => setExpandedMealId(isOpen ? null : meal.id)}>
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

                      {isOpen && (
                        <div className="mt-3 pt-3 border-t border-black/5 fade-up flex flex-col gap-2.5">
                          <Button variant="ghost" className="!py-2 text-[12.5px]" onClick={() => replaceMeal(meal.id)}>
                            <RefreshCcw size={13} /> Remplacer automatiquement
                          </Button>

                          <p className="text-[11px] font-bold text-ink-soft/60 uppercase mt-1">Permuter avec un autre jour</p>
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
