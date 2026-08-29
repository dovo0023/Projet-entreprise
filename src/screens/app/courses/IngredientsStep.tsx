import { Check, ChevronLeft, Home } from 'lucide-react'
import { useMemo } from 'react'
import { useApp } from '../../../context/AppContext'
import { Button } from '../../../components/ui'

export default function IngredientsStep() {
  const { shoppingList, toggleHaveAtHome, setCourseStep } = useApp()

  const grouped = useMemo(() => {
    const map = new Map<string, typeof shoppingList>()
    for (const item of shoppingList) {
      const arr = map.get(item.category) ?? []
      arr.push(item)
      map.set(item.category, arr)
    }
    return Array.from(map.entries())
  }, [shoppingList])

  const remaining = shoppingList.filter((i) => !i.haveAtHome).length

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="px-5 pt-5 pb-3 shrink-0">
        <button onClick={() => setCourseStep('menu')} className="tap flex items-center gap-1 text-[12.5px] font-bold text-ink-soft/60 mb-2">
          <ChevronLeft size={14} /> Retour au menu
        </button>
        <h1 className="text-xl font-extrabold text-ink">Détail du panier</h1>
        <p className="text-[13px] text-ink-soft mt-1">Cochez ce qui traîne dans vos placards : on l’enlève du panier.</p>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-4 flex flex-col gap-5">
        {grouped.map(([category, items]) => (
          <div key={category}>
            <p className="text-[11.5px] font-bold text-ink-soft/50 uppercase tracking-wide mb-2">{category}</p>
            <div className="flex flex-col gap-2">
              {items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => toggleHaveAtHome(item.id)}
                  className="tap w-full flex items-center gap-3 bg-white rounded-2xl px-3.5 py-3 border border-black/5"
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                      item.haveAtHome ? 'bg-leaf-500' : 'border-2 border-black/15'
                    }`}
                  >
                    {item.haveAtHome && <Home size={11} className="text-white" />}
                  </span>
                  <span className={`flex-1 text-left text-[14px] ${item.haveAtHome ? 'line-through text-ink-soft/40' : 'text-ink'}`}>{item.name}</span>
                  <span className="text-[12px] text-ink-soft/50">{item.quantity}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="px-5 pb-[calc(env(safe-area-inset-bottom)+16px)] pt-2 shrink-0 border-t border-black/5">
        <Button full onClick={() => setCourseStep('store')}>
          <Check size={16} /> Voir les magasins ({remaining} article{remaining !== 1 ? 's' : ''})
        </Button>
      </div>
    </div>
  )
}
