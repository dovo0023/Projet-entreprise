import { AlertTriangle, ArrowLeftRight, Camera, Check, Clock, RotateCcw, UtensilsCrossed, Users, Zap } from 'lucide-react'
import { useState } from 'react'
import { SELF_RECORD_ID, useApp } from '../../context/AppContext'
import { getRecipeTemplate } from '../../engine/planner'
import { WEEK_DAYS } from '../../data/mock'
import { Button, Card, KcalRing, MacroBar, Pill, SectionTitle } from '../../components/ui'
import FreeMealCard from './FreeMealCard'
import JournalField from './JournalField'
import MealReplacementForm from './MealReplacementForm'
import type { Meal, PlannableSlot } from '../../types'

const SLOT_LABEL: Record<Meal['slot'], string> = {
  'petit-dejeuner': 'Petit-déjeuner',
  'encas-matin': 'Encas du matin',
  midi: 'Déjeuner',
  'encas-apresmidi': 'Encas de l’après-midi',
  soir: 'Dîner',
}

const SLOT_ORDER: Meal['slot'][] = ['petit-dejeuner', 'encas-matin', 'midi', 'encas-apresmidi', 'soir']

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

export default function TodayScreen() {
  const {
    weekPlan,
    targets,
    consumed,
    consumedMealIds,
    toggleMealConsumed,
    swapMeals,
    profile,
    householdMembers,
    mealNeeds,
    freeMealToReserve,
    mealReplacements,
    cancelMealReplacement,
  } = useApp()
  const todayMeals = weekPlan.filter((m) => m.day === 1).sort((a, b) => SLOT_ORDER.indexOf(a.slot) - SLOT_ORDER.indexOf(b.slot))
  const [expanded, setExpanded] = useState<string | null>(null)
  const [swapMealId, setSwapMealId] = useState<string | null>(null)
  const [logOpenId, setLogOpenId] = useState<string | null>(null)

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar">
      <div className="px-5 pt-5 pb-2">
        <p className="text-[13px] text-ink-soft">Bonjour {profile.firstName} 👋</p>
        <h1 className="text-xl font-extrabold text-ink -mt-0.5">Lundi 1er septembre</h1>
      </div>

      <div className="px-5 mt-3">
        <Card className="flex items-center gap-5">
          <KcalRing consumed={consumed.kcal} target={targets.kcal} />
          <div className="flex-1 flex flex-col gap-3">
            <MacroBar label="Protéines" value={consumed.protein} target={targets.protein} color="#2f9d5f" />
            <MacroBar label="Glucides" value={consumed.carbs} target={targets.carbs} color="#f7822a" />
            <MacroBar label="Lipides" value={consumed.fat} target={targets.fat} color="#e14f74" />
          </div>
        </Card>
      </div>

      <div className="px-5 mt-6">
        <SectionTitle>Vos repas du jour</SectionTitle>
        <div className="flex flex-col gap-3 pb-6">
          {todayMeals.map((meal) => {
            const isPlannable = PLANNABLE_SLOTS.includes(meal.slot)
            const needed = !isPlannable || (mealNeeds[meal.day]?.[mealNeedKey(meal.slot as PlannableSlot)] ?? true)
            if (isPlannable && !needed) {
              return <FreeMealCard key={meal.id} day={meal.day} slot={meal.slot as PlannableSlot} />
            }

            const replacement = mealReplacements[meal.id]
            if (replacement) {
              return (
                <Card key={meal.id} className="!p-3 border-2 border-dashed border-clementine-400 bg-clementine-100/40">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-xl bg-clementine-100 flex items-center justify-center shrink-0">
                      <UtensilsCrossed size={17} className="text-clementine-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10.5px] font-bold text-clementine-500 uppercase tracking-wide">
                        {SLOT_LABEL[meal.slot]} · Remplacé
                      </p>
                      <p className="font-bold text-ink text-[14px] truncate">{replacement.description}</p>
                      {replacement.kcal > 0 && <p className="text-[12px] text-ink-soft/60">{replacement.kcal} kcal (estimation)</p>}
                    </div>
                    <button
                      onClick={() => cancelMealReplacement(meal.id)}
                      className="tap shrink-0 flex items-center gap-1 text-[11px] font-bold text-leaf-600"
                    >
                      <RotateCcw size={11} /> Annuler
                    </button>
                  </div>
                </Card>
              )
            }

            const done = consumedMealIds.includes(meal.id)
            const isOpen = expanded === meal.id
            const isSwapOpen = swapMealId === meal.id
            const isLogOpen = logOpenId === meal.id
            const fresh = freshnessLabel(meal.freshnessDay)
            const otherDaysSameSlot = weekPlan.filter((m) => m.slot === meal.slot && m.id !== meal.id).sort((a, b) => a.day - b.day)

            return (
              <Card key={meal.id} className={done ? 'opacity-60' : ''}>
                <div className="flex items-start gap-2">
                  <button className="flex-1 min-w-0 text-left" onClick={() => setExpanded(isOpen ? null : meal.id)}>
                    <div className="flex items-start gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-leaf-50 flex items-center justify-center text-2xl shrink-0">
                        {meal.image}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold text-leaf-600 uppercase tracking-wide">{SLOT_LABEL[meal.slot]}</p>
                        <p className="font-bold text-ink text-[15px] leading-snug truncate">{meal.name}</p>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <Pill>
                            <Clock size={11} /> {meal.prepTime} min
                          </Pill>
                          <Pill tone="clementine">
                            <Zap size={11} /> {meal.kcal} kcal
                          </Pill>
                          <Pill tone={fresh.tone}>{fresh.label}</Pill>
                          {householdMembers.length > 0 && (
                            <Pill tone="leaf">
                              <Users size={11} /> x{householdMembers.length + 1} portions
                            </Pill>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                  {isPlannable && (
                    <button
                      onClick={() => freeMealToReserve(meal)}
                      className="tap shrink-0 w-8 h-8 rounded-full bg-black/5 flex items-center justify-center"
                      aria-label="Marquer ce repas comme libre"
                      title="Je ne prépare pas ce repas"
                    >
                      <UtensilsCrossed size={13} className="text-ink-soft/50" />
                    </button>
                  )}
                </div>

                {isOpen && (
                  <div className="mt-4 pt-4 border-t border-black/5 fade-up">
                    <p className="text-[12px] font-bold text-ink-soft mb-1.5">Ingrédients</p>
                    <ul className="text-[13px] text-ink-soft/90 mb-3 space-y-1">
                      {meal.ingredients.map((i) => (
                        <li key={i.name} className="flex justify-between">
                          <span>{i.name}</span>
                          <span className="text-ink-soft/50">{i.quantity}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-[12px] font-bold text-ink-soft mb-1.5">Étapes</p>
                    <ol className="text-[13px] text-ink-soft/90 space-y-1.5 list-decimal list-inside">
                      {meal.steps.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ol>
                  </div>
                )}

                {isSwapOpen && (
                  <div className="mt-4 pt-4 border-t border-black/5 fade-up">
                    <p className="text-[11px] font-bold text-ink-soft/60 uppercase mb-2">
                      Échanger avec un autre jour ({SLOT_LABEL[meal.slot].toLowerCase()})
                    </p>
                    <div className="flex flex-col gap-1.5">
                      {otherDaysSameSlot.map((other) => {
                        const otherFresh = freshnessLabel(other.freshnessDay)
                        const risky = isRiskySwapTarget(meal, other.day) || isRiskySwapTarget(other, meal.day)
                        return (
                          <button
                            key={other.id}
                            onClick={() => {
                              swapMeals(meal.id, other.id)
                              setSwapMealId(null)
                            }}
                            className="tap flex items-center gap-2.5 bg-black/[0.03] rounded-2xl px-3 py-2.5 text-left"
                          >
                            <span className="text-[11px] font-bold text-ink-soft/60 w-16 shrink-0">{WEEK_DAYS[other.day - 1]}</span>
                            <span className="flex-1 min-w-0 text-[12.5px] font-semibold text-ink truncate">{other.name}</span>
                            <Pill tone={otherFresh.tone}>{otherFresh.label}</Pill>
                            {risky && <AlertTriangle size={13} className="text-clementine-500 shrink-0" />}
                          </button>
                        )
                      })}
                      {otherDaysSameSlot.length === 0 && (
                        <p className="text-[12px] text-ink-soft/50 italic">Aucun autre repas équivalent cette semaine.</p>
                      )}
                    </div>
                  </div>
                )}

                {isLogOpen && <MealReplacementForm meal={meal} onDone={() => setLogOpenId(null)} />}

                <div className="flex gap-2 mt-3">
                  <Button
                    variant={done ? 'secondary' : 'primary'}
                    className="flex-1 !py-2.5 text-[13px]"
                    onClick={() => toggleMealConsumed(meal.id, meal.kcal, meal.protein, meal.carbs, meal.fat)}
                  >
                    {done && <Check size={15} />} {done ? 'Repas consommé' : 'Marquer consommé'}
                  </Button>
                  <Button
                    variant="ghost"
                    className="!py-2.5 text-[13px] !px-3"
                    onClick={() => setSwapMealId(isSwapOpen ? null : meal.id)}
                    aria-label="Remplacement d’urgence"
                    title="Remplacement d’urgence (échanger avec un autre jour)"
                  >
                    <ArrowLeftRight size={14} />
                  </Button>
                  <Button
                    variant="ghost"
                    className="!py-2.5 text-[13px] !px-3"
                    onClick={() => setLogOpenId(isLogOpen ? null : meal.id)}
                    aria-label="J’ai mangé autre chose"
                    title="Je n’ai pas respecté ce repas"
                  >
                    <Camera size={14} />
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      </div>

      <div className="px-5">
        <SectionTitle>Journal du jour</SectionTitle>
        <div className="pb-6">
          <JournalField
            personId={SELF_RECORD_ID}
            day={1}
            title="Vos écarts au menu"
            emptyText="Notez ici ce que vous mangez en plus ou à la place du menu prévu."
          />
        </div>
      </div>
    </div>
  )
}
