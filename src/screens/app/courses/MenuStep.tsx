import { Flame, Sparkles, Timer, Wallet } from 'lucide-react'
import { useApp } from '../../../context/AppContext'
import { computeWeekStats, RECIPE_COST_MAP } from '../../../engine/planner'
import { Button, Card, Pill, SectionTitle } from '../../../components/ui'

export default function MenuStep() {
  const { profile, targets, menuOptions, selectMenuOption, constraints, setConstraints, buildCustomMenu } = useApp()

  const fastActive = constraints.maxPrepTime === 15
  const proteinActive = constraints.macroFocus === 'riche_proteines'
  const budgetActive = constraints.weeklyBudget != null

  return (
    <div className="px-5 pt-5 pb-8">
      <h1 className="text-xl font-extrabold text-ink">Choisissez votre menu</h1>
      <p className="text-[13px] text-ink-soft mt-1">3 propositions calibrées pour {profile.firstName}, ou composez la vôtre.</p>

      <div className="flex flex-col gap-3 mt-5">
        {menuOptions.map((option) => {
          const stats = computeWeekStats(option.plan, targets, option.constraints, RECIPE_COST_MAP)
          return (
            <Card key={option.id} className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-extrabold text-ink text-[15px]">{option.label}</p>
                  <p className="text-[12.5px] text-ink-soft mt-0.5">{option.description}</p>
                </div>
                <Sparkles size={18} className="text-clementine-500 shrink-0 mt-0.5" />
              </div>
              <div className="flex gap-2 flex-wrap">
                <Pill tone="leaf">{stats.avgMacroMatch}% macros</Pill>
                <Pill>
                  <Timer size={11} /> {stats.avgPrepTime} min / repas
                </Pill>
                <Pill tone="clementine">{stats.totalCost.toFixed(0)} € / semaine</Pill>
              </div>
              <Button onClick={() => selectMenuOption(option.id)}>Choisir ce menu</Button>
            </Card>
          )
        })}
      </div>

      <div className="mt-7">
        <SectionTitle>Ou composez le vôtre</SectionTitle>
        <Card className="flex flex-col gap-3">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setConstraints({ maxPrepTime: fastActive ? null : 15 })}
              className={`tap flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12px] font-bold border ${
                fastActive ? 'bg-ink text-cream border-ink' : 'bg-white text-ink-soft border-black/10'
              }`}
            >
              <Timer size={13} /> Repas &lt; 15 min
            </button>
            <button
              onClick={() => setConstraints({ macroFocus: proteinActive ? 'equilibre' : 'riche_proteines' })}
              className={`tap flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12px] font-bold border ${
                proteinActive ? 'bg-ink text-cream border-ink' : 'bg-white text-ink-soft border-black/10'
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
            <div>
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

          <Button variant="dark" onClick={buildCustomMenu}>
            Générer mon menu personnalisé
          </Button>
        </Card>
      </div>
    </div>
  )
}
