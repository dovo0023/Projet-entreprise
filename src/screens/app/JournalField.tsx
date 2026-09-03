import { Book, Plus, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { Button, Card } from '../../components/ui'
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

/** Journal alimentaire (ajout + liste + suppression) d'une personne pour un jour donné — utilisé pour la
 *  saisie rapide "Journal du jour" dans Aujourd'hui (soi-même), et pour les autres membres du foyer dans
 *  Foyer > Progression (Aujourd'hui ne couvrant que le profil principal). */
export default function JournalField({ personId, day, title, emptyText }: { personId: string; day: number; title: string; emptyText: string }) {
  const { personalRecords, addJournalEntry, removeJournalEntry } = useApp()
  const entries = (personalRecords[personId]?.journalEntries ?? []).filter((e) => e.day === day)
  const [open, setOpen] = useState(false)
  const [desc, setDesc] = useState('')
  const [slot, setSlot] = useState<JournalSlot>('encas')
  const [time, setTime] = useState('')
  const [kcal, setKcal] = useState('')

  function reset() {
    setDesc('')
    setSlot('encas')
    setTime('')
    setKcal('')
    setOpen(false)
  }

  function submit() {
    if (!desc.trim()) return
    const kcalNum = kcal.trim() ? Number(kcal) : null
    addJournalEntry(personId, {
      day,
      time: time.trim(),
      slot,
      description: desc.trim(),
      kcal: Number.isFinite(kcalNum) ? kcalNum : null,
      protein: null,
      carbs: null,
      fat: null,
    })
    reset()
  }

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Book size={15} className="text-leaf-600" />
        <p className="text-[13px] font-bold text-ink">{title}</p>
      </div>
      {entries.length === 0 && !open && <p className="text-[12.5px] text-ink-soft/50 italic">{emptyText}</p>}
      {entries.length > 0 && (
        <div className="flex flex-col gap-2">
          {entries.map((e) => (
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
                onClick={() => removeJournalEntry(personId, e.id)}
                className="tap w-7 h-7 rounded-full bg-white flex items-center justify-center shrink-0 text-ink-soft/50"
                aria-label="Supprimer cette note"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {open ? (
        <div className="fade-up flex flex-col gap-2.5 pt-3 border-t border-black/5">
          <input
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Ex. Part de gâteau au bureau"
            className="rounded-2xl border border-black/10 px-3.5 py-2.5 text-[13px] outline-none focus:border-leaf-500"
          />
          <div className="flex flex-wrap gap-1.5">
            {JOURNAL_SLOT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSlot(opt.value)}
                className={`tap px-3 py-1.5 rounded-full text-[12px] font-bold border ${
                  slot === opt.value ? 'bg-ink text-cream border-ink' : 'bg-white text-ink-soft border-black/10'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={time}
              onChange={(e) => setTime(e.target.value)}
              placeholder="Heure (ex. 16:00)"
              className="flex-1 rounded-2xl border border-black/10 px-3.5 py-2 text-[13px] outline-none focus:border-leaf-500"
            />
            <input
              type="number"
              value={kcal}
              onChange={(e) => setKcal(e.target.value)}
              placeholder="kcal (facultatif)"
              className="flex-1 rounded-2xl border border-black/10 px-3.5 py-2 text-[13px] outline-none focus:border-leaf-500"
            />
          </div>
          <div className="flex gap-2 mt-1">
            <Button variant="ghost" className="flex-1 !py-2.5" onClick={reset}>
              <X size={14} /> Annuler
            </Button>
            <Button className="flex-1 !py-2.5" disabled={!desc.trim()} onClick={submit}>
              Ajouter
            </Button>
          </div>
        </div>
      ) : (
        <Button variant="secondary" full onClick={() => setOpen(true)}>
          <Plus size={15} /> Ajouter un aliment
        </Button>
      )}
    </Card>
  )
}
