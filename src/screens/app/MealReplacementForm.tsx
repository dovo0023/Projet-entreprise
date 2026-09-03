import { Camera, Loader2, X } from 'lucide-react'
import { useRef, useState, type ChangeEvent } from 'react'
import { useApp } from '../../context/AppContext'
import { Button } from '../../components/ui'
import type { Meal } from '../../types'

/** Reconnaissance photo simulée (démo) : aucune vraie IA de vision n'est appelée, l'estimation calorique
 *  est un plat plausible tiré d'un petit pool par créneau — même principe que le reste du moteur "IA" de
 *  l'app, déterministe et transparent plutôt qu'un vrai modèle. */
const MOCK_PHOTO_GUESSES: Record<Meal['slot'], { name: string; kcal: number }[]> = {
  'petit-dejeuner': [
    { name: 'Croissant et jus d’orange', kcal: 340 },
    { name: 'Pain perdu et fruits', kcal: 410 },
  ],
  midi: [
    { name: 'Burger et frites', kcal: 820 },
    { name: 'Pizza margherita (2 parts)', kcal: 640 },
    { name: 'Sushi assortiment', kcal: 520 },
  ],
  soir: [
    { name: 'Pâtes carbonara', kcal: 690 },
    { name: 'Kebab', kcal: 780 },
    { name: 'Plat à emporter thaï', kcal: 610 },
  ],
  'encas-matin': [{ name: 'Viennoiserie', kcal: 250 }],
  'encas-apresmidi': [{ name: 'Barre chocolatée', kcal: 230 }],
}

/** Formulaire "j'ai mangé autre chose" pour un repas prévu non respecté : texte libre, ou photo avec
 *  estimation calorique simulée. Enregistrer met à jour le journal alimentaire et le total kcal du jour. */
export default function MealReplacementForm({ meal, onDone }: { meal: Meal; onDone: () => void }) {
  const { logMealReplacement } = useApp()
  const [description, setDescription] = useState('')
  const [kcal, setKcal] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handlePhoto(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setAnalyzing(true)
    setTimeout(() => {
      const pool = MOCK_PHOTO_GUESSES[meal.slot]
      const guess = pool[meal.day % pool.length]
      setDescription(`${guess.name} (détecté par IA — démo)`)
      setKcal(String(guess.kcal))
      setAnalyzing(false)
    }, 800)
  }

  function submit() {
    if (!description.trim()) return
    const kcalNum = kcal.trim() ? Number(kcal) : null
    logMealReplacement(meal, description.trim(), Number.isFinite(kcalNum) ? kcalNum : null)
    onDone()
  }

  return (
    <div className="mt-4 pt-4 border-t border-black/5 fade-up flex flex-col gap-2.5">
      <p className="text-[11px] font-bold text-ink-soft/60 uppercase">Vous avez mangé autre chose ?</p>
      <div className="flex gap-1.5">
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ex. pizza livrée"
          className="flex-1 min-w-0 rounded-2xl border border-black/10 px-3.5 py-2.5 text-[13px] outline-none focus:border-leaf-500"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={analyzing}
          className="tap w-10 h-10 rounded-2xl bg-black/5 flex items-center justify-center shrink-0 disabled:opacity-50"
          aria-label="Prendre en photo"
          title="Prendre en photo (estimation calorique IA — démo)"
        >
          {analyzing ? <Loader2 size={16} className="animate-spin text-ink-soft/50" /> : <Camera size={16} className="text-ink-soft/60" />}
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handlePhoto} className="hidden" />
      </div>
      <input
        type="number"
        value={kcal}
        onChange={(e) => setKcal(e.target.value)}
        placeholder="kcal estimé (facultatif)"
        className="rounded-2xl border border-black/10 px-3.5 py-2.5 text-[13px] outline-none focus:border-leaf-500"
      />
      <div className="flex gap-2 mt-1">
        <Button variant="ghost" className="flex-1 !py-2.5" onClick={onDone}>
          <X size={14} /> Annuler
        </Button>
        <Button className="flex-1 !py-2.5" disabled={!description.trim()} onClick={submit}>
          Enregistrer
        </Button>
      </div>
    </div>
  )
}
