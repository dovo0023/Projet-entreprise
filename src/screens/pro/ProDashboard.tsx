import { AlertTriangle, ChevronRight, Search, Smartphone, TrendingDown, TrendingUp, Users } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PatientAvatar } from '../../pro/ProLayout'
import { useDisplayPatients } from '../../pro/useDisplayPatients'
import { computeAdherenceTrend } from '../../data/patients'
import type { Goal } from '../../types'

const GOAL_LABEL: Record<Goal, string> = {
  seche: 'Perte de gras',
  maintien: 'Maintien',
  prise_de_masse: 'Prise de masse',
}

export default function ProDashboard() {
  const navigate = useNavigate()
  const patients = useDisplayPatients()
  const [query, setQuery] = useState('')

  const atRisk = patients.filter((p) => p.riskFlags.length > 0)
  const avgAdherence = Math.round(
    patients.reduce((sum, p) => sum + (p.adherenceHistory[p.adherenceHistory.length - 1]?.percent ?? 0), 0) / patients.length,
  )

  const filtered = patients.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-ink">Votre portefeuille patients</h1>
          <p className="text-[14px] text-ink-soft mt-1">Repérez qui décroche avant qu’il ne soit trop tard.</p>
        </div>
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un patient…"
            className="pl-9 pr-4 py-2.5 rounded-2xl border border-black/10 bg-white text-[13.5px] outline-none focus:border-leaf-500 w-64"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-3xl border border-black/5 p-5">
          <div className="w-9 h-9 rounded-xl bg-leaf-50 flex items-center justify-center mb-3">
            <Users size={16} className="text-leaf-600" />
          </div>
          <p className="text-3xl font-extrabold text-ink">{patients.length}</p>
          <p className="text-[12.5px] text-ink-soft mt-0.5">Patients actifs</p>
        </div>
        <div className="bg-white rounded-3xl border border-black/5 p-5">
          <div className="w-9 h-9 rounded-xl bg-clementine-100 flex items-center justify-center mb-3">
            <TrendingUp size={16} className="text-clementine-500" />
          </div>
          <p className="text-3xl font-extrabold text-ink">{avgAdherence}%</p>
          <p className="text-[12.5px] text-ink-soft mt-0.5">Observance moyenne (S8)</p>
        </div>
        <div className="bg-white rounded-3xl border border-berry-100 p-5">
          <div className="w-9 h-9 rounded-xl bg-berry-100 flex items-center justify-center mb-3">
            <AlertTriangle size={16} className="text-berry-500" />
          </div>
          <p className="text-3xl font-extrabold text-ink">{atRisk.length}</p>
          <p className="text-[12.5px] text-ink-soft mt-0.5">
            À risque de décrochage
            <span className="block text-[11px] text-ink-soft/50 mt-0.5">Repère : l’abandon des suivis diététiques est le plus fréquent lors du 1er mois.</span>
          </p>
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
              className={`tap w-full flex items-center gap-4 px-5 py-4 text-left ${i !== filtered.length - 1 ? 'border-b border-black/5' : ''} hover:bg-black/[0.02]`}
            >
              <PatientAvatar name={patient.name} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-ink text-[14.5px] truncate">{patient.name}</p>
                  {patient.linkedToApp && (
                    <span className="flex items-center gap-1 text-[10.5px] font-bold text-leaf-600 bg-leaf-50 px-2 py-0.5 rounded-full shrink-0">
                      <Smartphone size={10} /> Suivi appli
                    </span>
                  )}
                </div>
                <p className="text-[12.5px] text-ink-soft/70 mt-0.5">
                  {GOAL_LABEL[patient.goal]} · Dernier contact {patient.lastCheckIn}
                </p>
              </div>

              <div className="flex items-center gap-1.5 w-28 shrink-0">
                {trend === 'hausse' && <TrendingUp size={14} className="text-leaf-600" />}
                {trend === 'baisse' && <TrendingDown size={14} className="text-berry-500" />}
                <span className={`text-[14px] font-extrabold ${trend === 'baisse' ? 'text-berry-500' : 'text-ink'}`}>{lastAdherence}%</span>
                <span className="text-[11px] text-ink-soft/50">observance</span>
              </div>

              <div className="w-40 shrink-0">
                {atRiskPatient ? (
                  <span className="inline-flex items-center gap-1.5 text-[11.5px] font-bold text-berry-500 bg-berry-100 px-2.5 py-1 rounded-full">
                    <AlertTriangle size={11} /> À surveiller
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-[11.5px] font-bold text-leaf-700 bg-leaf-100 px-2.5 py-1 rounded-full">Suivi stable</span>
                )}
              </div>

              <ChevronRight size={16} className="text-ink-soft/30 shrink-0" />
            </button>
          )
        })}
      </div>
    </div>
  )
}
