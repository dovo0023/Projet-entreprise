import { AlertTriangle, ArrowLeft, Check, Send, Smartphone } from 'lucide-react'
import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { Area, AreaChart, Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useApp } from '../../context/AppContext'
import { ALLERGEN_OPTIONS } from '../../data/mock'
import { PatientAvatar } from '../../pro/ProLayout'
import { usePro } from '../../pro/ProContext'
import { useDisplayPatients } from '../../pro/useDisplayPatients'
import { MacroBar } from '../../components/ui'
import type { Goal } from '../../types'

const GOAL_OPTIONS: { value: Goal; label: string }[] = [
  { value: 'seche', label: 'Perte de gras / Sèche' },
  { value: 'maintien', label: 'Maintien' },
  { value: 'prise_de_masse', label: 'Prise de masse' },
]

export default function ProPatientDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const patients = useDisplayPatients()
  const { setProfile } = useApp()
  const { updatePrescription, sendMessage } = usePro()

  const patient = patients.find((p) => p.id === id)

  const [draftGoal, setDraftGoal] = useState<Goal | null>(null)
  const [draftAllergens, setDraftAllergens] = useState<string[] | null>(null)
  const [justSaved, setJustSaved] = useState(false)
  const [messageText, setMessageText] = useState('')

  if (!patient) return <Navigate to="/pro" replace />

  const goal = draftGoal ?? patient.goal
  const allergens = draftAllergens ?? patient.allergens
  const isDirty = draftGoal !== null || draftAllergens !== null

  function toggleAllergen(a: string) {
    const base = draftAllergens ?? patient!.allergens
    setDraftAllergens(base.includes(a) ? base.filter((x) => x !== a) : [...base, a])
  }

  function validatePrescription() {
    if (patient!.linkedToApp) {
      setProfile({ goal, allergens })
    } else {
      updatePrescription(patient!.id, { goal, allergens })
    }
    setDraftGoal(null)
    setDraftAllergens(null)
    setJustSaved(true)
    setTimeout(() => setJustSaved(false), 3000)
  }

  function handleSend() {
    if (!messageText.trim()) return
    sendMessage(patient!.id, messageText.trim())
    setMessageText('')
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <button onClick={() => navigate('/pro')} className="tap flex items-center gap-2 text-[13px] font-bold text-ink-soft mb-6">
        <ArrowLeft size={15} /> Retour aux patients
      </button>

      <div className="flex items-center gap-4 mb-6">
        <PatientAvatar name={patient.name} />
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-ink">{patient.name}</h1>
            {patient.linkedToApp && (
              <span className="flex items-center gap-1 text-[11px] font-bold text-leaf-600 bg-leaf-50 px-2.5 py-1 rounded-full">
                <Smartphone size={11} /> Suivi appli en direct
              </span>
            )}
          </div>
          <p className="text-[13px] text-ink-soft">Dernier contact {patient.lastCheckIn}</p>
        </div>
      </div>

      {patient.riskFlags.length > 0 && (
        <div className="bg-berry-100 border border-berry-400/30 rounded-3xl p-5 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={16} className="text-berry-500" />
            <p className="font-bold text-berry-500 text-[14px]">Signaux à surveiller</p>
          </div>
          <ul className="flex flex-col gap-1.5">
            {patient.riskFlags.map((flag) => (
              <li key={flag} className="text-[13px] text-berry-500/90">
                • {flag}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 flex flex-col gap-5">
          <div className="bg-white rounded-3xl border border-black/5 p-5">
            <p className="text-[13px] font-bold text-ink-soft/70 uppercase tracking-wide mb-3">Aujourd’hui vs cible</p>
            <div className="flex flex-col gap-3">
              <MacroBar label="Calories" value={patient.actualToday.kcal} target={patient.targets.kcal} unit=" kcal" color="#1c2321" />
              <MacroBar label="Protéines" value={patient.actualToday.protein} target={patient.targets.protein} color="#2f9d5f" />
              <MacroBar label="Glucides" value={patient.actualToday.carbs} target={patient.targets.carbs} color="#f7822a" />
              <MacroBar label="Lipides" value={patient.actualToday.fat} target={patient.targets.fat} color="#e14f74" />
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-black/5 p-5">
            <p className="text-[13px] font-bold text-ink-soft/70 uppercase tracking-wide mb-3">Trajectoire du poids</p>
            <div className="h-40 -ml-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={patient.weightHistory} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="proWeightGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2f9d5f" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#2f9d5f" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#4b5563' }} axisLine={false} tickLine={false} />
                  <YAxis hide domain={['dataMin - 1', 'dataMax + 1']} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #eee', fontSize: 12 }} formatter={(v) => [`${v} kg`, 'Poids']} />
                  <Area type="monotone" dataKey="weight" stroke="#2f9d5f" strokeWidth={2.5} fill="url(#proWeightGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-black/5 p-5">
            <p className="text-[13px] font-bold text-ink-soft/70 uppercase tracking-wide mb-3">Observance hebdomadaire</p>
            <div className="h-32 -ml-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={patient.adherenceHistory} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#4b5563' }} axisLine={false} tickLine={false} />
                  <YAxis hide domain={[0, 100]} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #eee', fontSize: 12 }} formatter={(v) => [`${v}%`, 'Observance']} />
                  <Bar dataKey="percent" radius={[6, 6, 0, 0]} fill="#f7822a" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div className="bg-white rounded-3xl border border-black/5 p-5">
            <p className="text-[13px] font-bold text-ink-soft/70 uppercase tracking-wide mb-3">Prescription</p>

            <p className="text-[11.5px] font-bold text-ink-soft mb-1.5">Objectif</p>
            <div className="flex flex-col gap-1.5 mb-4">
              {GOAL_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setDraftGoal(opt.value)}
                  className={`tap text-left px-3 py-2 rounded-xl border text-[12.5px] font-semibold ${
                    goal === opt.value ? 'border-leaf-500 bg-leaf-50 text-leaf-700' : 'border-black/10 text-ink-soft'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <p className="text-[11.5px] font-bold text-ink-soft mb-1.5">Allergènes / contre-indications</p>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {ALLERGEN_OPTIONS.map((a) => (
                <button
                  key={a}
                  onClick={() => toggleAllergen(a)}
                  className={`tap px-2.5 py-1.5 rounded-full text-[11px] font-semibold border ${
                    allergens.includes(a) ? 'bg-berry-500 text-white border-berry-500' : 'bg-white border-black/10 text-ink-soft'
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>

            <button
              onClick={validatePrescription}
              disabled={!isDirty}
              className="tap w-full py-2.5 rounded-2xl bg-ink text-cream font-bold text-[13px] disabled:opacity-30 flex items-center justify-center gap-2"
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
              <p className="text-[11px] text-ink-soft/50 mt-2 text-center">S’applique immédiatement au planning de la patiente.</p>
            )}
          </div>

          <div className="bg-white rounded-3xl border border-black/5 p-5 flex flex-col">
            <p className="text-[13px] font-bold text-ink-soft/70 uppercase tracking-wide mb-3">Messagerie</p>
            <div className="flex flex-col gap-2.5 max-h-64 overflow-y-auto mb-3 pr-1">
              {patient.messages.length === 0 && <p className="text-[12.5px] text-ink-soft/50 italic">Aucun échange pour l’instant.</p>}
              {patient.messages.map((m, i) => (
                <div key={i} className={`flex ${m.from === 'praticien' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-[12.5px] ${
                      m.from === 'praticien' ? 'bg-ink text-cream' : 'bg-black/[0.04] text-ink'
                    }`}
                  >
                    <p>{m.text}</p>
                    <p className={`text-[10px] mt-1 ${m.from === 'praticien' ? 'text-cream/50' : 'text-ink-soft/50'}`}>{m.time}</p>
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
                className="flex-1 rounded-2xl border border-black/10 px-3.5 py-2 text-[12.5px] outline-none focus:border-leaf-500"
              />
              <button onClick={handleSend} className="tap w-9 h-9 rounded-full bg-ink text-cream flex items-center justify-center shrink-0" aria-label="Envoyer">
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
