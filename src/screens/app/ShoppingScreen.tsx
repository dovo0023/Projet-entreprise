import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import CoursesIntroWizard from './courses/CoursesIntroWizard'
import IngredientsStep from './courses/IngredientsStep'
import MenuStep from './courses/MenuStep'
import StoreStep from './courses/StoreStep'

/** L'assistant "jours puis repas à prévoir" se réaffiche à chaque fois qu'on revient sur l'onglet Courses
 *  (état local, pas persisté) : un point de passage rapide pour confirmer ou ajuster la semaine plutôt
 *  qu'un réglage figé une fois pour toutes. */
export default function ShoppingScreen() {
  const { courseStep } = useApp()
  const [introDone, setIntroDone] = useState(false)

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {!introDone ? (
        <CoursesIntroWizard onDone={() => setIntroDone(true)} />
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
