import { RefreshCcw, Repeat, Timer } from 'lucide-react'
import { useState } from 'react'
import { MEALS, WEEK_DAYS } from '../../data/mock'
import { Button, Card, Pill, SectionTitle } from '../../components/ui'

const FILTERS = ['< 15 min', 'Petit-déj', 'Midi froid', 'Soir chaud', 'Riche en protéines']

function freshnessLabel(day: number) {
  if (day <= 2) return { label: `DLC J${day}`, tone: 'berry' as const }
  if (day <= 4) return { label: `DLC J${day}`, tone: 'clementine' as const }
  return { label: `DLC J${day}`, tone: 'leaf' as const }
}

export default function PlanningScreen() {
  const [activeFilters, setActiveFilters] = useState<string[]>([])

  function toggleFilter(f: string) {
    setActiveFilters((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]))
  }

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar">
      <div className="px-5 pt-5 pb-2 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-ink">Planning de la semaine</h1>
          <p className="text-[13px] text-ink-soft">7 jours calibrés à votre objectif</p>
        </div>
      </div>

      <div className="px-5 mt-3">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => toggleFilter(f)}
              className={`tap shrink-0 px-3.5 py-2 rounded-full text-[12px] font-bold border ${
                activeFilters.includes(f) ? 'bg-ink text-cream border-ink' : 'bg-white text-ink-soft border-black/10'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 mt-4">
        <Button variant="dark" full className="!py-3">
          <RefreshCcw size={15} /> Régénérer la semaine
        </Button>
      </div>

      <div className="px-5 mt-6 flex flex-col gap-6 pb-8">
        {WEEK_DAYS.map((dayName, idx) => {
          const dayNum = idx + 1
          const dayMeals = MEALS.filter((m) => m.day === dayNum)
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
                      <button className="tap w-8 h-8 rounded-full bg-black/5 flex items-center justify-center shrink-0" aria-label="Remplacer la recette">
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
