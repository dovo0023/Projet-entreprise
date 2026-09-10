import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { useApp } from '../../../context/AppContext'
import { Button } from '../../../components/ui'
import BudgetField from './BudgetField'
import DaySlotsGrid from './DaySlotsGrid'
import EncasField from './EncasField'
import HotColdField from './HotColdField'
import { toSlotsByDay } from './mealNeedsUtils'
import type { SlotsValue } from './SlotsField'
import TimeBandField from './TimeBandField'
import type { SnackTiming } from '../../../types'

type Step =
  | 'repas'
  | 'hotcold'
  | 'encas-ask'
  | 'encas-everyday-ask'
  | 'encas-everyday-timing'
  | 'encas-perday'
  | 'timeband'
  | 'budget'

const SNACK_TIMING_OPTIONS: { value: SnackTiming; label: string }[] = [
  { value: 'matin', label: 'Le matin' },
  { value: 'apres_midi', label: 'L’après-midi' },
  { value: 'les_deux', label: 'Les deux' },
]

/** Grand bouton oui/non ou choix unique, façon questionnaire pas à pas (une réponse = on avance). */
function ChoiceButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="tap w-full text-left px-4 py-4 rounded-2xl border border-black/10 bg-white flex items-center justify-between"
    >
      <span className="font-bold text-[15px] text-ink">{label}</span>
      <ChevronRight size={16} className="text-ink-soft/40 shrink-0" />
    </button>
  )
}

/** Assistant réaffiché à chaque passage dans l'onglet Courses, en questions successives (une page par
 *  question, qui s'enchaînent au fur et à mesure des réponses) plutôt qu'un unique écran à tout régler
 *  d'un coup : jours/repas, puis chaud/froid, puis encas (avec ses propres sous-questions), puis temps de
 *  préparation, puis budget. */
export default function CoursesIntroWizard({ onDone }: { onDone: () => void }) {
  const { mealNeeds, setConstraints, applyCoursesIntro } = useApp()
  const [slotsByDay, setSlotsByDay] = useState<Record<number, SlotsValue>>(() => toSlotsByDay(mealNeeds))
  const [stepStack, setStepStack] = useState<Step[]>(['repas'])
  const step = stepStack[stepStack.length - 1]

  function toggleSlot(day: number, key: keyof SlotsValue) {
    setSlotsByDay((prev) => ({ ...prev, [day]: { ...prev[day], [key]: !prev[day][key] } }))
  }

  const hasAnySlot = Object.values(slotsByDay).some((s) => s.matin || s.midi || s.soir)

  function goTo(next: Step) {
    setStepStack((prev) => [...prev, next])
  }
  function goBack() {
    setStepStack((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev))
  }

  function chooseEncas(wants: boolean) {
    if (!wants) {
      const cleared: Record<number, SnackTiming | null> = {}
      for (let day = 1; day <= 7; day++) cleared[day] = null
      setConstraints({ snacksByDay: cleared })
      goTo('timeband')
    } else {
      goTo('encas-everyday-ask')
    }
  }

  function chooseEveryday(everyday: boolean) {
    goTo(everyday ? 'encas-everyday-timing' : 'encas-perday')
  }

  function chooseDailyTiming(timing: SnackTiming) {
    const next: Record<number, SnackTiming | null> = {}
    for (let day = 1; day <= 7; day++) next[day] = timing
    setConstraints({ snacksByDay: next })
    goTo('timeband')
  }

  function validate() {
    applyCoursesIntro(slotsByDay)
    onDone()
  }

  const HEADER: Record<Step, { title: string; subtitle: string }> = {
    repas: {
      title: 'Quels repas voulez-vous prévoir cette semaine ?',
      subtitle: 'Réglez matin/midi/soir jour par jour — par exemple, pas de dîner lundi, mais matin et midi oui.',
    },
    hotcold: {
      title: 'Chaud ou froid ?',
      subtitle: 'Pour les jours où un repas de midi ou du soir est prévu, dites-nous votre préférence.',
    },
    'encas-ask': {
      title: 'Voulez-vous des encas cette semaine ?',
      subtitle: 'En plus du matin, midi et soir.',
    },
    'encas-everyday-ask': {
      title: 'Tous les jours ?',
      subtitle: 'Ou seulement certains jours de la semaine ?',
    },
    'encas-everyday-timing': {
      title: 'À quel moment ?',
      subtitle: 'Appliqué à tous les jours de la semaine.',
    },
    'encas-perday': {
      title: 'Quels jours, et à quel moment ?',
      subtitle: 'Réglable jour par jour.',
    },
    timeband: {
      title: 'Un temps de préparation en tête ?',
      subtitle: 'On privilégiera les recettes qui correspondent, sans jamais bloquer la génération.',
    },
    budget: {
      title: 'Un budget pour la semaine ?',
      subtitle: 'Optionnel — laissez "Libre" si vous ne voulez pas vous contraindre.',
    },
  }

  const { title, subtitle } = HEADER[step]

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="px-5 pt-[calc(env(safe-area-inset-top)+18px)] pb-2 shrink-0">
        {step === 'repas' ? (
          <div className="w-12 h-12 rounded-2xl bg-leaf-100 flex items-center justify-center mb-3">
            <Sparkles className="text-leaf-600" size={22} />
          </div>
        ) : (
          <button onClick={goBack} className="tap w-8 h-8 rounded-full bg-black/5 flex items-center justify-center mb-3" aria-label="Retour">
            <ChevronLeft size={16} />
          </button>
        )}
        <h1 className="text-xl font-extrabold text-ink">{title}</h1>
        <p className="text-[13px] text-ink-soft mt-1">{subtitle}</p>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-5 py-4 fade-up" key={step}>
        {step === 'repas' && <DaySlotsGrid value={slotsByDay} onToggle={toggleSlot} />}
        {step === 'hotcold' && <HotColdField />}
        {step === 'encas-ask' && (
          <div className="flex flex-col gap-2.5">
            <ChoiceButton label="Oui" onClick={() => chooseEncas(true)} />
            <ChoiceButton label="Non" onClick={() => chooseEncas(false)} />
          </div>
        )}
        {step === 'encas-everyday-ask' && (
          <div className="flex flex-col gap-2.5">
            <ChoiceButton label="Oui, tous les jours" onClick={() => chooseEveryday(true)} />
            <ChoiceButton label="Non, seulement certains jours" onClick={() => chooseEveryday(false)} />
          </div>
        )}
        {step === 'encas-everyday-timing' && (
          <div className="flex flex-col gap-2.5">
            {SNACK_TIMING_OPTIONS.map((opt) => (
              <ChoiceButton key={opt.value} label={opt.label} onClick={() => chooseDailyTiming(opt.value)} />
            ))}
          </div>
        )}
        {step === 'encas-perday' && <EncasField />}
        {step === 'timeband' && <TimeBandField />}
        {step === 'budget' && <BudgetField />}
      </div>

      {(step === 'repas' || step === 'hotcold' || step === 'encas-perday' || step === 'timeband' || step === 'budget') && (
        <div className="px-5 pb-[calc(env(safe-area-inset-bottom)+16px)] pt-2 shrink-0 border-t border-black/5 flex flex-col gap-2.5">
          {step === 'repas' && (
            <>
              <Button full disabled={!hasAnySlot} onClick={() => goTo('hotcold')}>
                Continuer
              </Button>
              <button onClick={onDone} className="tap text-center text-[12.5px] font-semibold text-ink-soft/60 py-1">
                Continuer sans changer
              </button>
            </>
          )}
          {step === 'hotcold' && (
            <Button full onClick={() => goTo('encas-ask')}>
              Continuer
            </Button>
          )}
          {step === 'encas-perday' && (
            <Button full onClick={() => goTo('timeband')}>
              Continuer
            </Button>
          )}
          {step === 'timeband' && (
            <Button full onClick={() => goTo('budget')}>
              Continuer
            </Button>
          )}
          {step === 'budget' && (
            <Button full onClick={validate}>
              Valider et découvrir mon menu
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
