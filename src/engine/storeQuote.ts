import { STORES } from '../data/stores'
import type { ShoppingItem, Store } from '../types'

const AVERAGE_PRICE_PER_ITEM = 2.6

export interface StoreQuote {
  store: Store
  total: number
  itemCount: number
  recommended: boolean
}

/** Estime le prix du panier restant (hors articles déjà possédés) dans chaque magasin proche. */
export function quoteStores(neededItems: ShoppingItem[], stores: Store[] = STORES): StoreQuote[] {
  const baseTotal = neededItems.length * AVERAGE_PRICE_PER_ITEM

  const quotes = stores.map((store) => ({
    store,
    total: Math.round(baseTotal * store.priceMultiplier * 100) / 100,
    itemCount: neededItems.length,
  }))

  // La recommandation pondère le prix et la distance : un magasin un peu plus cher mais tout proche
  // peut valoir mieux qu'un magasin moins cher mais loin.
  const best = quotes.reduce((min, q) => (q.total + q.store.distanceKm * 1.5 < min.total + min.store.distanceKm * 1.5 ? q : min), quotes[0])

  return quotes.map((q) => ({ ...q, recommended: q.store.id === best?.store.id })).sort((a, b) => a.total - b.total)
}
