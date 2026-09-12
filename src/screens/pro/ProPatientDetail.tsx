import { AlertTriangle, ArrowLeft, Book, Calendar, CalendarClock, Check, Plus, Scale, Send, Smartphone } from 'lucide-react'
import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { Area, AreaChart, Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { TODAY_LABEL, useApp } from '../../context/AppContext'
import { ALLERGEN_OPTIONS, DIET_OPTIONS, SHORT_DAYS } from '../../data/mock'
import { PatientAvatar } from '../../pro/ProLayout'
import { usePro } from '../../pro/ProContext'
import { useDisplayPatients } from '../../pro/useDisplayPatients'
import { Button } from '../../components/ui'
import type { DietType, Goal, JournalSlot, PlannedMealPreview, WeightEntry } from '../../types'

const JOURNAL_SLOT_LABEL: Record<JournalSlot, string> = {
  'petit-dejeuner': 'Petit-déjeuner',
  midi: 'Midi',
  encas: 'Encas',
  soir: 'Soir',
  autre: 'Autre',
}

const MEAL_SLOT_SHORT: Record<PlannedMealPreview['slot'], string> = {
  'petit-dejeuner': 'Matin',
  midi: 'Midi',
  soir: 'Soir',
}

const GOAL_OPTIONS: { value: Goal; label: string }[] = [
  { value: 'seche', label: 'Perte de gras / Sèche' },
  { value: 'maintien', label: 'Maintien' },
  { value: 'prise_de_masse', label: 'Prise de masse' },
]

function Section({
  icon: Icon,
  iconColor,
  title,
  delay = 0,
  children,
}: {
  icon: typeof Book
  iconColor: string
  title: string
  delay?: number
  children: React.ReactNode
}) {
  return (
    <div className="pro-card pro-rise bg-white rounded-3xl border border-black/5 p-5" style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-center gap-2 mb-3">
        <Icon size={14} className={iconColor} />
        <p className="text-[13px] font-bold text-pro-ink-soft/80 uppercase tracking-wide">{title}</p>
      </div>
      {children}
    </div>
  )
}

export default function ProPatientDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const patients = useDisplayPatients()
  const { updateSelfDietaryProfile } = useApp()
  const { updatePrescription, sendMessage, addBiometricEntry } = usePro()

  const patient = patients.find((p) => p.id === id)

  const [draftGoal, setDraftGoal] = useState<Goal | null>(null)
  const [draftDietType, setDraftDietType] = useState<DietType | null>(null)
  const [draftAllergens, setDraftAllergens] = useState<string[] | null>(null)
  const [justSaved, setJustSaved] = useState(false)
  const [messageText, setMessageText] = useState('')

  const [bioDate, setBioDate] = useState(TODAY_LABEL)
  const [bioWeight, setBioWeight] = useState('')
  const [bioFat, setBioFat] = useState('')
  const [bioMuscle, setBioMuscle] = useState('')
  const [bioWater, setBioWater] = useState('')
  const [bioSaved, setBioSaved] = useState(false)

  if (!patient) return <Navigate to="/pro" replace />

  const goal = draftGoal ?? patient.goal
  const dietType = draftDietType ?? patient.dietType
  const allergens = draftAllergens ?? patient.allergens
  const isDirty = draftGoal !== null || draftDietType !== null || draftAllergens !== null
  const latestBiometric = [...patient.weightHistory].reverse().find((w) => w.bodyFatPercent != null || w.muscleMassKg != null || w.waterPercent != null)

  function toggleAllergen(a: string) {
    const base = draftAllergens ?? patient!.allergens
    setDraftAllergens(base.includes(a) ? base.filter((x) => x !== a) : [...base, a])
  }

  function validatePrescription() {
    if (patient!.linkedToApp) {
      updateSelfDietaryProfile({ goal, dietType, allergens })
    } else {
      updatePrescription(patient!.id, { goal, dietType, allergens })
    }
    setDraftGoal(null)
    setDraftDietType(null)
    setDraftAllergens(null)
    setJustSaved(true)
    setTimeout(() => setJustSaved(false), 3000)
  }

  function handleSend() {
    if (!messageText.trim()) return
    sendMessage(patient!.id, messageText.trim())
    setMessageText('')
  }

  function submitBiometrics() {
    const weight = parseFloat(bioWeight.replace(',', '.'))
    if (!Number.isFinite(weight)) return
    const entry: WeightEntry = { date: bioDate.trim() || TODAY_LABEL, weight }
    const fat = parseFloat(bioFat.replace(',', '.'))
    if (Number.isFinite(fat)) entry.bodyFatPercent = fat
    const muscle = parseFloat(bioMuscle.replace(',', '.'))
    if (Number.isFinite(muscle)) entry.muscleMassKg = muscle
    const water = parseFloat(bioWater.replace(',', '.'))
    if (Number.isFinite(water)) entry.waterPercent = water
    addBiometricEntry(patient!.id, entry)
    setBioWeight('')
    setBioFat('')
    setBioMuscle('')
    setBioWater('')
    setBioSaved(true)
    setTimeout(() => setBioSaved(false), 3000)
  }

  return (
    <div className="p-5 sm:p-8 max-w-5xl mx-auto">
      <button onClick={() => navigate('/pro')} className="tap flex items-center gap-2 text-[13px] font-bold text-pro-ink-soft mb-6 hover:text-pro-blue-500 transition-colors">
        <ArrowLeft size={15} /> Retour aux patients
      </button>

      <div className="pro-rise flex items-center gap-4 mb-6">
        <PatientAvatar name={patient.name} />
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display font-semibold text-xl text-pro-ink">{patient.name}</h1>
            {patient.linkedToApp && (
              <span className="flex items-center gap-1 text-[11px] font-bold text-pro-mint-600 bg-pro-mint-100 px-2.5 py-1 rounded-full">
                <Smartphone size={11} /> Suivi appli en direct
              </span>
            )}
          </div>
          <p className="text-[13px] text-pro-ink-soft">Dernier contact {patient.lastCheckIn}</p>
        </div>
      </div>

      {patient.riskFlags.length > 0 && (
        <div className="pro-rise bg-pro-coral-100 border border-pro-coral-500/20 rounded-3xl p-5 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={16} className="text-pro-coral-600" />
            <p className="font-bold text-pro-coral-600 text-[14px]">Signaux à surveiller</p>
          </div>
          <ul className="flex flex-col gap-1.5">
            {patient.riskFlags.map((flag) => (
              <li key={flag} className="text-[13px] text-pro-coral-600/90">
                • {flag}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 flex flex-col gap-5">
          <Section icon={Calendar} iconColor="text-pro-gold-600" title="Repas du mois précédent" delay={40}>
            <div className="flex flex-col gap-1.5 max-h-64 overflow-y-auto pr-1">
              {patient.mealHistory.map((m, i) => (
                <div key={i} className="flex items-center gap-3 bg-black/[0.03] rounded-xl px-3 py-2">
                  <span className="text-[11px] font-bold text-pro-ink-soft/60 w-11 shrink-0">{m.date}</span>
                  <span className="text-[10px] font-bold text-pro-gold-600 uppercase tracking-wide w-11 shrink-0">{MEAL_SLOT_SHORT[m.slot]}</span>
                  <span className="flex-1 min-w-0 text-[12.5px] font-semibold text-pro-ink truncate">{m.name}</span>
                  <span className="text-[11px] text-pro-ink-soft/60 shrink-0">{m.kcal} kcal</span>
                </div>
              ))}
            </div>
          </Section>

          <Section icon={CalendarClock} iconColor="text-pro-lavender-600" title="Semaine suivante" delay={90}>
            {patient.nextWeekPlan ? (
              <div className="flex flex-col gap-1.5">
                {SHORT_DAYS.map((dayLabel, idx) => {
                  const dayNum = idx + 1
                  const dayMeals = patient.nextWeekPlan!.filter((m) => m.day === dayNum)
                  return (
                    <div key={dayNum} className="flex items-start gap-3 bg-black/[0.03] rounded-xl px-3 py-2">
                      <span className="text-[11px] font-bold text-pro-ink-soft/60 w-9 shrink-0 pt-0.5">{dayLabel}</span>
                      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                        {dayMeals.map((m, i) => (
                          <p key={i} className="text-[12px] text-pro-ink truncate">
                            <span className="text-pro-ink-soft/60">{MEAL_SLOT_SHORT[m.slot]} · </span>
                            {m.name}
                          </p>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-[12.5px] text-pro-ink-soft/60 italic">Pas encore créée par le patient.</p>
            )}
          </Section>

          <Section icon={Scale} iconColor="text-pro-blue-500" title="Trajectoire du poids" delay={140}>
            <div className="h-40 -ml-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={patient.weightHistory} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="proWeightGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3d4ef0" stopOpacity={0.32} />
                      <stop offset="100%" stopColor="#3d4ef0" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#555f78' }} axisLine={false} tickLine={false} />
                  <YAxis hide domain={['dataMin - 1', 'dataMax + 1']} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #eee', fontSize: 12 }} formatter={(v) => [`${v} kg`, 'Poids']} />
                  <Area type="monotone" dataKey="weight" stroke="#3d4ef0" strokeWidth={2.5} fill="url(#proWeightGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            {latestBiometric && (
              <div className="flex gap-2 mt-3 pt-3 border-t border-black/5">
                {latestBiometric.bodyFatPercent != null && (
                  <div className="flex-1 bg-black/[0.03] rounded-xl px-3 py-2 text-center">
                    <p className="text-[15px] font-extrabold text-pro-ink">{latestBiometric.bodyFatPercent}%</p>
                    <p className="text-[10px] text-pro-ink-soft/70">Masse grasse</p>
                  </div>
                )}
                {latestBiometric.muscleMassKg != null && (
                  <div className="flex-1 bg-black/[0.03] rounded-xl px-3 py-2 text-center">
                    <p className="text-[15px] font-extrabold text-pro-ink">{latestBiometric.muscleMassKg} kg</p>
                    <p className="text-[10px] text-pro-ink-soft/70">Masse musculaire</p>
                  </div>
                )}
                {latestBiometric.waterPercent != null && (
                  <div className="flex-1 bg-black/[0.03] rounded-xl px-3 py-2 text-center">
                    <p className="text-[15px] font-extrabold text-pro-ink">{latestBiometric.waterPercent}%</p>
                    <p className="text-[10px] text-pro-ink-soft/70">Eau</p>
                  </div>
                )}
              </div>
            )}
          </Section>

          <Section icon={Scale} iconColor="text-pro-coral-500" title="Ajouter une mesure (balance connectée)" delay={190}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-3">
              <label className="flex flex-col gap-1">
                <span className="text-[11px] font-bold text-pro-ink-soft">Date</span>
                <input
                  value={bioDate}
                  onChange={(e) => setBioDate(e.target.value)}
                  placeholder="ex. 02/09"
                  className="rounded-xl border border-black/10 px-3 py-2 text-[13px] outline-none transition-[border-color,box-shadow] duration-200 focus:border-pro-blue-500 focus:ring-4 focus:ring-pro-blue-50"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-[11px] font-bold text-pro-ink-soft">Poids (kg)</span>
                <input
                  type="number"
                  step="0.1"
                  value={bioWeight}
                  onChange={(e) => setBioWeight(e.target.value)}
                  placeholder="ex. 74.5"
                  className="rounded-xl border border-black/10 px-3 py-2 text-[13px] outline-none transition-[border-color,box-shadow] duration-200 focus:border-pro-blue-500 focus:ring-4 focus:ring-pro-blue-50"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-[11px] font-bold text-pro-ink-soft">Masse grasse (%)</span>
                <input
                  type="number"
                  step="0.1"
                  value={bioFat}
                  onChange={(e) => setBioFat(e.target.value)}
                  placeholder="facultatif"
                  className="rounded-xl border border-black/10 px-3 py-2 text-[13px] outline-none transition-[border-color,box-shadow] duration-200 focus:border-pro-blue-500 focus:ring-4 focus:ring-pro-blue-50"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-[11px] font-bold text-pro-ink-soft">Masse musculaire (kg)</span>
                <input
                  type="number"
                  step="0.1"
                  value={bioMuscle}
                  onChange={(e) => setBioMuscle(e.target.value)}
                  placeholder="facultatif"
                  className="rounded-xl border border-black/10 px-3 py-2 text-[13px] outline-none transition-[border-color,box-shadow] duration-200 focus:border-pro-blue-500 focus:ring-4 focus:ring-pro-blue-50"
                />
              </label>
              <label className="flex flex-col gap-1 sm:col-span-2">
                <span className="text-[11px] font-bold text-pro-ink-soft">Eau (%)</span>
                <input
                  type="number"
                  step="0.1"
                  value={bioWater}
                  onChange={(e) => setBioWater(e.target.value)}
                  placeholder="facultatif"
                  className="rounded-xl border border-black/10 px-3 py-2 text-[13px] outline-none transition-[border-color,box-shadow] duration-200 focus:border-pro-blue-500 focus:ring-4 focus:ring-pro-blue-50"
                />
              </label>
            </div>
            <Button full className="!bg-pro-blue-500 hover:!bg-pro-blue-600 !py-2.5 text-[13px] transition-colors duration-200" disabled={!bioWeight.trim()} onClick={submitBiometrics}>
              {bioSaved ? (
                <>
                  <Check size={14} /> Mesure ajoutée
                </>
              ) : (
                <>
                  <Plus size={14} /> Ajouter la mesure
                </>
              )}
            </Button>
            {patient.linkedToApp && (
              <p className="text-[11px] text-pro-ink-soft/60 mt-2 text-center">Visible aussi côté patiente, dans Foyer &gt; Progression.</p>
            )}
          </Section>

          <Section icon={Scale} iconColor="text-pro-gold-600" title="Observance hebdomadaire" delay={240}>
            <div className="h-32 -ml-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={patient.adherenceHistory} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#555f78' }} axisLine={false} tickLine={false} />
                  <YAxis hide domain={[0, 100]} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #eee', fontSize: 12 }} formatter={(v) => [`${v}%`, 'Observance']} />
                  <Bar dataKey="percent" radius={[6, 6, 0, 0]} fill="#dda61a" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Section>

          <Section icon={Book} iconColor="text-pro-mint-600" title="Journal alimentaire" delay={290}>
            {patient.journalEntries.length === 0 ? (
              <p className="text-[12.5px] text-pro-ink-soft/60 italic">Aucune note libre pour l'instant.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {patient.journalEntries.map((e) => (
                  <div key={e.id} className="flex items-start gap-3 bg-black/[0.03] rounded-2xl px-3.5 py-2.5">
                    <div className="w-11 h-9 rounded-xl bg-white flex items-center justify-center text-[11px] font-bold text-pro-ink-soft shrink-0">
                      {e.time || '—'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-pro-mint-600 uppercase tracking-wide">{JOURNAL_SLOT_LABEL[e.slot]}</p>
                      <p className="text-[13px] font-semibold text-pro-ink">{e.description}</p>
                      {e.kcal != null && <p className="text-[11.5px] text-pro-ink-soft/70">{e.kcal} kcal</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Section>
        </div>

        <div className="flex flex-col gap-5">
          <div className="pro-card pro-rise bg-white rounded-3xl border border-black/5 p-5" style={{ animationDelay: '60ms' }}>
            <p className="text-[13px] font-bold text-pro-ink-soft/80 uppercase tracking-wide mb-3">Prescription</p>

            <p className="text-[11.5px] font-bold text-pro-ink-soft mb-1.5">Objectif</p>
            <div className="flex flex-col gap-1.5 mb-4">
              {GOAL_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setDraftGoal(opt.value)}
                  className={`tap text-left px-3 py-2 rounded-xl border text-[12.5px] font-semibold transition-colors duration-150 ${
                    goal === opt.value ? 'border-pro-blue-500 bg-pro-blue-50 text-pro-blue-700' : 'border-black/10 text-pro-ink-soft'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <p className="text-[11.5px] font-bold text-pro-ink-soft mb-1.5">Régime alimentaire</p>
            <div className="flex flex-col gap-1.5 mb-4">
              {DIET_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setDraftDietType(opt.value)}
                  className={`tap text-left px-3 py-2 rounded-xl border transition-colors duration-150 ${
                    dietType === opt.value ? 'border-pro-blue-500 bg-pro-blue-50' : 'border-black/10'
                  }`}
                >
                  <p className={`text-[12.5px] font-semibold ${dietType === opt.value ? 'text-pro-blue-700' : 'text-pro-ink-soft'}`}>{opt.label}</p>
                  <p className="text-[11px] text-pro-ink-soft/60">{opt.hint}</p>
                </button>
              ))}
            </div>

            <p className="text-[11.5px] font-bold text-pro-ink-soft mb-1.5">Allergènes / contre-indications</p>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {ALLERGEN_OPTIONS.map((a) => (
                <button
                  key={a}
                  onClick={() => toggleAllergen(a)}
                  className={`tap px-2.5 py-1.5 rounded-full text-[11px] font-semibold border transition-colors duration-150 ${
                    allergens.includes(a) ? 'bg-pro-coral-500 text-white border-pro-coral-500' : 'bg-white border-black/10 text-pro-ink-soft'
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>

            <button
              onClick={validatePrescription}
              disabled={!isDirty}
              className="tap w-full py-2.5 rounded-2xl bg-pro-blue-500 hover:bg-pro-blue-600 text-white font-bold text-[13px] disabled:opacity-30 flex items-center justify-center gap-2 transition-colors duration-200"
            >
              {justSaved ? (
                <>
                  <Check size={14} /> Prescription envoyée
                </>
              ) : (
                'Valider la prescription'
              )}
            </button>
            {patient.linkedToApp && (
              <p className="text-[11px] text-pro-ink-soft/60 mt-2 text-center">S'applique immédiatement au planning de la patiente.</p>
            )}
          </div>

          <div className="pro-card pro-rise bg-white rounded-3xl border border-black/5 p-5 flex flex-col" style={{ animationDelay: '110ms' }}>
            <p className="text-[13px] font-bold text-pro-ink-soft/80 uppercase tracking-wide mb-3">Messagerie</p>
            <div className="flex flex-col gap-2.5 max-h-64 overflow-y-auto mb-3 pr-1">
              {patient.messages.length === 0 && <p className="text-[12.5px] text-pro-ink-soft/60 italic">Aucun échange pour l'instant.</p>}
              {patient.messages.map((m, i) => (
                <div key={i} className={`flex ${m.from === 'praticien' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-[12.5px] ${
                      m.from === 'praticien' ? 'bg-pro-blue-500 text-white' : 'bg-black/[0.04] text-pro-ink'
                    }`}
                  >
                    <p>{m.text}</p>
                    <p className={`text-[10px] mt-1 ${m.from === 'praticien' ? 'text-white/60' : 'text-pro-ink-soft/60'}`}>{m.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Écrire un message…"
                className="flex-1 rounded-2xl border border-black/10 px-3.5 py-2 text-[12.5px] outline-none transition-[border-color,box-shadow] duration-200 focus:border-pro-blue-500 focus:ring-4 focus:ring-pro-blue-50"
              />
              <button onClick={handleSend} className="tap w-9 h-9 rounded-full bg-pro-blue-500 hover:bg-pro-blue-600 text-white flex items-center justify-center shrink-0 transition-colors duration-200" aria-label="Envoyer">
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
