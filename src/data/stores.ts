import type { Store } from '../types'

export const STORES: Store[] = [
  { id: 'carrefour', name: 'Carrefour Market — Ixelles', distanceKm: 0.6, logo: '🛒', priceMultiplier: 1, deliveryModes: ['click_collect', 'click_collect_delivery'] },
  { id: 'delhaize', name: 'Delhaize — Flagey', distanceKm: 1.1, logo: '🛍️', priceMultiplier: 1.08, deliveryModes: ['click_collect', 'click_collect_delivery'] },
  { id: 'colruyt', name: 'Colruyt — Etterbeek', distanceKm: 2.3, logo: '🧺', priceMultiplier: 0.9, deliveryModes: ['click_collect'] },
  { id: 'okay', name: 'OKay — Ixelles', distanceKm: 0.9, logo: '🏪', priceMultiplier: 0.97, deliveryModes: ['click_collect'] },
]
