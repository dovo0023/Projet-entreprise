import { Check, MapPin, ShoppingCart, Sparkles } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useApp } from '../../context/AppContext'
import { Button, Card, SectionTitle } from '../../components/ui'

export default function ShoppingScreen() {
  const { shoppingList, toggleShoppingItem, sentToDrive, sendToDrive } = useApp()
  const [store] = useState('Carrefour Market — Ixelles')

  const grouped = useMemo(() => {
    const map = new Map<string, typeof shoppingList>()
    for (const item of shoppingList) {
      const arr = map.get(item.category) ?? []
      arr.push(item)
      map.set(item.category, arr)
    }
    return Array.from(map.entries())
  }, [shoppingList])

  const checkedCount = shoppingList.filter((i) => i.checked).length
  const estTotal = (shoppingList.length * 2.35).toFixed(2)

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar">
      <div className="px-5 pt-5 pb-2">
        <h1 className="text-xl font-extrabold text-ink">Courses & logistique</h1>
        <p className="text-[13px] text-ink-soft">Liste consolidée, sans gaspillage ni oubli.</p>
      </div>

      <div className="px-5 mt-3">
        <Card className="flex items-center gap-3 !bg-leaf-50 border border-leaf-100">
          <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shrink-0">
            <MapPin size={16} className="text-leaf-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold text-leaf-700/70 uppercase">Point de retrait</p>
            <p className="text-[13.5px] font-bold text-ink truncate">{store}</p>
          </div>
          <button className="text-[12px] font-bold text-leaf-600 shrink-0">Changer</button>
        </Card>
      </div>

      <div className="px-5 mt-4 flex items-center justify-between">
        <SectionTitle action={<span className="text-[12px] font-bold text-ink-soft/60">{checkedCount}/{shoppingList.length}</span>}>
          Panier consolidé
        </SectionTitle>
      </div>

      <div className="px-5 flex flex-col gap-5 pb-4">
        {grouped.map(([category, items]) => (
          <div key={category}>
            <p className="text-[11.5px] font-bold text-ink-soft/50 uppercase tracking-wide mb-2">{category}</p>
            <div className="flex flex-col gap-2">
              {items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => toggleShoppingItem(item.id)}
                  className="tap w-full flex items-center gap-3 bg-white rounded-2xl px-3.5 py-3 border border-black/5"
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                      item.checked ? 'bg-leaf-500' : 'border-2 border-black/15'
                    }`}
                  >
                    {item.checked && <Check size={12} className="text-white" />}
                  </span>
                  <span className={`flex-1 text-left text-[14px] ${item.checked ? 'line-through text-ink-soft/40' : 'text-ink'}`}>
                    {item.name}
                  </span>
                  <span className="text-[12px] text-ink-soft/50">{item.quantity}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="px-5 pb-8">
        <Card className="!bg-ink text-cream">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[11px] font-bold text-cream/50 uppercase">Estimation panier</p>
              <p className="text-2xl font-extrabold">{estTotal} €</p>
            </div>
            <Sparkles size={22} className="text-clementine-400" />
          </div>
          <p className="text-[12px] text-cream/60 mb-4">
            Quantités ajustées automatiquement au Mode Duo et regroupées pour éviter le gaspillage.
          </p>
          {sentToDrive ? (
            <div className="flex items-center justify-center gap-2 bg-leaf-500/20 text-leaf-200 rounded-2xl py-3.5 font-bold text-[14px]">
              <Check size={16} /> Envoyé vers le Drive
            </div>
          ) : (
            <Button full variant="primary" onClick={sendToDrive}>
              <ShoppingCart size={16} /> Envoyer vers le Drive
            </Button>
          )}
        </Card>
      </div>
    </div>
  )
}
