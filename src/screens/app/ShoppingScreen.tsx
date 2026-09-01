import { useApp } from '../../context/AppContext'
import CookingIntroScreen from './courses/CookingIntroScreen'
import IngredientsStep from './courses/IngredientsStep'
import MenuStep from './courses/MenuStep'
import StoreStep from './courses/StoreStep'

export default function ShoppingScreen() {
  const { courseStep, cookingIntroSeen } = useApp()

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {!cookingIntroSeen ? (
        <CookingIntroScreen />
      ) : (
        <>
          {courseStep === 'menu' && <MenuStep />}
          {courseStep === 'ingredients' && <IngredientsStep />}
          {courseStep === 'store' && <StoreStep />}
        </>
      )}
    </div>
  )
}
