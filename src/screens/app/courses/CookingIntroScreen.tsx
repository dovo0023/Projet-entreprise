import { Sparkles } from 'lucide-react'
import { useApp } from '../../../context/AppContext'
import { Button } from '../../../components/ui'
import CookingSessionsFields from './CookingSessionsFields'
import EncasField from './EncasField'
import MealNeedsFields from './MealNeedsFields'

/** Petit questionnaire réaffiché à chaque passage dans l'onglet Courses : un point rapide pour confirmer ou
 *  ajuster les repas de la semaine (au lieu d'un réglage figé une fois pour toutes, facile à oublier). */
export default function CookingIntroScreen({ onDone }: { onDone: () => void }) {
  const { applyPreferences } = useApp()

  function validate() {
    applyPreferences()
    onDone()
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="px-5 pt-[calc(env(safe-area-inset-top)+18px)] pb-2 shrink-0">
        <div className="w-12 h-12 rounded-2xl bg-leaf-100 flex items-center justify-center mb-3">
          <Sparkles className="text-leaf-600" size={22} />
        </div>
        <h1 className="text-xl font-extrabold text-ink">Comment organisez-vous vos repas cette semaine ?</h1>
        <p className="text-[13px] text-ink-soft mt-1">
          Confirmez ou ajustez : le menu et la liste de courses s’adaptent en conséquence (repas à prévoir, encas,
          rythme de cuisine).
        </p>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-5 py-4 flex flex-col gap-7">
        <MealNeedsFields />
        <EncasField />
        <CookingSessionsFields />
      </div>

      <div className="px-5 pb-[calc(env(safe-area-inset-bottom)+16px)] pt-2 shrink-0 border-t border-black/5 flex flex-col gap-2.5">
        <Button full onClick={validate}>
          Valider et découvrir mon menu
        </Button>
        <button onClick={onDone} className="tap text-center text-[12.5px] font-semibold text-ink-soft/60 py-1">
          Continuer sans changer
        </button>
      </div>
    </div>
  )
}
