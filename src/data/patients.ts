import type { PatientSummary } from '../types'
import { ADHERENCE_HISTORY, SELF_JOURNAL_ENTRIES, WEIGHT_HISTORY } from './mock'

// Le patient "Camille" est le compte B2C de démonstration : ses vraies données
// (profil, planning, observance) viennent du AppContext au moment de l'affichage.
// Les valeurs ci-dessous ne servent que de repli / valeur par défaut.
export const PATIENTS: PatientSummary[] = [
  {
    id: 'camille',
    name: 'Camille Delvaux',
    goal: 'seche',
    allergens: [],
    targets: { kcal: 1911, protein: 143, carbs: 191, fat: 64 },
    actualToday: { kcal: 1531, protein: 92, carbs: 140, fat: 47 },
    weightHistory: WEIGHT_HISTORY,
    adherenceHistory: ADHERENCE_HISTORY,
    journalEntries: SELF_JOURNAL_ENTRIES,
    lastCheckIn: 'Aujourd’hui',
    linkedToApp: true,
    riskFlags: [],
    messages: [
      { from: 'patient', text: 'Bonjour Dr Marchand, le menu de cette semaine me convient très bien !', time: 'Lun 09:14' },
      { from: 'praticien', text: 'Super Camille, continuez ainsi. On garde le cap sur -350 kcal/j.', time: 'Lun 10:02' },
    ],
  },
  {
    id: 'karim-haddad',
    name: 'Karim Haddad',
    goal: 'prise_de_masse',
    allergens: ['Fruits à coque'],
    targets: { kcal: 3050, protein: 190, carbs: 340, fat: 90 },
    actualToday: { kcal: 1680, protein: 95, carbs: 180, fat: 50 },
    weightHistory: [
      { date: '01/07', weight: 68.2 },
      { date: '08/07', weight: 68.6 },
      { date: '15/07', weight: 69.1 },
      { date: '22/07', weight: 69.3 },
      { date: '29/07', weight: 69.2 },
      { date: '05/08', weight: 69.4 },
      { date: '12/08', weight: 69.3 },
      { date: '19/08', weight: 69.5 },
      { date: '26/08', weight: 69.4 },
    ],
    adherenceHistory: [
      { date: 'S1', percent: 92 },
      { date: 'S2', percent: 88 },
      { date: 'S3', percent: 85 },
      { date: 'S4', percent: 80 },
      { date: 'S5', percent: 71 },
      { date: 'S6', percent: 64 },
      { date: 'S7', percent: 58 },
      { date: 'S8', percent: 55 },
    ],
    journalEntries: [
      { id: 'je-karim-1', day: 1, time: '13:15', slot: 'midi', description: 'Sandwich jambon-fromage à la boulangerie (pas eu le temps de cuisiner)', kcal: 480, protein: 22, carbs: 50, fat: 20 },
      { id: 'je-karim-2', day: 1, time: '20:30', slot: 'soir', description: 'Repas prévu sauté, seulement une barre de céréales', kcal: 210, protein: 7, carbs: 28, fat: 8 },
    ],
    lastCheckIn: 'Il y a 4 jours',
    linkedToApp: false,
    riskFlags: ['Observance en chute depuis 3 semaines (92%→55%)', 'Prise de masse en plateau malgré l’excédent calorique prescrit'],
    messages: [
      { from: 'praticien', text: 'Karim, je vois que la prise de poids stagne. On fait le point cette semaine ?', time: 'Jeu 08:30' },
    ],
  },
  {
    id: 'sophie-lambert',
    name: 'Sophie Lambert',
    goal: 'maintien',
    allergens: ['Lactose'],
    targets: { kcal: 1750, protein: 110, carbs: 165, fat: 58 },
    actualToday: { kcal: 900, protein: 48, carbs: 80, fat: 30 },
    weightHistory: [
      { date: '05/08', weight: 92.4 },
      { date: '12/08', weight: 92.0 },
      { date: '19/08', weight: 91.8 },
      { date: '26/08', weight: 91.7 },
    ],
    adherenceHistory: [
      { date: 'S1', percent: 74 },
      { date: 'S2', percent: 61 },
      { date: 'S3', percent: 52 },
      { date: 'S4', percent: 48 },
    ],
    journalEntries: [
      { id: 'je-sophie-1', day: 1, time: '12:30', slot: 'midi', description: 'Trois cuillères de purée, n’a pas pu finir', kcal: 90, protein: 5, carbs: 12, fat: 2 },
      { id: 'je-sophie-2', day: 1, time: '19:15', slot: 'soir', description: 'Bouillon + un peu de poisson émietté', kcal: 140, protein: 15, carbs: 6, fat: 5 },
    ],
    lastCheckIn: 'Il y a 2 jours',
    linkedToApp: false,
    riskFlags: [
      'Premier mois de suivi post-opératoire — période à plus fort taux d’abandon (~21% à 1 mois selon la littérature)',
      'Perte de poids initiale plus faible que la moyenne des patientes qui terminent le suivi',
    ],
    messages: [
      { from: 'patient', text: 'Je n’arrive pas à finir mes portions, j’ai peur de mal faire.', time: 'Mar 19:40' },
      { from: 'praticien', text: 'C’est normal après l’opération, on va réduire les portions ensemble. Je vous rappelle demain.', time: 'Mar 20:05' },
    ],
  },
  {
    id: 'youssef-amrani',
    name: 'Youssef Amrani',
    goal: 'seche',
    allergens: ['Poisson / Crustacés'],
    targets: { kcal: 2100, protein: 160, carbs: 190, fat: 62 },
    actualToday: { kcal: 1820, protein: 140, carbs: 165, fat: 54 },
    weightHistory: [
      { date: '01/07', weight: 84.1 },
      { date: '08/07', weight: 83.4 },
      { date: '15/07', weight: 82.9 },
      { date: '22/07', weight: 82.3 },
      { date: '29/07', weight: 81.8 },
      { date: '05/08', weight: 81.2 },
      { date: '12/08', weight: 80.7 },
      { date: '19/08', weight: 80.1 },
      { date: '26/08', weight: 79.6 },
    ],
    adherenceHistory: [
      { date: 'S1', percent: 90 },
      { date: 'S2', percent: 93 },
      { date: 'S3', percent: 91 },
      { date: 'S4', percent: 95 },
      { date: 'S5', percent: 96 },
      { date: 'S6', percent: 94 },
      { date: 'S7', percent: 97 },
      { date: 'S8', percent: 98 },
    ],
    journalEntries: [],
    lastCheckIn: 'Aujourd’hui',
    linkedToApp: false,
    riskFlags: [],
    messages: [{ from: 'praticien', text: 'Excellent travail Youssef, -4.5kg en 8 semaines, on maintient le cap.', time: 'Lun 07:50' }],
  },
  {
    id: 'elena-petrov',
    name: 'Elena Petrov',
    goal: 'prise_de_masse',
    allergens: [],
    targets: { kcal: 2600, protein: 150, carbs: 320, fat: 78 },
    actualToday: { kcal: 1400, protein: 70, carbs: 160, fat: 40 },
    weightHistory: [
      { date: '05/08', weight: 58.2 },
      { date: '12/08', weight: 58.3 },
      { date: '19/08', weight: 58.1 },
      { date: '26/08', weight: 58.4 },
    ],
    adherenceHistory: [
      { date: 'S1', percent: 68 },
      { date: 'S2', percent: 62 },
      { date: 'S3', percent: 59 },
      { date: 'S4', percent: 54 },
    ],
    journalEntries: [],
    lastCheckIn: 'Il y a 6 jours',
    linkedToApp: false,
    riskFlags: ['Budget courses non respecté 3 semaines sur 4', 'Aucun contact depuis plus de 5 jours'],
    messages: [{ from: 'praticien', text: 'Elena, je n’ai pas de nouvelles depuis un moment, tout va bien ?', time: 'Ven 11:15' }],
  },
  {
    id: 'thomas-dubois',
    name: 'Thomas Dubois',
    goal: 'maintien',
    allergens: [],
    targets: { kcal: 2050, protein: 120, carbs: 210, fat: 68 },
    actualToday: { kcal: 1980, protein: 115, carbs: 200, fat: 65 },
    weightHistory: [
      { date: '01/07', weight: 77.5 },
      { date: '08/07', weight: 77.4 },
      { date: '15/07', weight: 77.6 },
      { date: '22/07', weight: 77.3 },
      { date: '29/07', weight: 77.5 },
      { date: '05/08', weight: 77.4 },
      { date: '12/08', weight: 77.5 },
      { date: '19/08', weight: 77.6 },
      { date: '26/08', weight: 77.4 },
    ],
    adherenceHistory: [
      { date: 'S1', percent: 88 },
      { date: 'S2', percent: 90 },
      { date: 'S3', percent: 89 },
      { date: 'S4', percent: 91 },
      { date: 'S5', percent: 88 },
      { date: 'S6', percent: 90 },
      { date: 'S7', percent: 92 },
      { date: 'S8', percent: 90 },
    ],
    journalEntries: [],
    lastCheckIn: 'Il y a 1 jour',
    linkedToApp: false,
    riskFlags: [],
    messages: [],
  },
  {
    id: 'fatou-ndiaye',
    name: 'Fatou Ndiaye',
    goal: 'seche',
    allergens: ['Gluten', 'Lactose', 'Arachides'],
    targets: { kcal: 1650, protein: 118, carbs: 150, fat: 52 },
    actualToday: { kcal: 620, protein: 40, carbs: 55, fat: 20 },
    weightHistory: [
      { date: '19/08', weight: 74.8 },
      { date: '26/08', weight: 74.5 },
    ],
    adherenceHistory: [{ date: 'S1', percent: 80 }],
    journalEntries: [],
    lastCheckIn: 'Il y a 3 jours',
    linkedToApp: false,
    riskFlags: ['Nouvelle patiente (< 2 semaines) — allergies multiples à sécuriser sur chaque recette prescrite'],
    messages: [
      { from: 'patient', text: 'Bonjour, je découvre l’appli, merci pour l’accompagnement !', time: 'Mer 18:20' },
    ],
  },
]

export function computeAdherenceTrend(history: { percent: number }[]): 'hausse' | 'stable' | 'baisse' {
  if (history.length < 2) return 'stable'
  const recent = history.slice(-2)
  const before = history.slice(0, -2)
  const recentAvg = recent.reduce((s, h) => s + h.percent, 0) / recent.length
  const beforeAvg = before.length ? before.reduce((s, h) => s + h.percent, 0) / before.length : recentAvg
  if (recentAvg - beforeAvg > 5) return 'hausse'
  if (beforeAvg - recentAvg > 5) return 'baisse'
  return 'stable'
}
