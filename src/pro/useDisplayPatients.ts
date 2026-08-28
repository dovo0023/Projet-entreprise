import { useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { PATIENTS } from '../data/patients'
import type { PatientSummary } from '../types'
import { usePro } from './ProContext'

/**
 * Superpose les données réelles du compte B2C (profil, cibles, consommation du jour, messages)
 * sur la fiche patiente de démonstration liée à l'app, et les éventuelles prescriptions ajustées
 * par le praticien pour les autres patients. Ne renvoie que les patients déjà ajoutés au
 * portefeuille du praticien (voir ProContext.addPatientByCode).
 */
export function useDisplayPatients(): PatientSummary[] {
  const { profile, targets, consumed, messages: liveMessages } = useApp()
  const { messagesByPatient, prescriptionOverrides, portfolioPatientIds } = usePro()

  return useMemo(
    () =>
      PATIENTS.filter((p) => portfolioPatientIds.includes(p.id)).map((p) => {
        if (p.linkedToApp) {
          return {
            ...p,
            name: `${profile.firstName} Delvaux`,
            goal: profile.goal,
            allergens: profile.allergens,
            targets,
            actualToday: consumed,
            messages: liveMessages,
          }
        }
        const messages = messagesByPatient[p.id] ?? p.messages
        const override = prescriptionOverrides[p.id]
        return override ? { ...p, goal: override.goal, allergens: override.allergens, messages } : { ...p, messages }
      }),
    [profile, targets, consumed, liveMessages, messagesByPatient, prescriptionOverrides, portfolioPatientIds],
  )
}
