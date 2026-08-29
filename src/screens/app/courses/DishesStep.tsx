import { Check, ChevronLeft, Timer, X, Zap } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useApp } from '../../../context/AppContext'
import { WEEK_DAYS } from '../../../data/mock'
import { Button, Card, Pill } from '../../../components/ui'
import type { Meal, RecipeTemplate } from '../../../types'

type SlotFilter = 'tous' | 'midi' | 'soir'
type TimeFilter = 'tous' | '15' | '30'
type SortKey = 'jour' | 'temps' | 'calories'

export default function DishesStep() {
  const { weekPlan, setCourseStep, mealAlternatives, chooseMealAlternative } = useApp()
  const [slotFilter, setSlotFilter] = useState<SlotFilter>('tous')
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('tous')
  const [sortKey, setSortKey] = useState<SortKey>('jour')
  const [openMealId, setOpenMealId] = useState<string | null>(null)

  const dishes = useMemo(() => {
    let list = weekPlan.filter((m) => m.slot === 'midi' || m.slot === 'soir')
    if (slotFilter !== 'tous') list = list.filter((m) => m.slot === slotFilter)
    if (timeFilter !== 'tous') list = list.filter((m) => m.prepTime <= Number(timeFilter))

    const sorted = [...list]
    if (sortKey === 'temps') sorted.sort((a, b) => a.prepTime - b.prepTime)
    else if (sortKey === 'calories') sorted.sort((a, b) => a.kcal - b.kcal)
    else sorted.sort((a, b) => a.day - b.day || a.slot.localeCompare(b.slot))
    return sorted
  }, [weekPlan, slotFilter, timeFilter, sortKey])

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="px-5 pt-5 pb-2 shrink-0">
        <button onClick={() => setCourseStep('menu')} className="tap flex items-center gap-1 text-[12.5px] font-bold text-ink-soft/60 mb-2">
          <ChevronLeft size={14} /> Choix du menu
        </button>
        <h1 className="text-xl font-extrabold text-ink">Votre menu de la semaine</h1>
        <p className="text-[13px] text-ink-soft mt-1">Un plat ne vous convient pas ? Changez-le.</p>
      </div>

      <div className="px-5 pb-2 shrink-0 flex flex-col gap-2">
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          {(['tous', 'midi', 'soir'] as SlotFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setSlotFilter(f)}
              className={`tap shrink-0 px-3 py-1.5 rounded-full text-[11.5px] font-bold border ${
                slotFilter === f ? 'bg-ink text-cream border-ink' : 'bg-white text-ink-soft border-black/10'
              }`}
            >
              {f === 'tous' ? 'Tous les repas' : f === 'midi' ? 'Midi' : 'Soir'}
            </button>
          ))}
          <div className="w-px bg-black/10 mx-1 shrink-0" />
          {(['tous', '15', '30'] as TimeFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setTimeFilter(f)}
              className={`tap shrink-0 px-3 py-1.5 rounded-full text-[11.5px] font-bold border ${
                timeFilter === f ? 'bg-ink text-cream border-ink' : 'bg-white text-ink-soft border-black/10'
              }`}
            >
              {f === 'tous' ? 'Tous les temps' : `< ${f} min`}
            </button>
          ))}
        </div>
        <select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value as SortKey)}
          className="self-end text-[11.5px] font-bold text-ink-soft border border-black/10 rounded-full px-3 py-1.5 bg-white outline-none"
        >
          <option value="jour">Trier par jour</option>
          <option value="temps">Trier par temps de préparation</option>
          <option value="calories">Trier par calories</option>
        </select>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-4">
        <div className="flex flex-col gap-2.5">
          {dishes.map((meal) => (
            <DishCard
              key={meal.id}
              meal={meal}
              isOpen={openMealId === meal.id}
              onToggle={() => setOpenMealId(openMealId === meal.id ? null : meal.id)}
              alternatives={openMealId === meal.id ? mealAlternatives(meal.id, 3) : []}
              onChoose={(recipeId) => {
                chooseMealAlternative(meal.id, recipeId)
                setOpenMealId(null)
              }}
            />
          ))}
          {dishes.length === 0 && <p className="text-center text-[13px] text-ink-soft/60 py-10">Aucun plat ne correspond à ces filtres.</p>}
        </div>
      </div>

      <div className="px-5 pb-[calc(env(safe-area-inset-bottom)+16px)] pt-2 shrink-0 border-t border-black/5">
        <Button full onClick={() => setCourseStep('ingredients')}>
          <Check size={16} /> Valider ce menu
        </Button>
      </div>
    </div>
  )
}

function DishCard({
  meal,
  isOpen,
  onToggle,
  alternatives,
  onChoose,
}: {
  meal: Meal
  isOpen: boolean
  onToggle: () => void
  alternatives: RecipeTemplate[]
  onChoose: (recipeId: string) => void
}) {
  return (
    <Card className="!p-3">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-leaf-50 flex items-center justify-center text-xl shrink-0">{meal.image}</div>
        <div className="flex-1 min-w-0">
          <p className="text-[10.5px] font-bold text-leaf-600 uppercase tracking-wide">
            {WEEK_DAYS[meal.day - 1]} · {meal.slot === 'midi' ? 'Midi' : 'Soir'}
          </p>
          <p className="font-bold text-ink text-[13.5px] truncate">{meal.name}</p>
          <div className="flex items-center gap-1.5 mt-1">
            <Pill>
              <Timer size={10} /> {meal.prepTime} min
            </Pill>
            <Pill tone="clementine">
              <Zap size={10} /> {meal.kcal} kcal
            </Pill>
          </div>
        </div>
        <button onClick={onToggle} className={`tap px-3 py-1.5 rounded-full text-[11.5px] font-bold shrink-0 ${isOpen ? 'bg-black/5 text-ink-soft' : 'bg-leaf-100 text-leaf-700'}`}>
          {isOpen ? <X size={13} /> : 'Changer'}
        </button>
      </div>

      {isOpen && (
        <div className="mt-3 pt-3 border-t border-black/5 fade-up flex flex-col gap-2">
          <p className="text-[11px] font-bold text-ink-soft/60 uppercase">Propositions</p>
          {alternatives.map((alt) => (
            <button
              key={alt.id}
              onClick={() => onChoose(alt.id)}
              className="tap flex items-center gap-3 bg-black/[0.03] rounded-2xl px-3 py-2.5 text-left"
            >
              <span className="text-lg shrink-0">{alt.image}</span>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-ink text-[13px] truncate">{alt.name}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <Pill>
                    <Timer size={10} /> {alt.prepTime} min
                  </Pill>
                  <Pill tone="clementine">{alt.kcal} kcal</Pill>
                </div>
              </div>
            </button>
          ))}
          {alternatives.length === 0 && <p className="text-[12px] text-ink-soft/50 italic">Aucune autre proposition disponible.</p>}
        </div>
      )}
    </Card>
  )
}
