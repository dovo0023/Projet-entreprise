import { Sparkles } from 'lucide-react'
import { useApp } from '../../../context/AppContext'
import { Button } from '../../../components/ui'
import CookingSessionsFields from './CookingSessionsFields'
import MealNeedsFields from './MealNeedsFields'

/** Questionnaire affiché une seule fois, au tout premier passage dans l'onglet Courses : on adapte le
 *  menu (et donc la liste de courses) au rythme de cuisine réel plutôt qu'à un plat différent chaque jour. */
export default function CookingIntroScreen() {
  const { applyPreferences, completeCookingIntro } = useApp()

  function validate() {
    applyPreferences()
    completeCookingIntro()
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="px-5 pt-[calc(env(safe-area-inset-top)+18px)] pb-2 shrink-0">
        <div className="w-12 h-12 rounded-2xl bg-leaf-100 flex items-center justify-center mb-3">
          <Sparkles className="text-leaf-600" size={22} />
        </div>
        <h1 className="text-xl font-extrabold text-ink">Comment organisez-vous vos repas ?</h1>
        <p className="text-[13px] text-ink-soft mt-1">
          Dites-nous à quel rythme vous cuisinez : le menu et la liste de courses s’adaptent en conséquence (par
          exemple une seule grande cuisine pour plusieurs jours plutôt qu’un plat différent chaque jour).
        </p>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-5 py-4 flex flex-col gap-7">
        <MealNeedsFields />
        <CookingSessionsFields />
      </div>

      <div className="px-5 pb-[calc(env(safe-area-inset-bottom)+16px)] pt-2 shrink-0 border-t border-black/5 flex flex-col gap-2.5">
        <Button full onClick={validate}>
          Valider et découvrir mon menu
        </Button>
        <button onClick={completeCookingIntro} className="tap text-center text-[12.5px] font-semibold text-ink-soft/60 py-1">
          Passer cette étape, je réglerai ça plus tard
        </button>
      </div>
    </div>
  )
}
