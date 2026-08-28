import { Flame, RefreshCcw, Repeat, Sparkles, Timer, Wallet } from 'lucide-react'
import { WEEK_DAYS } from '../../data/mock'
import { useApp } from '../../context/AppContext'
import { Button, Card, Pill, SectionTitle } from '../../components/ui'

function freshnessLabel(freshnessDay: number) {
  if (freshnessDay <= 2) return { label: `DLC J${freshnessDay}`, tone: 'berry' as const }
  if (freshnessDay <= 4) return { label: `DLC J${freshnessDay}`, tone: 'clementine' as const }
  return { label: `DLC J${freshnessDay}`, tone: 'leaf' as const }
}

export default function PlanningScreen() {
  const { weekPlan, constraints, setConstraints, regenerateWeek, replaceMeal, weekStats } = useApp()

  const fastFilterActive = constraints.maxPrepTime === 15
  const proteinFilterActive = constraints.macroFocus === 'riche_proteines'
  const budgetActive = constraints.weeklyBudget != null

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar">
      <div className="px-5 pt-5 pb-2 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-ink">Planning de la semaine</h1>
          <p className="text-[13px] text-ink-soft">7 jours calibrés par le moteur à vos contraintes</p>
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
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-cream/10">
            <span className="text-[12px] text-cream/70">Panier estimé</span>
            <span className={`text-[13px] font-bold ${weekStats.budgetOk ? 'text-leaf-400' : 'text-berry-400'}`}>
              {weekStats.totalCost.toFixed(2)} € {constraints.weeklyBudget != null && `/ ${constraints.weeklyBudget} €`}
            </span>
          </div>
        </Card>
      </div>

      <div className="px-5 mt-4">
        <SectionTitle>Réglages du plan</SectionTitle>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setConstraints({ maxPrepTime: fastFilterActive ? null : 15 })}
            className={`tap flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12px] font-bold border ${
              fastFilterActive ? 'bg-ink text-cream border-ink' : 'bg-white text-ink-soft border-black/10'
            }`}
          >
            <Timer size={13} /> Repas &lt; 15 min
          </button>
          <button
            onClick={() => setConstraints({ macroFocus: proteinFilterActive ? 'equilibre' : 'riche_proteines' })}
            className={`tap flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12px] font-bold border ${
              proteinFilterActive ? 'bg-ink text-cream border-ink' : 'bg-white text-ink-soft border-black/10'
            }`}
          >
            <Flame size={13} /> Riche en protéines
          </button>
          <button
            onClick={() => setConstraints({ weeklyBudget: budgetActive ? null : 50 })}
            className={`tap flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12px] font-bold border ${
              budgetActive ? 'bg-ink text-cream border-ink' : 'bg-white text-ink-soft border-black/10'
            }`}
          >
            <Wallet size={13} /> Budget maîtrisé
          </button>
        </div>

        {budgetActive && (
          <div className="mt-3 bg-white rounded-2xl border border-black/5 px-4 py-3">
            <div className="flex justify-between text-[12px] mb-1.5">
              <span className="font-bold text-ink-soft">Budget hebdomadaire max</span>
              <span className="font-extrabold text-ink">{constraints.weeklyBudget} €</span>
            </div>
            <input
              type="range"
              min={25}
              max={90}
              step={5}
              value={constraints.weeklyBudget ?? 50}
              onChange={(e) => setConstraints({ weeklyBudget: Number(e.target.value) })}
              className="w-full accent-leaf-500"
            />
          </div>
        )}
      </div>

      <div className="px-5 mt-4">
        <Button variant="dark" full className="!py-3" onClick={regenerateWeek}>
          <RefreshCcw size={15} /> Régénérer la semaine
        </Button>
      </div>

      <div className="px-5 mt-6 flex flex-col gap-6 pb-8">
        {WEEK_DAYS.map((dayName, idx) => {
          const dayNum = idx + 1
          const dayMeals = weekPlan.filter((m) => m.day === dayNum)
          if (dayMeals.length === 0) return null
          return (
            <div key={dayName}>
              <SectionTitle>
                {dayName} · Jour {dayNum}
              </SectionTitle>
              <div className="flex flex-col gap-2.5">
                {dayMeals.map((meal) => {
                  const fresh = freshnessLabel(meal.freshnessDay)
                  return (
                    <Card key={meal.id} className="!p-3 flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-leaf-50 flex items-center justify-center text-xl shrink-0">
                        {meal.image}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-ink text-[13.5px] truncate">{meal.name}</p>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          <Pill>
                            <Timer size={10} /> {meal.prepTime} min
                          </Pill>
                          <Pill tone={fresh.tone}>{fresh.label}</Pill>
                        </div>
                      </div>
                      <button
                        onClick={() => replaceMeal(meal.id)}
                        className="tap w-8 h-8 rounded-full bg-black/5 flex items-center justify-center shrink-0"
                        aria-label="Remplacer la recette"
                      >
                        <Repeat size={14} className="text-ink-soft" />
                      </button>
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
