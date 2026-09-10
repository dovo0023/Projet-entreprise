import { Wallet } from 'lucide-react'
import { useApp } from '../../../context/AppContext'

/** Réglage "Budget hebdomadaire", partagé entre l'assistant Courses et le panneau Préférences. */
export default function BudgetField() {
  const { constraints, setConstraints } = useApp()
  const budgetActive = constraints.weeklyBudget != null

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Wallet size={15} className="text-leaf-600" />
          <p className="text-[13px] font-bold text-ink uppercase tracking-wide">Budget</p>
        </div>
        <button
          onClick={() => setConstraints({ weeklyBudget: budgetActive ? null : 50 })}
          className={`tap px-3.5 py-1.5 rounded-full text-[12px] font-bold ${budgetActive ? 'bg-leaf-500 text-white' : 'bg-black/5 text-ink-soft'}`}
        >
          {budgetActive ? 'Maîtrisé' : 'Libre'}
        </button>
      </div>
      {budgetActive && (
        <div className="fade-up">
          <div className="flex justify-between text-[12px] mb-1.5">
            <span className="font-semibold text-ink-soft">Budget hebdomadaire max</span>
            <span className="font-extrabold text-ink">{constraints.weeklyBudget} €</span>
          </div>
          <input
            type="range"
            min={25}
            max={90}
            step={5}
            value={constraints.weeklyBudget ?? 50}
            onChange={(e) => setConstraints({ weeklyBudget: Number(e.target.value) })}
            className="w-full accent-leaf-500"
          />
        </div>
      )}
    </section>
  )
}
