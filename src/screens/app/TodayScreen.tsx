import { Check, Clock, Users, Zap } from 'lucide-react'
import { useState } from 'react'
import { MEALS } from '../../data/mock'
import { useApp } from '../../context/AppContext'
import { Button, Card, KcalRing, MacroBar, Pill, SectionTitle } from '../../components/ui'
import type { Meal } from '../../types'

const SLOT_LABEL: Record<Meal['slot'], string> = {
  'petit-dejeuner': 'Petit-déjeuner',
  midi: 'Déjeuner',
  soir: 'Dîner',
}

export default function TodayScreen() {
  const { targets, consumed, consumedMealIds, toggleMealConsumed, profile } = useApp()
  const todayMeals = MEALS.filter((m) => m.day === 1)
  const [expanded, setExpanded] = useState<string | null>(null)

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
            const done = consumedMealIds.includes(meal.id)
            const isOpen = expanded === meal.id
            return (
              <Card key={meal.id} className={done ? 'opacity-60' : ''}>
                <button className="w-full text-left" onClick={() => setExpanded(isOpen ? null : meal.id)}>
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
                        {profile.duoMode && (
                          <Pill tone="leaf">
                            <Users size={11} /> x2 portions
                          </Pill>
                        )}
                      </div>
                    </div>
                  </div>
                </button>

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

                <div className="flex gap-2 mt-3">
                  <Button
                    variant={done ? 'secondary' : 'primary'}
                    className="flex-1 !py-2.5 text-[13px]"
                    onClick={() => toggleMealConsumed(meal.id, meal.kcal, meal.protein, meal.carbs, meal.fat)}
                  >
                    {done && <Check size={15} />} {done ? 'Repas consommé' : 'Marquer consommé'}
                  </Button>
                  <Button variant="ghost" className="!py-2.5 text-[13px]">
                    Remplacement d’urgence
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
