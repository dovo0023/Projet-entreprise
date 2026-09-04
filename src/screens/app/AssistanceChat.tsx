import { LifeBuoy, Send } from 'lucide-react'
import { useState } from 'react'
import { Card } from '../../components/ui'

interface Bubble {
  from: 'bot' | 'moi'
  text: string
}

interface FaqEntry {
  keywords: string[]
  answer: string
}

const FAQ: FaqEntry[] = [
  {
    keywords: ['menu', 'recette', 'régénér', 'regener'],
    answer:
      'Chaque semaine, l’app génère un menu adapté à vos objectifs et préférences (régime, allergies, budget…). Depuis Courses, chaque plat a un bouton pour le régénérer ; depuis Planning, vous pouvez le permuter avec le même créneau d’un autre jour.',
  },
  {
    keywords: ['rdv', 'rendez-vous', 'rendez vous', 'diététicien', 'dieteticien', 'praticien'],
    answer:
      'Direction l’onglet Accueil : la carte « Un accompagnement professionnel » liste les diététicien(ne)s près de chez vous, filtrables par spécialité, avec des créneaux à réserver en un clic.',
  },
  {
    keywords: ['foyer', 'famille', 'membre', 'couple'],
    answer:
      'L’onglet Foyer permet d’ajouter les autres personnes qui partagent vos repas (objectif, régime, allergies propres à chacune) — le menu s’adapte pour convenir à tout le monde à la fois.',
  },
  {
    keywords: ['journal', 'noter', 'j’ai mangé', 'jai mange', 'j ai mange', 'repas libre', 'réserve', 'reserve'],
    answer:
      'Dans Aujourd’hui, le bloc « Journal du jour » permet de noter ce que vous mangez en plus du menu prévu. Si un repas prévu ne vous convient plus (vous sortez, par ex.), marquez-le « libre » : il part dans une réserve et vous pouvez l’échanger avec un autre jour depuis Planning.',
  },
  {
    keywords: ['abonnement', 'plan', 'prix', 'starter', 'ultra', 'gratuit', 'pro'],
    answer:
      'Votre abonnement (Gratuit / Starter / Pro / Ultra) se gère depuis Profil. Chaque palier débloque davantage de fonctionnalités, comme la boucle adaptative automatique en Ultra.',
  },
  {
    keywords: ['allergie', 'régime', 'regime', 'préférence', 'preference', 'végétarien', 'vegetarien', 'végétalien'],
    answer:
      'Votre régime et vos allergies se règlent depuis Profil (ou la fiche « Vous » dans l’onglet Foyer). Toute modification régénère automatiquement le menu de la semaine.',
  },
  {
    keywords: ['courses', 'liste de courses', 'ingrédient', 'ingredient', 'magasin'],
    answer:
      'L’onglet Courses commence par vous demander quels jours et quels repas prévoir cette semaine, puis génère le menu et la liste de courses correspondante, avec un comparatif des magasins à proximité.',
  },
]

const FALLBACK = 'Je ne connais pas encore la réponse à cette question — essayez de reformuler, ou choisissez une suggestion ci-dessous.'

const SUGGESTIONS = ['Comment fonctionne le menu ?', 'Comment prendre RDV avec un(e) diététicien(ne) ?', 'Comment fonctionne le foyer ?', 'Comment noter ce que je mange ?']

function findAnswer(question: string): string {
  const q = question.toLowerCase()
  const match = FAQ.find((entry) => entry.keywords.some((k) => q.includes(k)))
  return match?.answer ?? FALLBACK
}

/** Chat d'assistance à l'utilisation de l'app (FAQ sur les fonctionnalités) — pas un coach nutrition : les
 *  réponses viennent d'une simple correspondance de mots-clés sur une petite base de questions connues,
 *  pas d'une vraie IA conversationnelle. */
export default function AssistanceChat() {
  const [bubbles, setBubbles] = useState<Bubble[]>([
    { from: 'bot', text: 'Bonjour 👋 Posez-moi une question sur l’utilisation de NutriFlow, ou choisissez une suggestion ci-dessous.' },
  ])
  const [input, setInput] = useState('')

  function ask(question: string) {
    if (!question.trim()) return
    setInput('')
    setBubbles((prev) => [...prev, { from: 'moi', text: question }, { from: 'bot', text: findAnswer(question) }])
  }

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-2xl bg-leaf-50 flex items-center justify-center shrink-0">
          <LifeBuoy size={16} className="text-leaf-600" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-ink text-[14px]">Assistance</p>
          <p className="text-[11.5px] text-ink-soft/60">Questions sur l’utilisation de l’app</p>
        </div>
      </div>

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

      <div className="flex flex-wrap gap-1.5">
        {SUGGESTIONS.map((s) => (
          <button key={s} onClick={() => ask(s)} className="tap px-3 py-1.5 rounded-full bg-black/5 text-[11.5px] font-semibold text-ink-soft">
            {s}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && ask(input)}
          placeholder="Votre question…"
          className="flex-1 min-w-0 rounded-2xl border border-black/10 px-3.5 py-2 text-[12.5px] outline-none focus:border-leaf-500"
        />
        <button onClick={() => ask(input)} className="tap w-9 h-9 rounded-full bg-ink text-cream flex items-center justify-center shrink-0" aria-label="Envoyer">
          <Send size={14} />
        </button>
      </div>
    </Card>
  )
}
