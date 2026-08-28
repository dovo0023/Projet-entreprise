import { createContext, useContext, useState, type ReactNode } from 'react'
import { PATIENTS } from '../data/patients'
import type { ChatMessage, Goal } from '../types'

interface PrescriptionOverride {
  goal: Goal
  allergens: string[]
}

interface ProState {
  messagesByPatient: Record<string, ChatMessage[]>
  sendMessage: (patientId: string, text: string) => void
  prescriptionOverrides: Record<string, PrescriptionOverride>
  updatePrescription: (patientId: string, override: PrescriptionOverride) => void
}

const ProContext = createContext<ProState | null>(null)

export function ProProvider({ children }: { children: ReactNode }) {
  const [messagesByPatient, setMessagesByPatient] = useState<Record<string, ChatMessage[]>>(() =>
    Object.fromEntries(PATIENTS.map((p) => [p.id, p.messages])),
  )
  const [prescriptionOverrides, setPrescriptionOverrides] = useState<Record<string, PrescriptionOverride>>({})

  function sendMessage(patientId: string, text: string) {
    const message: ChatMessage = { from: 'praticien', text, time: 'À l’instant' }
    setMessagesByPatient((prev) => ({ ...prev, [patientId]: [...(prev[patientId] ?? []), message] }))
  }

  function updatePrescription(patientId: string, override: PrescriptionOverride) {
    setPrescriptionOverrides((prev) => ({ ...prev, [patientId]: override }))
  }

  return (
    <ProContext.Provider value={{ messagesByPatient, sendMessage, prescriptionOverrides, updatePrescription }}>
      {children}
    </ProContext.Provider>
  )
}

export function usePro() {
  const ctx = useContext(ProContext)
  if (!ctx) throw new Error('usePro must be used within ProProvider')
  return ctx
}
