import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { useApp } from '../../../context/AppContext'
import { Button } from '../../../components/ui'
import DaySlotsGrid from './DaySlotsGrid'
import DaysField from './DaysField'
import { aggregateDays, initSlotsByDay } from './mealNeedsUtils'
import type { SlotsValue } from './SlotsField'

/** Assistant en 2 étapes réaffiché à chaque passage dans l'onglet Courses : d'abord les jours où l'on
 *  compte se faire à manger, puis, pour ces jours-là, les repas (matin/midi/soir) à prévoir jour par jour
 *  — ex. mardi seulement midi et soir — au lieu d'un réglage figé une fois pour toutes, facile à oublier. */
export default function CoursesIntroWizard({ onDone }: { onDone: () => void }) {
  const { mealNeeds, applyDaySlotSelection } = useApp()
  const [step, setStep] = useState<'days' | 'slots'>('days')
  const [days, setDays] = useState<number[]>(() => aggregateDays(mealNeeds))
  const [slotsByDay, setSlotsByDay] = useState<Record<number, SlotsValue>>(() => initSlotsByDay(mealNeeds))

  function toggleSlot(day: number, key: keyof SlotsValue) {
    setSlotsByDay((prev) => ({ ...prev, [day]: { ...(prev[day] ?? { matin: true, midi: true, soir: true }), [key]: !prev[day]?.[key] } }))
  }

  const hasAnySlot = days.some((d) => {
    const s = slotsByDay[d]
    return s ? s.matin || s.midi || s.soir : true
  })

  function validate() {
    // Changer "quels jours / quels repas" ne change pas les recettes elles-mêmes (generateWeekPlan ne
    // dépend pas de mealNeeds) : pas besoin de régénérer le menu, juste de recalculer la grille jour ×
    // créneau et la liste de courses en conséquence.
    applyDaySlotSelection(days, slotsByDay)
    onDone()
  }

  if (step === 'days') {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-5 pt-[calc(env(safe-area-inset-top)+18px)] pb-2 shrink-0">
          <div className="w-12 h-12 rounded-2xl bg-leaf-100 flex items-center justify-center mb-3">
            <Sparkles className="text-leaf-600" size={22} />
          </div>
          <h1 className="text-xl font-extrabold text-ink">Quels jours comptez-vous vous faire à manger ?</h1>
          <p className="text-[13px] text-ink-soft mt-1">
            Choisissez les jours où vous voulez un menu prévu par l’app cette semaine.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar px-5 py-4">
          <DaysField days={days} onChange={setDays} />
        </div>

        <div className="px-5 pb-[calc(env(safe-area-inset-bottom)+16px)] pt-2 shrink-0 border-t border-black/5 flex flex-col gap-2.5">
          <Button full disabled={days.length === 0} onClick={() => setStep('slots')}>
            Continuer <ChevronRight size={15} />
          </Button>
          <button onClick={onDone} className="tap text-center text-[12.5px] font-semibold text-ink-soft/60 py-1">
            Continuer sans changer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="px-5 pt-[calc(env(safe-area-inset-top)+18px)] pb-2 shrink-0">
        <button
          onClick={() => setStep('days')}
          className="tap w-8 h-8 rounded-full bg-black/5 flex items-center justify-center mb-3"
          aria-label="Retour aux jours"
        >
          <ChevronLeft size={16} />
        </button>
        <h1 className="text-xl font-extrabold text-ink">Quels repas voulez-vous prévoir ?</h1>
        <p className="text-[13px] text-ink-soft mt-1">
          Réglez matin/midi/soir jour par jour — par exemple, pas de petit-déjeuner le mardi mais midi et soir oui.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-5 py-4">
        <DaySlotsGrid days={days} value={slotsByDay} onToggle={toggleSlot} />
      </div>

      <div className="px-5 pb-[calc(env(safe-area-inset-bottom)+16px)] pt-2 shrink-0 border-t border-black/5">
        <Button full disabled={!hasAnySlot} onClick={validate}>
          Valider et découvrir mon menu
        </Button>
      </div>
    </div>
  )
}
