import { AlertTriangle, Check, ChevronRight, Search, Smartphone, TrendingDown, TrendingUp, UserPlus, Users, X } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { PatientAvatar } from '../../pro/ProLayout'
import { usePro } from '../../pro/ProContext'
import { useDisplayPatients } from '../../pro/useDisplayPatients'
import { useCountUp } from '../../pro/useCountUp'
import { computeAdherenceTrend } from '../../data/patients'
import type { Goal } from '../../types'

const GOAL_LABEL: Record<Goal, string> = {
  seche: 'Perte de gras',
  maintien: 'Maintien',
  prise_de_masse: 'Prise de masse',
}

function KpiCard({
  icon: Icon,
  iconBg,
  iconColor,
  value,
  suffix = '',
  label,
  hint,
  tone,
}: {
  icon: typeof Users
  iconBg: string
  iconColor: string
  value: number
  suffix?: string
  label: string
  hint?: string
  tone?: 'alert'
}) {
  const animated = useCountUp(value)
  return (
    <div className={`pro-card bg-pro-surface rounded-3xl border p-5 ${tone === 'alert' ? 'border-pro-coral-100' : 'border-black/5'}`}>
      <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center mb-3`}>
        <Icon size={16} className={iconColor} />
      </div>
      <p className="text-3xl font-extrabold text-pro-ink tabular-nums">
        {animated}
        {suffix}
      </p>
      <p className="text-[12.5px] text-pro-ink-soft mt-0.5">
        {label}
        {hint && <span className="block text-[11px] text-pro-ink-soft/60 mt-0.5">{hint}</span>}
      </p>
    </div>
  )
}

export default function ProDashboard() {
  const navigate = useNavigate()
  const patients = useDisplayPatients()
  const { addPatientByCode } = usePro()
  const [query, setQuery] = useState('')
  const [inviteOpen, setInviteOpen] = useState(false)
  const [code, setCode] = useState('')
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null)

  const atRisk = patients.filter((p) => p.riskFlags.length > 0)
  const avgAdherence = Math.round(
    patients.reduce((sum, p) => sum + (p.adherenceHistory[p.adherenceHistory.length - 1]?.percent ?? 0), 0) / patients.length,
  )

  const filtered = patients.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))

  function handleAddPatient(e: FormEvent) {
    e.preventDefault()
    const result = addPatientByCode(code)
    if (!result.success) {
      setFeedback({ ok: false, text: 'Code invalide. Vérifiez le code partagé par votre patient depuis son espace « Progression ».' })
      return
    }
    setFeedback({
      ok: true,
      text: result.alreadyAdded ? `${result.patientName} est déjà dans votre portefeuille.` : `${result.patientName} a été ajouté(e) à votre portefeuille.`,
    })
    setCode('')
  }

  return (
    <div className="p-5 sm:p-8 max-w-5xl mx-auto">
      <div className="pro-rise flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display font-semibold text-2xl text-pro-ink">Votre portefeuille patients</h1>
          <p className="text-[14px] text-pro-ink-soft mt-1">Repérez qui décroche avant qu'il ne soit trop tard.</p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative w-full sm:w-56">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-pro-ink-soft/40" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un patient…"
              className="pl-9 pr-4 py-2.5 rounded-2xl border border-black/10 bg-white text-[13.5px] outline-none transition-[border-color,box-shadow] duration-200 focus:border-pro-blue-500 focus:ring-4 focus:ring-pro-blue-50 w-full"
            />
          </div>
          <button
            onClick={() => {
              setInviteOpen((o) => !o)
              setFeedback(null)
            }}
            className={`tap flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[13px] font-bold transition-colors duration-200 ${
              inviteOpen ? 'bg-black/5 text-pro-ink-soft' : 'bg-pro-blue-500 text-white hover:bg-pro-blue-600'
            }`}
          >
            {inviteOpen ? <X size={15} /> : <UserPlus size={15} />}
            {inviteOpen ? 'Annuler' : 'Ajouter un patient'}
          </button>
        </div>
      </div>

      {inviteOpen && (
        <form onSubmit={handleAddPatient} className="pro-pop bg-white rounded-3xl border border-black/5 p-5 mb-6 flex flex-col sm:flex-row sm:items-end gap-3">
          <label className="flex-1 flex flex-col gap-1.5">
            <span className="text-[12px] font-bold text-pro-ink-soft">Code de partage du patient</span>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Ex : ND-72K9"
              className="rounded-2xl border border-black/10 px-4 py-2.5 text-[14px] font-mono tracking-wide outline-none transition-[border-color,box-shadow] duration-200 focus:border-pro-blue-500 focus:ring-4 focus:ring-pro-blue-50"
            />
          </label>
          <button type="submit" className="tap px-5 py-2.5 rounded-2xl bg-pro-blue-500 hover:bg-pro-blue-600 transition-colors duration-200 text-white font-bold text-[13px] shrink-0">
            Lier le patient
          </button>
        </form>
      )}

      {feedback && (
        <div
          className={`pro-pop flex items-center gap-2 rounded-2xl px-4 py-3 mb-6 text-[13px] font-semibold ${
            feedback.ok ? 'bg-pro-mint-100 text-pro-mint-600' : 'bg-pro-coral-100 text-pro-coral-600'
          }`}
        >
          {feedback.ok ? <Check size={15} /> : <AlertTriangle size={15} />}
          {feedback.text}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="pro-rise" style={{ animationDelay: '40ms' }}>
          <KpiCard icon={Users} iconBg="bg-pro-mint-100" iconColor="text-pro-mint-600" value={patients.length} label="Patients actifs" />
        </div>
        <div className="pro-rise" style={{ animationDelay: '110ms' }}>
          <KpiCard icon={TrendingUp} iconBg="bg-pro-gold-100" iconColor="text-pro-gold-600" value={avgAdherence} suffix="%" label="Observance moyenne (S8)" />
        </div>
        <div className="pro-rise" style={{ animationDelay: '180ms' }}>
          <KpiCard
            icon={AlertTriangle}
            iconBg="bg-pro-coral-100"
            iconColor="text-pro-coral-600"
            value={atRisk.length}
            label="À risque de décrochage"
            hint="Repère : l'abandon des suivis diététiques est le plus fréquent lors du 1er mois."
            tone="alert"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-black/5 overflow-hidden">
        {filtered.map((patient, i) => {
          const trend = computeAdherenceTrend(patient.adherenceHistory)
          const lastAdherence = patient.adherenceHistory[patient.adherenceHistory.length - 1]?.percent ?? 0
          const atRiskPatient = patient.riskFlags.length > 0

          return (
            <button
              key={patient.id}
              onClick={() => navigate(`/pro/patients/${patient.id}`)}
              className={`pro-rise tap w-full flex flex-wrap sm:flex-nowrap items-center gap-3 sm:gap-4 px-4 sm:px-5 py-4 text-left transition-colors duration-150 ${
                i !== filtered.length - 1 ? 'border-b border-black/5' : ''
              } hover:bg-pro-blue-50/40`}
              style={{ animationDelay: `${Math.min(i, 6) * 45}ms` }}
            >
              <PatientAvatar name={patient.name} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-pro-ink text-[14.5px] truncate">{patient.name}</p>
                  {patient.linkedToApp && (
                    <span className="flex items-center gap-1 text-[10.5px] font-bold text-pro-mint-600 bg-pro-mint-100 px-2 py-0.5 rounded-full shrink-0">
                      <Smartphone size={10} /> Suivi appli
                    </span>
                  )}
                </div>
                <p className="text-[12.5px] text-pro-ink-soft/80 mt-0.5">
                  {GOAL_LABEL[patient.goal]} · Dernier contact {patient.lastCheckIn}
                </p>
              </div>

              <div className="flex items-center gap-1.5 w-28 shrink-0">
                {trend === 'hausse' && <TrendingUp size={14} className="text-pro-mint-600" />}
                {trend === 'baisse' && <TrendingDown size={14} className="text-pro-coral-500" />}
                <span className={`text-[14px] font-extrabold tabular-nums ${trend === 'baisse' ? 'text-pro-coral-500' : 'text-pro-ink'}`}>{lastAdherence}%</span>
                <span className="text-[11px] text-pro-ink-soft/60">observance</span>
              </div>

              <div className="w-40 shrink-0">
                {atRiskPatient ? (
                  <span className="inline-flex items-center gap-1.5 text-[11.5px] font-bold text-pro-coral-600 bg-pro-coral-100 px-2.5 py-1 rounded-full">
                    <AlertTriangle size={11} /> À surveiller
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-[11.5px] font-bold text-pro-mint-600 bg-pro-mint-100 px-2.5 py-1 rounded-full">Suivi stable</span>
                )}
              </div>

              <ChevronRight size={16} className="text-pro-ink-soft/30 shrink-0" />
            </button>
          )
        })}
      </div>
    </div>
  )
}
