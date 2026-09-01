import { ArrowLeft, Check, Flame, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ALLERGEN_OPTIONS } from '../data/mock'
import { computeBMR, computeTDEE, useApp } from '../context/AppContext'
import { Button } from '../components/ui'
import type { ActivityLevel, Goal, UserProfile } from '../types'

const STEPS = ['Identifiants', 'Profil', 'Objectif', 'Sécurité', 'Résultat']

const ACTIVITY_OPTIONS: { value: ActivityLevel; label: string; hint: string }[] = [
  { value: 'sedentaire', label: 'Sédentaire', hint: 'Peu ou pas de sport, travail assis' },
  { value: 'modere', label: 'Modéré', hint: '2 à 4 séances de sport / semaine' },
  { value: 'intense', label: 'Intense', hint: 'Sport quotidien ou travail physique' },
]

const GOAL_OPTIONS: { value: Goal; label: string; hint: string }[] = [
  { value: 'seche', label: 'Perte de gras / Sèche', hint: '-200 à -500 kcal / jour' },
  { value: 'maintien', label: 'Maintien', hint: 'Stabiliser mon poids actuel' },
  { value: 'prise_de_masse', label: 'Prise de masse', hint: '+300 kcal / jour' },
]

export default function Onboarding() {
  const navigate = useNavigate()
  const { setProfile, completeOnboarding } = useApp()
  const [step, setStep] = useState(0)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [age, setAge] = useState(28)
  const [sex, setSex] = useState<UserProfile['sex']>('femme')
  const [height, setHeight] = useState(168)
  const [weight, setWeight] = useState(71)
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('modere')
  const [goal, setGoal] = useState<Goal>('seche')
  const [allergens, setAllergens] = useState<string[]>([])
  const [customAllergen, setCustomAllergen] = useState('')

  const draftProfile: UserProfile = {
    firstName: firstName || 'vous',
    email,
    age,
    sex,
    height,
    weight,
    activityLevel,
    goal,
    allergens,
    plan: 'Starter',
  }

  const bmr = computeBMR(draftProfile)
  const tdee = computeTDEE(draftProfile)

  function next() {
    if (step === STEPS.length - 1) {
      setProfile(draftProfile)
      completeOnboarding()
      navigate('/app/today')
      return
    }
    setStep((s) => s + 1)
  }

  function back() {
    if (step === 0) {
      navigate(-1)
      return
    }
    setStep((s) => s - 1)
  }

  function toggleAllergen(a: string) {
    setAllergens((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]))
  }

  const canContinue = step === 0 ? email.length > 3 && password.length >= 6 && firstName.length > 0 : true

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="px-6 pt-[calc(env(safe-area-inset-top)+18px)] pb-4 shrink-0">
        <div className="flex items-center justify-between mb-4">
          <button onClick={back} className="tap w-9 h-9 rounded-full bg-black/5 flex items-center justify-center">
            <ArrowLeft size={18} />
          </button>
          <span className="text-[12px] font-bold text-ink-soft/60">
            Étape {Math.min(step + 1, 4)} / 4
          </span>
        </div>
        {step < 4 && (
          <div className="flex gap-1.5">
            {STEPS.slice(0, 4).map((_, i) => (
              <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= step ? 'bg-leaf-500' : 'bg-black/10'}`} />
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-6 pb-6">
        {step === 0 && (
          <div className="fade-up flex flex-col gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-ink">Créons votre compte</h1>
              <p className="text-[14px] text-ink-soft mt-1">Juste l’essentiel pour démarrer, 30 secondes chrono.</p>
            </div>
            <label className="flex flex-col gap-1.5">
              <span className="text-[12px] font-bold text-ink-soft">Prénom</span>
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Camille"
                className="rounded-2xl border border-black/10 bg-white px-4 py-3.5 text-[15px] outline-none focus:border-leaf-500 focus:ring-2 focus:ring-leaf-100"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[12px] font-bold text-ink-soft">Adresse email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="prenom@email.com"
                className="rounded-2xl border border-black/10 bg-white px-4 py-3.5 text-[15px] outline-none focus:border-leaf-500 focus:ring-2 focus:ring-leaf-100"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[12px] font-bold text-ink-soft">Mot de passe</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="8 caractères minimum"
                className="rounded-2xl border border-black/10 bg-white px-4 py-3.5 text-[15px] outline-none focus:border-leaf-500 focus:ring-2 focus:ring-leaf-100"
              />
            </label>
          </div>
        )}

        {step === 1 && (
          <div className="fade-up flex flex-col gap-5">
            <div>
              <h1 className="text-2xl font-extrabold text-ink">Vos données physiologiques</h1>
              <p className="text-[14px] text-ink-soft mt-1">Nécessaires pour calculer vos besoins réels.</p>
            </div>

            <div className="flex gap-3">
              {(['femme', 'homme'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSex(s)}
                  className={`tap flex-1 py-3 rounded-2xl border text-[14px] font-bold capitalize ${
                    sex === s ? 'bg-leaf-500 text-white border-leaf-500' : 'bg-white border-black/10 text-ink-soft'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            <SliderField label="Âge" value={age} setValue={setAge} min={16} max={80} unit="ans" />
            <SliderField label="Taille" value={height} setValue={setHeight} min={140} max={210} unit="cm" />
            <SliderField label="Poids actuel" value={weight} setValue={setWeight} min={40} max={160} unit="kg" />

            <div>
              <span className="text-[12px] font-bold text-ink-soft">Niveau d’activité physique</span>
              <div className="flex flex-col gap-2 mt-2">
                {ACTIVITY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setActivityLevel(opt.value)}
                    className={`tap text-left px-4 py-3 rounded-2xl border ${
                      activityLevel === opt.value ? 'border-leaf-500 bg-leaf-50' : 'border-black/10 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[14px] text-ink">{opt.label}</span>
                      {activityLevel === opt.value && <Check size={16} className="text-leaf-600" />}
                    </div>
                    <p className="text-[12px] text-ink-soft mt-0.5">{opt.hint}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="fade-up flex flex-col gap-5">
            <div>
              <h1 className="text-2xl font-extrabold text-ink">Votre objectif corporel</h1>
              <p className="text-[14px] text-ink-soft mt-1">On ajustera vos calories et macros en conséquence.</p>
            </div>
            <div className="flex flex-col gap-3">
              {GOAL_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setGoal(opt.value)}
                  className={`tap text-left px-4 py-4 rounded-2xl border ${
                    goal === opt.value ? 'border-leaf-500 bg-leaf-50' : 'border-black/10 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[15px] text-ink">{opt.label}</span>
                    {goal === opt.value && <Check size={18} className="text-leaf-600" />}
                  </div>
                  <p className="text-[12px] text-ink-soft mt-1">{opt.hint}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="fade-up flex flex-col gap-5">
            <div>
              <h1 className="text-2xl font-extrabold text-ink">Socle de sécurité vitale</h1>
              <p className="text-[14px] text-ink-soft mt-1">
                Allergènes, intolérances ou contre-indications — gratuit et illimité, on ne vous proposera jamais ces aliments.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {ALLERGEN_OPTIONS.map((a) => (
                <button
                  key={a}
                  onClick={() => toggleAllergen(a)}
                  className={`tap px-3.5 py-2 rounded-full text-[13px] font-semibold border ${
                    allergens.includes(a) ? 'bg-berry-500 text-white border-berry-500' : 'bg-white border-black/10 text-ink-soft'
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
            <label className="flex flex-col gap-1.5">
              <span className="text-[12px] font-bold text-ink-soft">Ajouter un élément spécifique</span>
              <div className="flex gap-2">
                <input
                  value={customAllergen}
                  onChange={(e) => setCustomAllergen(e.target.value)}
                  placeholder="Ex : céleri, sulfites…"
                  className="flex-1 rounded-2xl border border-black/10 bg-white px-4 py-3 text-[14px] outline-none focus:border-leaf-500"
                />
                <button
                  onClick={() => {
                    if (customAllergen.trim()) {
                      setAllergens((prev) => [...prev, customAllergen.trim()])
                      setCustomAllergen('')
                    }
                  }}
                  className="tap px-4 rounded-2xl bg-ink text-cream font-bold text-[13px]"
                >
                  Ajouter
                </button>
              </div>
            </label>
          </div>
        )}

        {step === 4 && (
          <div className="fade-up flex flex-col items-center text-center pt-4">
            <div className="w-14 h-14 rounded-full bg-leaf-100 flex items-center justify-center mb-5">
              <Sparkles className="text-leaf-600" size={26} />
            </div>
            <h1 className="text-2xl font-extrabold text-ink">C’est calculé, {firstName || 'bienvenue'} !</h1>
            <p className="text-[14px] text-ink-soft mt-2 max-w-[260px]">
              Voici votre bilan métabolique personnalisé, mis à jour chaque semaine.
            </p>

            <div className="w-full grid grid-cols-2 gap-3 mt-8">
              <div className="bg-white rounded-3xl p-5 border border-black/5">
                <p className="text-[11px] font-bold text-ink-soft/60 uppercase">Métabolisme de base</p>
                <p className="text-3xl font-extrabold text-ink mt-1">{bmr}</p>
                <p className="text-[12px] text-ink-soft/60">kcal / jour</p>
              </div>
              <div className="bg-ink rounded-3xl p-5">
                <p className="text-[11px] font-bold text-cream/60 uppercase flex items-center gap-1">
                  <Flame size={12} /> Dépense totale
                </p>
                <p className="text-3xl font-extrabold text-cream mt-1">{tdee}</p>
                <p className="text-[12px] text-cream/60">kcal / jour</p>
              </div>
            </div>

            <div className="w-full bg-leaf-50 rounded-3xl p-4 mt-3 text-left">
              <p className="text-[13px] text-leaf-700">
                Objectif « <strong>{GOAL_OPTIONS.find((g) => g.value === goal)?.label}</strong> » : votre plan sera calibré à{' '}
                <strong>
                  {tdee + (goal === 'seche' ? -350 : goal === 'prise_de_masse' ? 300 : 0)} kcal/j
                </strong>{' '}
                avec un équilibre P/G/L optimisé automatiquement.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="px-6 pb-[calc(env(safe-area-inset-bottom)+18px)] pt-2 shrink-0">
        <Button full disabled={!canContinue} onClick={next}>
          {step === STEPS.length - 1 ? 'Découvrir mon menu' : 'Continuer'}
        </Button>
      </div>
    </div>
  )
}

function SliderField({
  label,
  value,
  setValue,
  min,
  max,
  unit,
}: {
  label: string
  value: number
  setValue: (v: number) => void
  min: number
  max: number
  unit: string
}) {
  return (
    <div>
      <div className="flex justify-between items-baseline mb-1.5">
        <span className="text-[12px] font-bold text-ink-soft">{label}</span>
        <span className="text-[14px] font-extrabold text-ink">
          {value} <span className="text-[11px] font-medium text-ink-soft/60">{unit}</span>
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        className="w-full accent-leaf-500"
      />
    </div>
  )
}
