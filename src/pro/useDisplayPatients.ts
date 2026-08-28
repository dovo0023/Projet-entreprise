import { useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { PATIENTS } from '../data/patients'
import type { PatientSummary } from '../types'
import { usePro } from './ProContext'

/**
 * Superpose les données réelles du compte B2C (profil, cibles, consommation du jour)
 * sur la fiche patiente de démonstration liée à l'app, et les éventuelles prescriptions
 * ajustées par le praticien pour les autres patients, pour que le portail reflète en
 * direct ce que voit chaque patient.
 */
export function useDisplayPatients(): PatientSummary[] {
  const { profile, targets, consumed } = useApp()
  const { messagesByPatient, prescriptionOverrides } = usePro()

  return useMemo(
    () =>
      PATIENTS.map((p) => {
        const messages = messagesByPatient[p.id] ?? p.messages
        if (p.linkedToApp) {
          return {
            ...p,
            name: `${profile.firstName} Delvaux`,
            goal: profile.goal,
            allergens: profile.allergens,
            targets,
            actualToday: consumed,
            messages,
          }
        }
        const override = prescriptionOverrides[p.id]
        return override ? { ...p, goal: override.goal, allergens: override.allergens, messages } : { ...p, messages }
      }),
    [profile, targets, consumed, messagesByPatient, prescriptionOverrides],
  )
}
