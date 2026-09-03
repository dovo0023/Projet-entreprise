import { ArrowLeftRight, Camera, Check, Loader2, Trash2, UtensilsCrossed } from 'lucide-react'
import { useRef, useState, type ChangeEvent } from 'react'
import { SELF_RECORD_ID, useApp } from '../../context/AppContext'
import { Card } from '../../components/ui'
import { WEEK_DAYS } from '../../data/mock'
import type { PlannableSlot } from '../../types'

const SLOT_LABEL: Record<PlannableSlot, string> = { 'petit-dejeuner': 'Matin', midi: 'Midi', soir: 'Soir' }

/** Reconnaissance photo simulée (démo) : aucune vraie IA de vision n'est appelée, l'app propose juste un
 *  plat plausible que la personne peut corriger avant d'enregistrer — même principe que le reste du moteur
 *  "IA" de l'app, déterministe et transparent plutôt qu'un vrai modèle. */
const MOCK_PHOTO_GUESSES: Record<PlannableSlot, string[]> = {
  'petit-dejeuner': ['Tartines avocat-œuf', 'Porridge fruits rouges', 'Yaourt granola', 'Pancakes banane'],
  midi: ['Salade César au poulet', 'Poke bowl saumon avocat', 'Wrap crudités et houmous', 'Riz cantonais maison'],
  soir: ['Pâtes bolognaise', 'Pizza margherita', 'Curry de légumes et riz', 'Soupe miso et gyozas'],
}

/** Emplacement d'un repas matin/midi/soir marqué "libre" (pas de recette prévue par l'app) : la personne
 *  note elle-même ce qu'elle mange, à la main ou via une photo (reconnaissance simulée), dans son journal.
 *  Pour redevenir "prévu", on échange avec un autre jour qui a réellement un repas acheté — pas un simple
 *  retour en arrière, qui ferait apparaître une recette jamais incluse dans la liste de courses. */
export default function FreeMealCard({ day, slot }: { day: number; slot: PlannableSlot }) {
  const { personalRecords, addJournalEntry, removeJournalEntry, mealNeeds, weekPlan, swapFreeMealWithDay } = useApp()
  const entries = (personalRecords[SELF_RECORD_ID]?.journalEntries ?? []).filter((e) => e.day === day && e.slot === slot)
  const [description, setDescription] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [swapOpen, setSwapOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const needKey = slot === 'petit-dejeuner' ? 'matin' : slot
  const candidateDays = Array.from({ length: 7 }, (_, i) => i + 1).filter((d) => d !== day && (mealNeeds[d]?.[needKey] ?? true))

  function mealNameFor(otherDay: number) {
    return weekPlan.find((m) => m.day === otherDay && m.slot === slot)?.name ?? ''
  }

  function save() {
    if (!description.trim()) return
    addJournalEntry(SELF_RECORD_ID, { day, time: '', slot, description: description.trim(), kcal: null, protein: null, carbs: null, fat: null })
    setDescription('')
  }

  function handlePhoto(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setAnalyzing(true)
    setTimeout(() => {
      const pool = MOCK_PHOTO_GUESSES[slot]
      setDescription(`${pool[day % pool.length]} (détecté par IA — démo)`)
      setAnalyzing(false)
    }, 700)
  }

  return (
    <Card className="!p-3 border-2 border-dashed border-black/10 bg-black/[0.015]">
      <div className="flex items-start gap-2 mb-2.5">
        <div className="w-9 h-9 rounded-xl bg-black/5 flex items-center justify-center shrink-0">
          <UtensilsCrossed size={15} className="text-ink-soft/50" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10.5px] font-bold text-ink-soft/60 uppercase tracking-wide">{SLOT_LABEL[slot]} · Repas libre</p>
          <p className="text-[12px] text-ink-soft/70">Pas de plat prévu par l’app — notez ce que vous mangez.</p>
        </div>
        <button
          onClick={() => setSwapOpen((o) => !o)}
          className="tap shrink-0 flex items-center gap-1 text-[11px] font-bold text-leaf-600"
        >
          <ArrowLeftRight size={11} /> Échanger
        </button>
      </div>

      {swapOpen && (
        <div className="mb-2.5 flex flex-col gap-1.5">
          <p className="text-[11px] font-bold text-ink-soft/60 uppercase">Échanger avec un jour prévu</p>
          {candidateDays.length === 0 ? (
            <p className="text-[12px] text-ink-soft/50 italic">Aucun autre repas prévu à échanger cette semaine.</p>
          ) : (
            candidateDays.map((d) => (
              <button
                key={d}
                onClick={() => {
                  swapFreeMealWithDay(day, slot, d)
                  setSwapOpen(false)
                }}
                className="tap flex items-center gap-2.5 bg-white rounded-xl px-3 py-2 text-left"
              >
                <span className="text-[11px] font-bold text-ink-soft/60 w-16 shrink-0">{WEEK_DAYS[d - 1]}</span>
                <span className="flex-1 min-w-0 text-[12.5px] font-semibold text-ink truncate">{mealNameFor(d)}</span>
              </button>
            ))
          )}
        </div>
      )}

      {entries.length > 0 && (
        <div className="flex flex-col gap-1.5 mb-2.5">
          {entries.map((entry) => (
            <div key={entry.id} className="flex items-center justify-between gap-2 bg-white rounded-xl px-3 py-2">
              <span className="text-[12.5px] font-semibold text-ink truncate">{entry.description}</span>
              <button onClick={() => removeJournalEntry(SELF_RECORD_ID, entry.id)} className="tap shrink-0 text-ink-soft/40" aria-label="Supprimer">
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-1.5">
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && save()}
          placeholder="Ex. salade composée…"
          className="flex-1 min-w-0 rounded-xl border border-black/10 bg-white px-3 py-2 text-[12.5px] outline-none focus:border-leaf-500"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={analyzing}
          className="tap w-9 h-9 rounded-xl bg-white border border-black/10 flex items-center justify-center shrink-0 disabled:opacity-50"
          aria-label="Prendre en photo"
          title="Prendre en photo (reconnaissance IA — démo)"
        >
          {analyzing ? <Loader2 size={14} className="animate-spin text-ink-soft/50" /> : <Camera size={14} className="text-ink-soft/60" />}
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handlePhoto} className="hidden" />
        <button
          onClick={save}
          disabled={!description.trim()}
          className="tap w-9 h-9 rounded-xl bg-leaf-500 text-white flex items-center justify-center shrink-0 disabled:opacity-30"
          aria-label="Enregistrer"
        >
          <Check size={14} />
        </button>
      </div>
    </Card>
  )
}
