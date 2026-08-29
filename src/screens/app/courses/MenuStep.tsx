import { ChevronRight, RefreshCcw, ShoppingBasket, SlidersHorizontal, Timer, Zap } from 'lucide-react'
import { useState } from 'react'
import { useApp } from '../../../context/AppContext'
import { WEEK_DAYS } from '../../../data/mock'
import { Button, Card, Pill, SectionTitle } from '../../../components/ui'
import PreferencesPanel from './PreferencesPanel'
import type { Meal } from '../../../types'

const SLOT_LABEL: Record<Meal['slot'], string> = {
  'petit-dejeuner': 'Petit-déjeuner',
  'encas-matin': 'Encas du matin',
  midi: 'Midi',
  'encas-apresmidi': 'Encas de l’après-midi',
  soir: 'Soir',
}

const SLOT_ORDER: Meal['slot'][] = ['encas-matin', 'midi', 'encas-apresmidi', 'soir']

export default function MenuStep() {
  const { weekPlan, replaceMeal, setCourseStep } = useApp()
  const [prefsOpen, setPrefsOpen] = useState(false)

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative">
      <div className="px-5 pt-5 pb-3 shrink-0 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-ink">Votre menu de la semaine</h1>
          <p className="text-[13px] text-ink-soft mt-1">Un plat ne vous convient pas ? Régénérez-le.</p>
        </div>
        <button
          onClick={() => setPrefsOpen(true)}
          className="tap w-10 h-10 rounded-full bg-ink text-cream flex items-center justify-center shrink-0"
          aria-label="Préférences"
        >
          <SlidersHorizontal size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-4 flex flex-col gap-6">
        {WEEK_DAYS.map((dayName, idx) => {
          const dayNum = idx + 1
          const dayMeals = weekPlan
            .filter((m) => m.day === dayNum && m.slot !== 'petit-dejeuner')
            .sort((a, b) => SLOT_ORDER.indexOf(a.slot) - SLOT_ORDER.indexOf(b.slot))
          if (dayMeals.length === 0) return null

          return (
            <div key={dayName}>
              <SectionTitle>
                {dayName} · Jour {dayNum}
              </SectionTitle>
              <div className="flex flex-col gap-2.5">
                {dayMeals.map((meal) => (
                  <Card key={meal.id} className="!p-3 flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-leaf-50 flex items-center justify-center text-xl shrink-0">{meal.image}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10.5px] font-bold text-leaf-600 uppercase tracking-wide">{SLOT_LABEL[meal.slot]}</p>
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
                    <button
                      onClick={() => replaceMeal(meal.id)}
                      className="tap w-9 h-9 rounded-full bg-black/5 flex items-center justify-center shrink-0"
                      aria-label="Régénérer un repas"
                    >
                      <RefreshCcw size={14} className="text-ink-soft" />
                    </button>
                  </Card>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <div className="px-5 pb-[calc(env(safe-area-inset-bottom)+16px)] pt-2 shrink-0 border-t border-black/5 flex gap-2.5">
        <Button variant="ghost" className="flex-1 !py-3" onClick={() => setCourseStep('ingredients')}>
          <ShoppingBasket size={15} /> Détail du panier
        </Button>
        <Button className="flex-1 !py-3" onClick={() => setCourseStep('store')}>
          Continuer <ChevronRight size={15} />
        </Button>
      </div>

      {prefsOpen && <PreferencesPanel onClose={() => setPrefsOpen(false)} />}
    </div>
  )
}
