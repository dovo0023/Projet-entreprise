import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { useApp, PATIENT_SHARE_CODE } from '../context/AppContext'
import { PATIENTS } from '../data/patients'
import type { ChatMessage, Goal } from '../types'

const LINKED_PATIENT_ID = 'camille'

interface PrescriptionOverride {
  goal: Goal
  allergens: string[]
}

interface ProState {
  messagesByPatient: Record<string, ChatMessage[]>
  sendMessage: (patientId: string, text: string) => void
  prescriptionOverrides: Record<string, PrescriptionOverride>
  updatePrescription: (patientId: string, override: PrescriptionOverride) => void
  portfolioPatientIds: string[]
  addPatientByCode: (code: string) => { success: boolean; patientName?: string; alreadyAdded?: boolean }
}

const ProContext = createContext<ProState | null>(null)

const STORAGE_KEY = 'nutriflow_pro_state_v1'

interface PersistedProState {
  messagesByPatient: Record<string, ChatMessage[]>
  prescriptionOverrides: Record<string, PrescriptionOverride>
  portfolioPatientIds: string[]
}

function loadPersisted(): Partial<PersistedProState> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function ProProvider({ children }: { children: ReactNode }) {
  const { sendMessage: sendMessageToApp } = useApp()
  const [persisted] = useState(() => loadPersisted())

  const [messagesByPatient, setMessagesByPatient] = useState<Record<string, ChatMessage[]>>(
    () => persisted?.messagesByPatient ?? Object.fromEntries(PATIENTS.filter((p) => !p.linkedToApp).map((p) => [p.id, p.messages])),
  )
  const [prescriptionOverrides, setPrescriptionOverrides] = useState<Record<string, PrescriptionOverride>>(
    persisted?.prescriptionOverrides ?? {},
  )
  // Le patient lié à l'app démarre hors du portefeuille : le praticien doit l'ajouter via son code de partage,
  // pour rejouer le vrai mécanisme d'invitation devant un praticien.
  const [portfolioPatientIds, setPortfolioPatientIds] = useState<string[]>(
    () => persisted?.portfolioPatientIds ?? PATIENTS.filter((p) => p.id !== LINKED_PATIENT_ID).map((p) => p.id),
  )

  useEffect(() => {
    try {
      const payload: PersistedProState = { messagesByPatient, prescriptionOverrides, portfolioPatientIds }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    } catch {
      // Stockage indisponible : la session continue simplement en mémoire.
    }
  }, [messagesByPatient, prescriptionOverrides, portfolioPatientIds])

  function sendMessage(patientId: string, text: string) {
    if (patientId === LINKED_PATIENT_ID) {
      sendMessageToApp('praticien', text)
      return
    }
    const message: ChatMessage = { from: 'praticien', text, time: 'À l’instant' }
    setMessagesByPatient((prev) => ({ ...prev, [patientId]: [...(prev[patientId] ?? []), message] }))
  }

  function updatePrescription(patientId: string, override: PrescriptionOverride) {
    setPrescriptionOverrides((prev) => ({ ...prev, [patientId]: override }))
  }

  function addPatientByCode(code: string): { success: boolean; patientName?: string; alreadyAdded?: boolean } {
    const normalized = code.trim().toUpperCase()
    if (normalized !== PATIENT_SHARE_CODE) return { success: false }
    if (portfolioPatientIds.includes(LINKED_PATIENT_ID)) return { success: true, alreadyAdded: true, patientName: 'Camille Delvaux' }
    setPortfolioPatientIds((prev) => [...prev, LINKED_PATIENT_ID])
    return { success: true, patientName: 'Camille Delvaux' }
  }

  return (
    <ProContext.Provider
      value={{ messagesByPatient, sendMessage, prescriptionOverrides, updatePrescription, portfolioPatientIds, addPatientByCode }}
    >
      {children}
    </ProContext.Provider>
  )
}

export function usePro() {
  const ctx = useContext(ProContext)
  if (!ctx) throw new Error('usePro must be used within ProProvider')
  return ctx
}
