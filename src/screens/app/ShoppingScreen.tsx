import { useApp } from '../../context/AppContext'
import DishesStep from './courses/DishesStep'
import IngredientsStep from './courses/IngredientsStep'
import MenuStep from './courses/MenuStep'
import StoreStep from './courses/StoreStep'

const STEPS = [
  { id: 'menu', label: 'Menu' },
  { id: 'dishes', label: 'Plats' },
  { id: 'ingredients', label: 'Ingrédients' },
  { id: 'store', label: 'Magasin' },
] as const

export default function ShoppingScreen() {
  const { courseStep } = useApp()
  const stepIndex = STEPS.findIndex((s) => s.id === courseStep)

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex items-center gap-1.5 px-5 pt-3 shrink-0">
        {STEPS.map((step, i) => (
          <div key={step.id} className="flex-1 flex flex-col items-center gap-1">
            <div className={`h-1.5 w-full rounded-full ${i <= stepIndex ? 'bg-leaf-500' : 'bg-black/10'}`} />
            <span className={`text-[9.5px] font-bold ${i === stepIndex ? 'text-ink' : 'text-ink-soft/40'}`}>{step.label}</span>
          </div>
        ))}
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {courseStep === 'menu' && <div className="flex-1 overflow-y-auto no-scrollbar"><MenuStep /></div>}
        {courseStep === 'dishes' && <DishesStep />}
        {courseStep === 'ingredients' && <IngredientsStep />}
        {courseStep === 'store' && <StoreStep />}
      </div>
    </div>
  )
}
