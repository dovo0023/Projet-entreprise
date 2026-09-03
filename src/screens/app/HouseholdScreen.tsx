import { ArrowLeft, Check, ChevronDown, Pencil, Plus, Trash2, User, X } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { ALLERGEN_OPTIONS } from '../../data/mock'
import { Button, Card, SectionTitle } from '../../components/ui'
import HouseholdProgress from './HouseholdProgress'
import type { DietType, Goal, HouseholdMember, KitchenEquipment } from '../../types'

type HouseholdView = 'membres' | 'progression'

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

const DIET_OPTIONS: { value: DietType; label: string; hint: string }[] = [
  { value: 'omnivore', label: 'Omnivore', hint: 'Aucune restriction' },
  { value: 'pescetarien', label: 'Pescétarien', hint: 'Pas de viande, poisson autorisé' },
  { value: 'vegetarien', label: 'Végétarien', hint: 'Ni viande ni poisson' },
  { value: 'vegetalien', label: 'Végétalien', hint: 'Aucun produit animal' },
]

const DIET_LABEL: Record<DietType, string> = {
  omnivore: 'Omnivore',
  pescetarien: 'Pescétarien',
  vegetarien: 'Végétarien',
  vegetalien: 'Végétalien',
}

const EQUIPMENT_OPTIONS: { value: KitchenEquipment; label: string; hint: string }[] = [
  { value: 'four', label: 'Four', hint: 'Cuisson, gratins, rôtis' },
  { value: 'airfryer', label: 'Airfryer', hint: 'Peut remplacer le four' },
  { value: 'micro_ondes', label: 'Micro-ondes', hint: 'Réchauffer, décongeler' },
  { value: 'blender', label: 'Blender / Mixeur', hint: 'Smoothies, soupes froides' },
]

interface MemberFormValue {
  name: string
  goal: Goal
  dietType: DietType
  allergens: string[]
}

const EMPTY_FORM: MemberFormValue = { name: '', goal: 'maintien', dietType: 'omnivore', allergens: [] }

function MemberForm({
  value,
  onChange,
  showName = true,
}: {
  value: MemberFormValue
  onChange: (v: MemberFormValue) => void
  showName?: boolean
}) {
  function toggleAllergen(a: string) {
    onChange({ ...value, allergens: value.allergens.includes(a) ? value.allergens.filter((x) => x !== a) : [...value.allergens, a] })
  }

  return (
    <div className="flex flex-col gap-4">
      {showName && (
        <label className="flex flex-col gap-1.5">
          <span className="text-[12px] font-semibold text-ink-soft">Prénom</span>
          <input
            value={value.name}
            onChange={(e) => onChange({ ...value, name: e.target.value })}
            placeholder="Ex. Alex"
            className="px-3.5 py-2.5 rounded-2xl border border-black/10 text-[14px] outline-none focus:border-leaf-500"
          />
        </label>
      )}

      <div>
        <p className="text-[12px] font-semibold text-ink-soft mb-2">Objectif</p>
        <div className="flex flex-col gap-2">
          {GOAL_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onChange({ ...value, goal: opt.value })}
              className={`tap text-left px-3.5 py-3 rounded-2xl border flex items-center justify-between ${
                value.goal === opt.value ? 'border-leaf-500 bg-leaf-50' : 'border-black/10 bg-white'
              }`}
            >
              <span className="font-semibold text-[13.5px] text-ink">{opt.label}</span>
              {value.goal === opt.value && <Check size={16} className="text-leaf-600" />}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[12px] font-semibold text-ink-soft mb-2">Régime alimentaire</p>
        <div className="flex flex-col gap-2">
          {DIET_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onChange({ ...value, dietType: opt.value })}
              className={`tap text-left px-3.5 py-3 rounded-2xl border flex items-center justify-between ${
                value.dietType === opt.value ? 'border-leaf-500 bg-leaf-50' : 'border-black/10 bg-white'
              }`}
            >
              <div>
                <span className="font-semibold text-[13.5px] text-ink">{opt.label}</span>
                <p className="text-[11.5px] text-ink-soft/60">{opt.hint}</p>
              </div>
              {value.dietType === opt.value && <Check size={16} className="text-leaf-600 shrink-0" />}
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
                value.allergens.includes(a) ? 'bg-berry-500 text-white border-berry-500' : 'bg-white border-black/10 text-ink-soft'
              }`}
            >
              {a}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function HouseholdScreen() {
  const navigate = useNavigate()
  const {
    profile,
    updateSelfDietaryProfile,
    householdMembers,
    addHouseholdMember,
    updateHouseholdMember,
    removeHouseholdMember,
    kitchenEquipment,
    setKitchenEquipment,
  } = useApp()
  const [view, setView] = useState<HouseholdView>('membres')
  const [adding, setAdding] = useState(false)
  const [addForm, setAddForm] = useState<MemberFormValue>(EMPTY_FORM)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<MemberFormValue>(EMPTY_FORM)
  const [editingSelf, setEditingSelf] = useState(false)
  const [selfForm, setSelfForm] = useState<MemberFormValue>({ name: profile.firstName, goal: profile.goal, dietType: profile.dietType, allergens: profile.allergens })

  function startAdding() {
    setAddForm(EMPTY_FORM)
    setAdding(true)
  }

  function submitAdd() {
    if (!addForm.name.trim()) return
    addHouseholdMember(addForm.name.trim(), addForm.goal, addForm.dietType, addForm.allergens)
    setAdding(false)
  }

  function startEditing(m: HouseholdMember) {
    setEditForm({ name: m.name, goal: m.goal, dietType: m.dietType, allergens: m.allergens })
    setEditingId(m.id)
  }

  function submitEdit() {
    if (!editingId || !editForm.name.trim()) return
    updateHouseholdMember(editingId, { name: editForm.name.trim(), goal: editForm.goal, dietType: editForm.dietType, allergens: editForm.allergens })
    setEditingId(null)
  }

  function startEditingSelf() {
    setSelfForm({ name: profile.firstName, goal: profile.goal, dietType: profile.dietType, allergens: profile.allergens })
    setEditingSelf(true)
  }

  function submitSelf() {
    updateSelfDietaryProfile({ goal: selfForm.goal, dietType: selfForm.dietType, allergens: selfForm.allergens })
    setEditingSelf(false)
  }

  function toggleEquipment(eq: KitchenEquipment) {
    setKitchenEquipment(kitchenEquipment.includes(eq) ? kitchenEquipment.filter((e) => e !== eq) : [...kitchenEquipment, eq])
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="px-5 pt-[calc(env(safe-area-inset-top)+18px)] pb-4 flex items-center gap-3 shrink-0">
        <button onClick={() => navigate(-1)} className="tap w-9 h-9 rounded-full bg-black/5 flex items-center justify-center">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-[16px] font-extrabold text-ink">Mon foyer</h1>
      </div>

      <div className="px-5 pb-3 shrink-0 flex gap-2">
        <button
          onClick={() => setView('membres')}
          className={`tap flex-1 py-2.5 rounded-2xl text-[13px] font-bold border ${
            view === 'membres' ? 'bg-ink text-cream border-ink' : 'bg-white text-ink-soft border-black/10'
          }`}
        >
          Membres
        </button>
        <button
          onClick={() => setView('progression')}
          className={`tap flex-1 py-2.5 rounded-2xl text-[13px] font-bold border ${
            view === 'progression' ? 'bg-ink text-cream border-ink' : 'bg-white text-ink-soft border-black/10'
          }`}
        >
          Progression
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-8">
        {view === 'progression' ? (
          <HouseholdProgress />
        ) : (
          <>
        <p className="text-[13px] text-ink-soft mb-4">
          Ajoutez les personnes de votre foyer qui partagent vos repas, avec leur propre objectif, régime alimentaire et allergies.
          Le menu de la semaine est généré pour convenir à tout le monde à la fois.
        </p>

        <SectionTitle>Vous</SectionTitle>
        {editingSelf ? (
          <Card className="fade-up flex flex-col gap-4 mb-6">
            <div className="flex items-center justify-between">
              <p className="font-bold text-ink text-[14px]">Modifier mon profil</p>
              <button onClick={() => setEditingSelf(false)} className="tap w-7 h-7 rounded-full bg-black/5 flex items-center justify-center">
                <X size={13} />
              </button>
            </div>
            <MemberForm value={selfForm} onChange={setSelfForm} showName={false} />
            <Button full onClick={submitSelf}>
              Enregistrer
            </Button>
          </Card>
        ) : (
          <button onClick={startEditingSelf} className="tap w-full text-left mb-6">
            <Card className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-ink text-cream flex items-center justify-center text-lg font-extrabold shrink-0">
                {profile.firstName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-ink text-[15px] truncate">{profile.firstName}</p>
                <p className="text-[12px] text-ink-soft/60">
                  {GOAL_LABEL[profile.goal]} · {DIET_LABEL[profile.dietType]}
                </p>
                {profile.allergens.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {profile.allergens.map((a) => (
                      <span key={a} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-berry-100 text-berry-500">
                        {a}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <ChevronDown size={16} className="text-ink-soft/40 shrink-0 -rotate-90" />
            </Card>
          </button>
        )}

        <SectionTitle>Autres membres ({householdMembers.length})</SectionTitle>
        <div className="flex flex-col gap-3 mb-6">
          {householdMembers.map((m) =>
            editingId === m.id ? (
              <Card key={m.id} className="fade-up flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-ink text-[14px]">Modifier {m.name}</p>
                  <button onClick={() => setEditingId(null)} className="tap w-7 h-7 rounded-full bg-black/5 flex items-center justify-center">
                    <X size={13} />
                  </button>
                </div>
                <MemberForm value={editForm} onChange={setEditForm} />
                <Button full disabled={!editForm.name.trim()} onClick={submitEdit}>
                  Enregistrer
                </Button>
              </Card>
            ) : (
              <Card key={m.id} className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-leaf-100 text-leaf-700 flex items-center justify-center shrink-0">
                  <User size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-ink text-[15px] truncate">{m.name}</p>
                  <p className="text-[12px] text-ink-soft/60">
                    {GOAL_LABEL[m.goal]} · {DIET_LABEL[m.dietType]}
                  </p>
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
                  onClick={() => startEditing(m)}
                  className="tap w-8 h-8 rounded-full bg-black/5 flex items-center justify-center shrink-0 text-ink-soft/60"
                  aria-label={`Modifier ${m.name}`}
                >
                  <Pencil size={13} />
                </button>
                <button
                  onClick={() => removeHouseholdMember(m.id)}
                  className="tap w-8 h-8 rounded-full bg-black/5 flex items-center justify-center shrink-0 text-ink-soft/60"
                  aria-label={`Retirer ${m.name}`}
                >
                  <Trash2 size={14} />
                </button>
              </Card>
            ),
          )}
          {householdMembers.length === 0 && !adding && (
            <p className="text-[13px] text-ink-soft/50 italic px-1">Vous êtes seul·e pour l'instant dans votre foyer.</p>
          )}
        </div>

        {adding ? (
          <Card className="fade-up flex flex-col gap-4 mb-6">
            <div className="flex items-center justify-between">
              <p className="font-bold text-ink text-[14px]">Nouvelle personne</p>
              <button onClick={() => setAdding(false)} className="tap w-7 h-7 rounded-full bg-black/5 flex items-center justify-center">
                <X size={13} />
              </button>
            </div>
            <MemberForm value={addForm} onChange={setAddForm} />
            <Button full disabled={!addForm.name.trim()} onClick={submitAdd}>
              Ajouter au foyer
            </Button>
          </Card>
        ) : (
          <Button variant="secondary" full onClick={startAdding} className="mb-6">
            <Plus size={16} /> Ajouter une personne
          </Button>
        )}

        <SectionTitle>Équipements de cuisine</SectionTitle>
        <p className="text-[12.5px] text-ink-soft/70 -mt-1 mb-3">
          Les recettes proposées s'adaptent à ce que vous avez chez vous (la poêle et la casserole sont toujours supposées disponibles).
        </p>
        <Card className="flex flex-col gap-2">
          {EQUIPMENT_OPTIONS.map((opt) => {
            const owned = kitchenEquipment.includes(opt.value)
            return (
              <button
                key={opt.value}
                onClick={() => toggleEquipment(opt.value)}
                className={`tap text-left px-3.5 py-3 rounded-2xl border flex items-center justify-between ${
                  owned ? 'border-leaf-500 bg-leaf-50' : 'border-black/10 bg-white'
                }`}
              >
                <div>
                  <span className="font-semibold text-[13.5px] text-ink">{opt.label}</span>
                  <p className="text-[11.5px] text-ink-soft/60">{opt.hint}</p>
                </div>
                {owned && <Check size={16} className="text-leaf-600 shrink-0" />}
              </button>
            )
          })}
        </Card>
          </>
        )}
      </div>
    </div>
  )
}
