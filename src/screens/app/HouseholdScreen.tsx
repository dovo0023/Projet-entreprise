import { ArrowLeft, Check, Plus, Trash2, User, X } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { ALLERGEN_OPTIONS } from '../../data/mock'
import { Button, Card, SectionTitle } from '../../components/ui'
import type { Goal } from '../../types'

const GOAL_OPTIONS: { value: Goal; label: string }[] = [
  { value: 'seche', label: 'Perte de gras / Sèche' },
  { value: 'maintien', label: 'Maintien' },
  { value: 'prise_de_masse', label: 'Prise de masse' },
]

const GOAL_LABEL: Record<Goal, string> = {
  seche: 'Perte de gras / Sèche',
  maintien: 'Maintien',
  prise_de_masse: 'Prise de masse',
}

export default function HouseholdScreen() {
  const navigate = useNavigate()
  const { profile, householdMembers, addHouseholdMember, removeHouseholdMember } = useApp()
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const [goal, setGoal] = useState<Goal>('maintien')
  const [allergens, setAllergens] = useState<string[]>([])

  function toggleAllergen(a: string) {
    setAllergens((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]))
  }

  function resetForm() {
    setName('')
    setGoal('maintien')
    setAllergens([])
    setAdding(false)
  }

  function submit() {
    if (!name.trim()) return
    addHouseholdMember(name.trim(), goal, allergens)
    resetForm()
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="px-5 pt-[calc(env(safe-area-inset-top)+18px)] pb-4 flex items-center gap-3 shrink-0">
        <button onClick={() => navigate(-1)} className="tap w-9 h-9 rounded-full bg-black/5 flex items-center justify-center">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-[16px] font-extrabold text-ink">Mon foyer</h1>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-8">
        <p className="text-[13px] text-ink-soft mb-4">
          Ajoutez les personnes de votre foyer qui partagent vos repas, avec leur propre objectif et leurs allergies. Les menus et
          quantités s'adaptent en fonction.
        </p>

        <SectionTitle>Vous</SectionTitle>
        <Card className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-full bg-ink text-cream flex items-center justify-center text-lg font-extrabold shrink-0">
            {profile.firstName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-ink text-[15px] truncate">{profile.firstName}</p>
            <p className="text-[12px] text-ink-soft/60">{GOAL_LABEL[profile.goal]}</p>
          </div>
        </Card>

        <SectionTitle>Autres membres ({householdMembers.length})</SectionTitle>
        <div className="flex flex-col gap-3 mb-4">
          {householdMembers.map((m) => (
            <Card key={m.id} className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-leaf-100 text-leaf-700 flex items-center justify-center shrink-0">
                <User size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-ink text-[15px] truncate">{m.name}</p>
                <p className="text-[12px] text-ink-soft/60">{GOAL_LABEL[m.goal]}</p>
                {m.allergens.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {m.allergens.map((a) => (
                      <span key={a} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-berry-100 text-berry-500">
                        {a}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={() => removeHouseholdMember(m.id)}
                className="tap w-8 h-8 rounded-full bg-black/5 flex items-center justify-center shrink-0 text-ink-soft/60"
                aria-label={`Retirer ${m.name}`}
              >
                <Trash2 size={14} />
              </button>
            </Card>
          ))}
          {householdMembers.length === 0 && !adding && (
            <p className="text-[13px] text-ink-soft/50 italic px-1">Vous êtes seul·e pour l'instant dans votre foyer.</p>
          )}
        </div>

        {adding ? (
          <Card className="fade-up flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <p className="font-bold text-ink text-[14px]">Nouvelle personne</p>
              <button onClick={resetForm} className="tap w-7 h-7 rounded-full bg-black/5 flex items-center justify-center">
                <X size={13} />
              </button>
            </div>

            <label className="flex flex-col gap-1.5">
              <span className="text-[12px] font-semibold text-ink-soft">Prénom</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex. Alex"
                className="px-3.5 py-2.5 rounded-2xl border border-black/10 text-[14px] outline-none focus:border-leaf-500"
              />
            </label>

            <div>
              <p className="text-[12px] font-semibold text-ink-soft mb-2">Objectif</p>
              <div className="flex flex-col gap-2">
                {GOAL_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setGoal(opt.value)}
                    className={`tap text-left px-3.5 py-3 rounded-2xl border flex items-center justify-between ${
                      goal === opt.value ? 'border-leaf-500 bg-leaf-50' : 'border-black/10 bg-white'
                    }`}
                  >
                    <span className="font-semibold text-[13.5px] text-ink">{opt.label}</span>
                    {goal === opt.value && <Check size={16} className="text-leaf-600" />}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[12px] font-semibold text-ink-soft mb-2">Allergies / intolérances</p>
              <div className="flex flex-wrap gap-2">
                {ALLERGEN_OPTIONS.map((a) => (
                  <button
                    key={a}
                    onClick={() => toggleAllergen(a)}
                    className={`tap px-3 py-1.5 rounded-full text-[12px] font-semibold border ${
                      allergens.includes(a) ? 'bg-berry-500 text-white border-berry-500' : 'bg-white border-black/10 text-ink-soft'
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>

            <Button full disabled={!name.trim()} onClick={submit}>
              Ajouter au foyer
            </Button>
          </Card>
        ) : (
          <Button variant="secondary" full onClick={() => setAdding(true)}>
            <Plus size={16} /> Ajouter une personne
          </Button>
        )}
      </div>
    </div>
  )
}
