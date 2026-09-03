import type { PractitionerListing } from '../types'

// Annuaire de démonstration : diététiciens fictifs "près de chez moi", triés par distance côté écran.
// Pas de vraie géolocalisation ni de vrai calendrier de disponibilités en direct derrière.
export const PRACTITIONERS: PractitionerListing[] = [
  {
    id: 'elise-marchand',
    name: 'Dr. Elise Marchand',
    photo: '👩‍⚕️',
    specialty: 'Nutrition générale & perte de poids',
    city: 'Bruxelles',
    distanceKm: 0.8,
    rating: 4.9,
    reviewCount: 128,
    slots: [
      { id: 'em-1', dayLabel: 'Mar 2 sept', time: '09:30' },
      { id: 'em-2', dayLabel: 'Mar 2 sept', time: '14:00' },
      { id: 'em-3', dayLabel: 'Jeu 4 sept', time: '11:00' },
    ],
  },
  {
    id: 'julien-vasseur',
    name: 'Julien Vasseur',
    photo: '🧑‍⚕️',
    specialty: 'Nutrition sportive',
    city: 'Bruxelles',
    distanceKm: 1.4,
    rating: 4.7,
    reviewCount: 64,
    slots: [
      { id: 'jv-1', dayLabel: 'Lun 1 sept', time: '18:30' },
      { id: 'jv-2', dayLabel: 'Mer 3 sept', time: '17:00' },
    ],
  },
  {
    id: 'aline-dupont',
    name: 'Aline Dupont',
    photo: '👩‍⚕️',
    specialty: 'Troubles du comportement alimentaire',
    city: 'Ixelles',
    distanceKm: 2.1,
    rating: 5.0,
    reviewCount: 41,
    slots: [
      { id: 'ad-1', dayLabel: 'Mer 3 sept', time: '10:00' },
      { id: 'ad-2', dayLabel: 'Ven 5 sept', time: '09:00' },
      { id: 'ad-3', dayLabel: 'Ven 5 sept', time: '15:30' },
    ],
  },
  {
    id: 'marc-lefevre',
    name: 'Marc Lefèvre',
    photo: '🧑‍⚕️',
    specialty: 'Diabète & maladies métaboliques',
    city: 'Etterbeek',
    distanceKm: 3.6,
    rating: 4.6,
    reviewCount: 89,
    slots: [
      { id: 'ml-1', dayLabel: 'Jeu 4 sept', time: '08:30' },
      { id: 'ml-2', dayLabel: 'Ven 5 sept', time: '13:00' },
    ],
  },
  {
    id: 'sarah-benali',
    name: 'Sarah Benali',
    photo: '👩‍⚕️',
    specialty: 'Nutrition pédiatrique',
    city: 'Schaerbeek',
    distanceKm: 4.2,
    rating: 4.8,
    reviewCount: 52,
    slots: [
      { id: 'sb-1', dayLabel: 'Lun 1 sept', time: '16:00' },
      { id: 'sb-2', dayLabel: 'Mar 2 sept', time: '10:30' },
    ],
  },
  {
    id: 'thibault-roche',
    name: 'Thibault Roche',
    photo: '🧑‍⚕️',
    specialty: 'Nutrition post-opératoire (chirurgie bariatrique)',
    city: 'Uccle',
    distanceKm: 6.0,
    rating: 4.9,
    reviewCount: 33,
    slots: [
      { id: 'tr-1', dayLabel: 'Mer 3 sept', time: '09:00' },
      { id: 'tr-2', dayLabel: 'Jeu 4 sept', time: '15:00' },
    ],
  },
]

export const PRACTITIONER_SPECIALTIES = [
  'Toutes',
  'Nutrition générale & perte de poids',
  'Nutrition sportive',
  'Troubles du comportement alimentaire',
  'Diabète & maladies métaboliques',
  'Nutrition pédiatrique',
  'Nutrition post-opératoire (chirurgie bariatrique)',
]
