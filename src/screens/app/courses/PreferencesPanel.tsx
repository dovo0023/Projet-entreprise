import { X } from 'lucide-react'
import { useMemo } from 'react'
import { useApp } from '../../../context/AppContext'
import { Button } from '../../../components/ui'
import BudgetField from './BudgetField'
import DaySlotsGrid from './DaySlotsGrid'
import EncasField from './EncasField'
import HotColdField from './HotColdField'
import { toSlotsByDay } from './mealNeedsUtils'
import type { SlotsValue } from './SlotsField'
import TimeBandField from './TimeBandField'

export default function PreferencesPanel({ onClose }: { onClose: () => void }) {
  const { applyPreferences, mealNeeds, applyDaySlotSelection } = useApp()
  const slotsByDay = useMemo(() => toSlotsByDay(mealNeeds), [mealNeeds])

  function toggleSlot(day: number, key: keyof SlotsValue) {
    applyDaySlotSelection({ ...slotsByDay, [day]: { ...slotsByDay[day], [key]: !slotsByDay[day][key] } })
  }

  function apply() {
    applyPreferences()
    onClose()
  }

  return (
    <div className="absolute inset-0 z-20 bg-cream flex flex-col">
      <div className="flex items-center justify-between px-5 pt-[calc(env(safe-area-inset-top)+16px)] pb-3 border-b border-black/5 shrink-0">
        <h1 className="text-lg font-extrabold text-ink">Préférences</h1>
        <button onClick={onClose} className="tap w-8 h-8 rounded-full bg-black/5 flex items-center justify-center" aria-label="Fermer sans régénérer">
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-5 py-5 flex flex-col gap-7">
        <DaySlotsGrid value={slotsByDay} onToggle={toggleSlot} />
        <EncasField />
        <HotColdField plannedSlots={slotsByDay} />
        <TimeBandField />
        <BudgetField />
      </div>

      <div className="px-5 pb-[calc(env(safe-area-inset-bottom)+16px)] pt-3 shrink-0 border-t border-black/5">
        <Button full onClick={apply}>
          Valider et régénérer le menu
        </Button>
      </div>
    </div>
  )
}
