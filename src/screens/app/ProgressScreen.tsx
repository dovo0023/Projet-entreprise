import { ArrowUpRight, Copy, MessageCircle, Scale, TrendingDown } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Area, AreaChart, Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ADHERENCE_HISTORY, WEIGHT_HISTORY } from '../../data/mock'
import { Button, Card, SectionTitle } from '../../components/ui'

export default function ProgressScreen() {
  const navigate = useNavigate()
  const [weightInput, setWeightInput] = useState('')
  const [logged, setLogged] = useState(false)
  const lastWeight = WEIGHT_HISTORY[WEIGHT_HISTORY.length - 1].weight
  const firstWeight = WEIGHT_HISTORY[0].weight
  const delta = (lastWeight - firstWeight).toFixed(1)

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar">
      <div className="px-5 pt-5 pb-2">
        <h1 className="text-xl font-extrabold text-ink">Progression & santé</h1>
        <p className="text-[13px] text-ink-soft">Votre pesée hebdomadaire recalibre le plan.</p>
      </div>

      <div className="px-5 mt-3">
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <Scale size={16} className="text-leaf-600" />
            <p className="text-[13px] font-bold text-ink">Pesée du dimanche</p>
          </div>
          {logged ? (
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
                placeholder={`${lastWeight}`}
                className="flex-1 rounded-2xl border border-black/10 px-4 py-3 text-[15px] outline-none focus:border-leaf-500"
              />
              <Button onClick={() => weightInput && setLogged(true)} className="!px-5">
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
            <TrendingDown size={16} className="text-leaf-600" />
            <span className="text-[20px] font-extrabold text-ink">{delta} kg</span>
            <span className="text-[12px] text-ink-soft/60">depuis le 1er juillet</span>
          </div>
          <div className="h-36 -ml-4 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={WEIGHT_HISTORY} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
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
              <BarChart data={ADHERENCE_HISTORY} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#4b5563' }} axisLine={false} tickLine={false} />
                <YAxis hide domain={[0, 100]} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #eee', fontSize: 12 }} formatter={(v) => [`${v}%`, 'Observance']} />
                <Bar dataKey="percent" radius={[6, 6, 0, 0]} fill="#f7822a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
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
            <button className="tap w-9 h-9 rounded-full bg-black/5 flex items-center justify-center">
              <MessageCircle size={16} className="text-ink-soft" />
            </button>
          </div>
          <div className="flex items-center justify-between bg-black/[0.03] rounded-2xl px-4 py-3">
            <div>
              <p className="text-[11px] font-bold text-ink-soft/50 uppercase">Code de partage</p>
              <p className="font-mono font-bold text-ink text-[14px] tracking-wider">NF-72K9</p>
            </div>
            <button className="tap w-8 h-8 rounded-full bg-white flex items-center justify-center">
              <Copy size={13} className="text-ink-soft" />
            </button>
          </div>
        </Card>

        <button
          onClick={() => navigate('/pro/login')}
          className="tap w-full flex items-center justify-center gap-1.5 mt-3 py-2 text-[12.5px] font-bold text-ink-soft/60"
        >
          Découvrir l’espace praticien (démo) <ArrowUpRight size={13} />
        </button>
      </div>
    </div>
  )
}
