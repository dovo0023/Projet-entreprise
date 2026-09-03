import { Book, Calendar, Check, ChevronRight, Copy, MessageCircle, Plus, Scale, Send, Trash2, TrendingDown, TrendingUp, X } from 'lucide-react'
import { useState } from 'react'
import { Area, AreaChart, Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { PATIENT_SHARE_CODE, SELF_RECORD_ID, useApp } from '../../context/AppContext'
import { Button, Card, SectionTitle } from '../../components/ui'
import AppointmentBooking from './AppointmentBooking'
import type { JournalSlot } from '../../types'

const JOURNAL_SLOT_OPTIONS: { value: JournalSlot; label: string }[] = [
  { value: 'petit-dejeuner', label: 'Petit-déj' },
  { value: 'midi', label: 'Midi' },
  { value: 'encas', label: 'Encas' },
  { value: 'soir', label: 'Soir' },
  { value: 'autre', label: 'Autre' },
]

const JOURNAL_SLOT_LABEL: Record<JournalSlot, string> = {
  'petit-dejeuner': 'Petit-déjeuner',
  midi: 'Midi',
  encas: 'Encas',
  soir: 'Soir',
  autre: 'Autre',
}

export default function ProgressScreen() {
  const { profile, householdMembers, personalRecords, logWeight, addJournalEntry, removeJournalEntry, messages, sendMessage, appointments } =
    useApp()
  const [bookingOpen, setBookingOpen] = useState(false)
  const people = [{ id: SELF_RECORD_ID, name: profile.firstName }, ...householdMembers.map((m) => ({ id: m.id, name: m.name }))]
  const [selectedId, setSelectedId] = useState(SELF_RECORD_ID)
  const selectedPerson = people.find((p) => p.id === selectedId) ?? people[0]
  const record = personalRecords[selectedPerson.id] ?? { weightHistory: [], adherenceHistory: [], journalEntries: [] }
  const { weightHistory, adherenceHistory, journalEntries } = record

  const [weightInput, setWeightInput] = useState('')
  const [journalOpen, setJournalOpen] = useState(false)
  const [journalDesc, setJournalDesc] = useState('')
  const [journalSlot, setJournalSlot] = useState<JournalSlot>('encas')
  const [journalTime, setJournalTime] = useState('')
  const [journalKcal, setJournalKcal] = useState('')
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
    setJournalOpen(false)
  }

  function handleLogWeight() {
    const value = parseFloat(weightInput.replace(',', '.'))
    if (!Number.isFinite(value)) return
    logWeight(selectedPerson.id, value)
    setWeightInput('')
  }

  function resetJournalForm() {
    setJournalDesc('')
    setJournalSlot('encas')
    setJournalTime('')
    setJournalKcal('')
    setJournalOpen(false)
  }

  function submitJournalEntry() {
    if (!journalDesc.trim()) return
    const kcal = journalKcal.trim() ? Number(journalKcal) : null
    addJournalEntry(selectedPerson.id, {
      day: 1,
      time: journalTime.trim(),
      slot: journalSlot,
      description: journalDesc.trim(),
      kcal: Number.isFinite(kcal) ? kcal : null,
      protein: null,
      carbs: null,
      fat: null,
    })
    resetJournalForm()
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
    <div className="flex-1 flex flex-col overflow-hidden relative">
      <div className="flex-1 overflow-y-auto no-scrollbar">
      <div className="px-5 pt-5 pb-2">
        <h1 className="text-xl font-extrabold text-ink">Progression & santé</h1>
        <p className="text-[13px] text-ink-soft">{subtitle}</p>
      </div>

      {people.length > 1 && (
        <div className="px-5 mt-3 flex gap-2 overflow-x-auto no-scrollbar">
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

      <div className="px-5 mt-3">
        <Card>
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
      </div>

      <div className="px-5 mt-6">
        <SectionTitle>Trajectoire du poids</SectionTitle>
        <Card>
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
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: '1px solid #eee', fontSize: 12 }}
                  formatter={(v) => [`${v} kg`, 'Poids']}
                />
                <Area type="monotone" dataKey="weight" stroke="#2f9d5f" strokeWidth={2.5} fill="url(#weightGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="px-5 mt-6">
        <SectionTitle>Taux d’observance des repas</SectionTitle>
        <Card>
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
      </div>

      <div className="px-5 mt-6">
        <SectionTitle>Journal alimentaire</SectionTitle>
        <Card className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Book size={15} className="text-leaf-600" />
            <p className="text-[13px] font-bold text-ink">
              {selectedPerson.id === SELF_RECORD_ID ? 'Vos écarts au menu' : `Les écarts au menu de ${selectedPerson.name}`}
            </p>
          </div>
          {journalEntries.length === 0 && !journalOpen && (
            <p className="text-[12.5px] text-ink-soft/50 italic">
              Notez ici ce que {selectedPerson.id === SELF_RECORD_ID ? 'vous mangez' : `${selectedPerson.name} mange`} en plus ou à la place
              du menu prévu.
            </p>
          )}
          {journalEntries.length > 0 && (
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

          {journalOpen ? (
            <div className="fade-up flex flex-col gap-2.5 pt-3 border-t border-black/5">
              <input
                value={journalDesc}
                onChange={(e) => setJournalDesc(e.target.value)}
                placeholder="Ex. Part de gâteau au bureau"
                className="rounded-2xl border border-black/10 px-3.5 py-2.5 text-[13px] outline-none focus:border-leaf-500"
              />
              <div className="flex flex-wrap gap-1.5">
                {JOURNAL_SLOT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setJournalSlot(opt.value)}
                    className={`tap px-3 py-1.5 rounded-full text-[12px] font-bold border ${
                      journalSlot === opt.value ? 'bg-ink text-cream border-ink' : 'bg-white text-ink-soft border-black/10'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={journalTime}
                  onChange={(e) => setJournalTime(e.target.value)}
                  placeholder="Heure (ex. 16:00)"
                  className="flex-1 rounded-2xl border border-black/10 px-3.5 py-2 text-[13px] outline-none focus:border-leaf-500"
                />
                <input
                  type="number"
                  value={journalKcal}
                  onChange={(e) => setJournalKcal(e.target.value)}
                  placeholder="kcal (facultatif)"
                  className="flex-1 rounded-2xl border border-black/10 px-3.5 py-2 text-[13px] outline-none focus:border-leaf-500"
                />
              </div>
              <div className="flex gap-2 mt-1">
                <Button variant="ghost" className="flex-1 !py-2.5" onClick={resetJournalForm}>
                  <X size={14} /> Annuler
                </Button>
                <Button className="flex-1 !py-2.5" disabled={!journalDesc.trim()} onClick={submitJournalEntry}>
                  Ajouter
                </Button>
              </div>
            </div>
          ) : (
            <Button variant="secondary" full onClick={() => setJournalOpen(true)}>
              <Plus size={15} /> Ajouter un aliment
            </Button>
          )}
        </Card>
      </div>

      <div className="px-5 mt-6">
        <SectionTitle>Rendez-vous</SectionTitle>
        <Card className="flex flex-col gap-3">
          {appointments.length > 0 ? (
            <div className="flex flex-col gap-2">
              {appointments.map((a) => (
                <div key={a.id} className="flex items-center gap-3 bg-black/[0.03] rounded-2xl px-3.5 py-2.5">
                  <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shrink-0">
                    <Calendar size={15} className="text-leaf-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-ink text-[13.5px] truncate">{a.practitionerName}</p>
                    <p className="text-[12px] text-ink-soft/60">
                      {a.dayLabel} à {a.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[12.5px] text-ink-soft/50 italic">Aucun rendez-vous programmé pour l’instant.</p>
          )}
          <button onClick={() => setBookingOpen(true)} className="tap w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-black/5">
            <span className="text-[13px] font-bold text-ink">Trouver un(e) diététicien(ne) près de chez moi</span>
            <ChevronRight size={15} className="text-ink-soft/50 shrink-0" />
          </button>
        </Card>
      </div>

      <div className="px-5 mt-6 pb-8">
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
      </div>

      {bookingOpen && <AppointmentBooking onClose={() => setBookingOpen(false)} />}
    </div>
  )
}
