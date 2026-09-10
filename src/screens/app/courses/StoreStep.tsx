import { Check, ChevronLeft, MapPin, Package, Sparkles, Truck } from 'lucide-react'
import { useState } from 'react'
import { useApp } from '../../../context/AppContext'
import { STORES } from '../../../data/stores'
import { Button, Card } from '../../../components/ui'
import type { DeliveryMode } from '../../../types'

const MODE_LABEL: Record<DeliveryMode, string> = {
  click_collect: 'Click & Collect',
  click_collect_delivery: 'Click & Collect + Livraison',
}

export default function StoreStep() {
  const { storeQuotes, setCourseStep, placeOrder, orderPlaced, chosenStoreId, chosenDeliveryMode, resetOrder } = useApp()
  const [expandedStoreId, setExpandedStoreId] = useState<string | null>(null)

  if (orderPlaced) {
    const store = STORES.find((s) => s.id === chosenStoreId)
    const quote = storeQuotes.find((q) => q.store.id === chosenStoreId)
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-7 text-center">
        <div className="w-16 h-16 rounded-full bg-leaf-100 flex items-center justify-center mb-5">
          <Check size={28} className="text-leaf-600" />
        </div>
        <h1 className="text-xl font-extrabold text-ink">Commande validée et payée !</h1>
        <p className="text-[13.5px] text-ink-soft mt-2 max-w-[260px]">
          {chosenDeliveryMode === 'click_collect_delivery' ? 'Livraison' : 'Retrait'} chez <strong>{store?.name}</strong>
          {quote ? ` · ${quote.total.toFixed(2)} € payés` : ''}.
        </p>
        <Button variant="ghost" className="mt-6" onClick={resetOrder}>
          Modifier ma commande
        </Button>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="px-5 pt-5 pb-3 shrink-0">
        <button onClick={() => setCourseStep('menu')} className="tap flex items-center gap-1 text-[12.5px] font-bold text-ink-soft/60 mb-2">
          <ChevronLeft size={14} /> Retour au menu
        </button>
        <h1 className="text-xl font-extrabold text-ink">Où faire vos courses ?</h1>
        <p className="text-[13px] text-ink-soft mt-1">Prix estimés pour ce qu’il vous reste à acheter.</p>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-8 flex flex-col gap-3">
        {storeQuotes.map((quote) => {
          const expanded = expandedStoreId === quote.store.id
          return (
            <Card key={quote.store.id} className={`!p-4 ${quote.recommended ? '!border-2 !border-leaf-500' : ''}`}>
              <button className="w-full text-left" onClick={() => setExpandedStoreId(expanded ? null : quote.store.id)}>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-leaf-50 flex items-center justify-center text-xl shrink-0">{quote.store.logo}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="font-bold text-ink text-[14px] truncate">{quote.store.name}</p>
                      {quote.recommended && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-leaf-700 bg-leaf-100 px-2 py-0.5 rounded-full shrink-0">
                          <Sparkles size={9} /> Recommandé
                        </span>
                      )}
                    </div>
                    <p className="text-[12px] text-ink-soft/60 flex items-center gap-1 mt-0.5">
                      <MapPin size={11} /> {quote.store.distanceKm} km
                    </p>
                  </div>
                  <p className="text-[17px] font-extrabold text-ink shrink-0">{quote.total.toFixed(2)} €</p>
                </div>
                <div className="flex gap-1.5 mt-2.5 flex-wrap">
                  {quote.store.deliveryModes.map((mode) => (
                    <span key={mode} className="flex items-center gap-1 text-[10.5px] font-bold text-ink-soft bg-black/5 px-2 py-1 rounded-full">
                      {mode === 'click_collect_delivery' ? <Truck size={10} /> : <Package size={10} />} {MODE_LABEL[mode]}
                    </span>
                  ))}
                </div>
              </button>

              {expanded && (
                <div className="flex gap-2 mt-3 pt-3 border-t border-black/5 fade-up">
                  <Button variant="secondary" className="flex-1 !py-2.5 text-[13px]" onClick={() => placeOrder(quote.store.id, 'click_collect')}>
                    <Package size={14} /> Retrait en magasin
                  </Button>
                  {quote.store.deliveryModes.includes('click_collect_delivery') && (
                    <Button className="flex-1 !py-2.5 text-[13px]" onClick={() => placeOrder(quote.store.id, 'click_collect_delivery')}>
                      <Truck size={14} /> Livraison
                    </Button>
                  )}
                </div>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
