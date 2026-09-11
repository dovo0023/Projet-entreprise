import { useMemo } from 'react'
import { SELF_RECORD_ID, useApp } from '../context/AppContext'
import { PATIENTS } from '../data/patients'
import type { PatientSummary } from '../types'
import { usePro } from './ProContext'

/**
 * Superpose les données réelles du compte B2C (profil, cibles, consommation du jour, journal
 * alimentaire, messages) sur la fiche patiente de démonstration liée à l'app, et les éventuelles
 * prescriptions ajustées par le praticien pour les autres patients. Ne renvoie que les patients
 * déjà ajoutés au portefeuille du praticien (voir ProContext.addPatientByCode).
 */
export function useDisplayPatients(): PatientSummary[] {
  const { profile, targets, consumed, personalRecords, messages: liveMessages } = useApp()
  const { messagesByPatient, prescriptionOverrides, portfolioPatientIds, practitionerBiometrics } = usePro()

  return useMemo(
    () =>
      PATIENTS.filter((p) => portfolioPatientIds.includes(p.id)).map((p) => {
        if (p.linkedToApp) {
          return {
            ...p,
            name: `${profile.firstName} Delvaux`,
            goal: profile.goal,
            dietType: profile.dietType,
            allergens: profile.allergens,
            targets,
            actualToday: consumed,
            weightHistory: personalRecords[SELF_RECORD_ID]?.weightHistory ?? p.weightHistory,
            journalEntries: personalRecords[SELF_RECORD_ID]?.journalEntries ?? p.journalEntries,
            // Le moteur ne maintient qu'un seul plan à la fois (celui de la semaine en cours) : la patiente
            // liée à l'app n'a donc jamais de semaine suivante déjà préparée à l'avance, contrairement aux
            // patientes de démo (voir generateNextWeekPreview) qui simulent les deux cas de figure.
            nextWeekPlan: null,
            messages: liveMessages,
          }
        }
        const messages = messagesByPatient[p.id] ?? p.messages
        const override = prescriptionOverrides[p.id]
        const weightHistory = [...p.weightHistory, ...(practitionerBiometrics[p.id] ?? [])]
        return override
          ? { ...p, goal: override.goal, dietType: override.dietType, allergens: override.allergens, weightHistory, messages }
          : { ...p, weightHistory, messages }
      }),
    [profile, targets, consumed, personalRecords, liveMessages, messagesByPatient, prescriptionOverrides, portfolioPatientIds, practitionerBiometrics],
  )
}
