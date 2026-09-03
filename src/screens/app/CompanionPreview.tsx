import { Bot, Send } from 'lucide-react'
import { useState } from 'react'
import { Card } from '../../components/ui'

interface Bubble {
  from: 'ia' | 'moi'
  text: string
}

const SEED_BUBBLES: Bubble[] = [
  { from: 'moi', text: 'J’ai mangé une pizza ce midi' },
  { from: 'ia', text: 'Noté dans votre journal ! Je vous propose un dîner plus léger ce soir pour équilibrer 🥗' },
]

const COMING_SOON_REPLY =
  '🚧 Cette conversation est une démo du concept — le compagnon IA (journal parlé, suggestions de repas, prise de RDV) arrive dans une prochaine version.'

/** Aperçu du futur "compagnon IA" de l'onglet Accueil : sert à expliquer le concept (journal alimentaire au
 *  fil de la conversation, suggestions de repas, prise de RDV) pendant une présentation — les réponses sont
 *  scriptées, il n'y a pas encore de vraie IA conversationnelle branchée. */
export default function CompanionPreview() {
  const [bubbles, setBubbles] = useState<Bubble[]>(SEED_BUBBLES)
  const [input, setInput] = useState('')

  function send() {
    if (!input.trim()) return
    const mine = input.trim()
    setInput('')
    setBubbles((prev) => [...prev, { from: 'moi', text: mine }, { from: 'ia', text: COMING_SOON_REPLY }])
  }

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-2xl bg-leaf-50 flex items-center justify-center shrink-0">
          <Bot size={16} className="text-leaf-600" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-ink text-[14px]">Compagnon IA</p>
          <p className="text-[11.5px] text-ink-soft/60">Aperçu du concept — fonctionnalité à venir</p>
        </div>
        <span className="shrink-0 px-2.5 py-1 rounded-full bg-clementine-100 text-clementine-500 text-[10.5px] font-bold">Bientôt</span>
      </div>

      <p className="text-[12.5px] text-ink-soft">
        Vous pourrez bientôt lui dire simplement ce que vous mangez, lui demander des idées de repas ou prendre
        rendez-vous avec un(e) diététicien(ne) — tout en discutant, comme ici :
      </p>

      <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
        {bubbles.map((b, i) => (
          <div key={i} className={`flex ${b.from === 'moi' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-[12.5px] ${
                b.from === 'moi' ? 'bg-ink text-cream' : 'bg-leaf-50 text-ink'
              }`}
            >
              {b.text}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="Ex. j’ai mangé un sandwich…"
          className="flex-1 min-w-0 rounded-2xl border border-black/10 px-3.5 py-2 text-[12.5px] outline-none focus:border-leaf-500"
        />
        <button onClick={send} className="tap w-9 h-9 rounded-full bg-ink text-cream flex items-center justify-center shrink-0" aria-label="Envoyer">
          <Send size={14} />
        </button>
      </div>
    </Card>
  )
}
