import { ArrowRight, Book, Check, Copy, MessageCircle, Scale, Send, Trash2, TrendingDown, TrendingUp } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Area, AreaChart, Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { PATIENT_SHARE_CODE, SELF_RECORD_ID, useApp } from '../../context/AppContext'
import { Button, Card, SectionTitle } from '../../components/ui'
import JournalField from './JournalField'
import type { JournalSlot } from '../../types'

const JOURNAL_SLOT_LABEL: Record<JournalSlot, string> = {
  'petit-dejeuner': 'Petit-déjeuner',
  midi: 'Midi',
  encas: 'Encas',
  soir: 'Soir',
  autre: 'Autre',
}

/** Suivi (poids, observance, journal alimentaire, espace praticien) par personne du foyer — vue "Progression" de l'onglet Foyer. */
export default function HouseholdProgress() {
  const { profile, householdMembers, personalRecords, logWeight, removeJournalEntry, messages, sendMessage } = useApp()
  const navigate = useNavigate()
  const people = [{ id: SELF_RECORD_ID, name: profile.firstName }, ...householdMembers.map((m) => ({ id: m.id, name: m.name }))]
  const [selectedId, setSelectedId] = useState(SELF_RECORD_ID)
  const selectedPerson = people.find((p) => p.id === selectedId) ?? people[0]
  const record = personalRecords[selectedPerson.id] ?? { weightHistory: [], adherenceHistory: [], journalEntries: [] }
  const { weightHistory, adherenceHistory, journalEntries } = record

  const [weightInput, setWeightInput] = useState('')
  const [chatOpen, setChatOpen] = useState(false)
  const [messageText, setMessageText] = useState('')
  const [copied, setCopied] = useState(false)
  const lastWeight = weightHistory[weightHistory.length - 1]?.weight
  const firstWeight = weightHistory[0]?.weight
  const delta = lastWeight != null && firstWeight != null ? (lastWeight - firstWeight).toFixed(1) : '0.0'
  const loggedToday = weightHistory[weightHistory.length - 1]?.date === '01/09'
  const subtitle =
    selectedPerson.id === SELF_RECORD_ID
      ? 'Votre pesée hebdomadaire recalibre votre plan.'
      : `La pesée hebdomadaire de ${selectedPerson.name} recalibre son plan.`

  function selectPerson(id: string) {
    setSelectedId(id)
    setWeightInput('')
  }

  function handleLogWeight() {
    const value = parseFloat(weightInput.replace(',', '.'))
    if (!Number.isFinite(value)) return
    logWeight(selectedPerson.id, value)
    setWeightInput('')
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(PATIENT_SHARE_CODE)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Presse-papier indisponible (permissions navigateur) : le code reste affichable et copiable manuellement.
    }
  }

  function handleSend() {
    if (!messageText.trim()) return
    sendMessage('patient', messageText.trim())
    setMessageText('')
  }

  return (
    <div>
      <p className="text-[13px] text-ink-soft mb-4">{subtitle}</p>

      {people.length > 1 && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4">
          {people.map((p) => (
            <button
              key={p.id}
              onClick={() => selectPerson(p.id)}
              className={`tap shrink-0 px-4 py-2 rounded-full text-[13px] font-bold border ${
                selectedPerson.id === p.id ? 'bg-leaf-500 text-white border-leaf-500' : 'bg-white border-black/10 text-ink-soft'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      )}

      <Card className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Scale size={16} className="text-leaf-600" />
          <p className="text-[13px] font-bold text-ink">Pesée du dimanche</p>
        </div>
        {loggedToday ? (
          <div className="flex items-center gap-2 bg-leaf-50 text-leaf-700 rounded-2xl py-3 px-4 text-[13px] font-semibold">
            Poids enregistré · portions de la semaine prochaine ajustées automatiquement (Boucle adaptative Ultra).
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              type="number"
              step="0.1"
              value={weightInput}
              onChange={(e) => setWeightInput(e.target.value)}
              placeholder={lastWeight != null ? `${lastWeight}` : '—'}
              className="flex-1 rounded-2xl border border-black/10 px-4 py-3 text-[15px] outline-none focus:border-leaf-500"
            />
            <Button onClick={handleLogWeight} className="!px-5">
              Valider
            </Button>
          </div>
        )}
      </Card>

      <SectionTitle>Trajectoire du poids</SectionTitle>
      <Card className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          {Number(delta) > 0 ? (
            <TrendingUp size={16} className="text-clementine-500" />
          ) : (
            <TrendingDown size={16} className="text-leaf-600" />
          )}
          <span className="text-[20px] font-extrabold text-ink">{delta} kg</span>
          <span className="text-[12px] text-ink-soft/60">depuis le 1er juillet</span>
        </div>
        <div className="h-36 -ml-4 mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weightHistory} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2f9d5f" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#2f9d5f" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#4b5563' }} axisLine={false} tickLine={false} />
              <YAxis hide domain={['dataMin - 1', 'dataMax + 1']} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #eee', fontSize: 12 }} formatter={(v) => [`${v} kg`, 'Poids']} />
              <Area type="monotone" dataKey="weight" stroke="#2f9d5f" strokeWidth={2.5} fill="url(#weightGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <SectionTitle>Taux d’observance des repas</SectionTitle>
      <Card className="mb-6">
        <div className="h-32 -ml-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={adherenceHistory} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#4b5563' }} axisLine={false} tickLine={false} />
              <YAxis hide domain={[0, 100]} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #eee', fontSize: 12 }} formatter={(v) => [`${v}%`, 'Observance']} />
              <Bar dataKey="percent" radius={[6, 6, 0, 0]} fill="#f7822a" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <SectionTitle>Journal alimentaire</SectionTitle>
      {selectedPerson.id === SELF_RECORD_ID ? (
        <Card className="flex flex-col gap-3 mb-6">
          <div className="flex items-center gap-2">
            <Book size={15} className="text-leaf-600" />
            <p className="text-[13px] font-bold text-ink">Vos écarts au menu</p>
          </div>
          {journalEntries.length === 0 ? (
            <p className="text-[12.5px] text-ink-soft/50 italic">Rien noté pour l’instant.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {journalEntries.map((e) => (
                <div key={e.id} className="flex items-start gap-3 bg-black/[0.03] rounded-2xl px-3.5 py-2.5">
                  <div className="w-11 h-9 rounded-xl bg-white flex items-center justify-center text-[11px] font-bold text-ink-soft shrink-0">
                    {e.time || '—'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-leaf-600 uppercase tracking-wide">{JOURNAL_SLOT_LABEL[e.slot]}</p>
                    <p className="text-[13px] font-semibold text-ink">{e.description}</p>
                    {e.kcal != null && <p className="text-[11.5px] text-ink-soft/60">{e.kcal} kcal</p>}
                  </div>
                  <button
                    onClick={() => removeJournalEntry(selectedPerson.id, e.id)}
                    className="tap w-7 h-7 rounded-full bg-white flex items-center justify-center shrink-0 text-ink-soft/50"
                    aria-label="Supprimer cette note"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <button
            onClick={() => navigate('/app/today')}
            className="tap flex items-center justify-center gap-1.5 text-[12.5px] font-bold text-leaf-600 py-1"
          >
            Ajouter une note depuis Aujourd’hui <ArrowRight size={13} />
          </button>
        </Card>
      ) : (
        <div className="mb-6">
          <JournalField
            personId={selectedPerson.id}
            day={1}
            title={`Les écarts au menu de ${selectedPerson.name}`}
            emptyText={`Notez ici ce que ${selectedPerson.name} mange en plus ou à la place du menu prévu.`}
          />
        </div>
      )}

      <SectionTitle>Espace praticien</SectionTitle>
      <Card className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-berry-100 flex items-center justify-center text-lg shrink-0">👩‍⚕️</div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-ink text-[14px]">Dr. Elise Marchand</p>
            <p className="text-[12px] text-ink-soft/60">Diététicienne référente</p>
          </div>
          <button
            onClick={() => setChatOpen((o) => !o)}
            aria-label="Ouvrir la messagerie"
            className="tap w-9 h-9 rounded-full bg-black/5 flex items-center justify-center relative"
          >
            <MessageCircle size={16} className="text-ink-soft" />
            {messages.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-berry-500 text-white text-[9px] font-bold flex items-center justify-center">
                {messages.length}
              </span>
            )}
          </button>
        </div>

        {chatOpen && (
          <div className="fade-up pt-1 border-t border-black/5">
            <div className="flex flex-col gap-2.5 max-h-56 overflow-y-auto my-3 pr-1">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.from === 'patient' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-[13px] ${
                      m.from === 'patient' ? 'bg-leaf-500 text-white' : 'bg-black/[0.04] text-ink'
                    }`}
                  >
                    <p>{m.text}</p>
                    <p className={`text-[10px] mt-1 ${m.from === 'patient' ? 'text-white/70' : 'text-ink-soft/50'}`}>{m.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Écrire à votre praticien…"
                className="flex-1 rounded-2xl border border-black/10 px-3.5 py-2 text-[13px] outline-none focus:border-leaf-500"
              />
              <button onClick={handleSend} className="tap w-9 h-9 rounded-full bg-leaf-500 text-white flex items-center justify-center shrink-0" aria-label="Envoyer">
                <Send size={14} />
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between bg-black/[0.03] rounded-2xl px-4 py-3">
          <div>
            <p className="text-[11px] font-bold text-ink-soft/50 uppercase">Code de partage</p>
            <p className="font-mono font-bold text-ink text-[14px] tracking-wider">{PATIENT_SHARE_CODE}</p>
          </div>
          <button onClick={copyCode} className="tap w-8 h-8 rounded-full bg-white flex items-center justify-center" aria-label="Copier le code">
            {copied ? <Check size={13} className="text-leaf-600" /> : <Copy size={13} className="text-ink-soft" />}
          </button>
        </div>
      </Card>
    </div>
  )
}
