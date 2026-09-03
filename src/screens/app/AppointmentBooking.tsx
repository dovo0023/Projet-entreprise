import { Calendar, Check, ChevronDown, MapPin, Star, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { PRACTITIONER_SPECIALTIES, PRACTITIONERS } from '../../data/practitioners'
import { Button, Card, Pill } from '../../components/ui'
import type { AppointmentSlot, PractitionerListing } from '../../types'

export default function AppointmentBooking({ onClose }: { onClose: () => void }) {
  const { appointments, bookAppointment, cancelAppointment } = useApp()
  const [specialty, setSpecialty] = useState('Toutes')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [justBooked, setJustBooked] = useState<{ name: string; dayLabel: string; time: string } | null>(null)

  const practitioners = [...PRACTITIONERS]
    .filter((p) => specialty === 'Toutes' || p.specialty === specialty)
    .sort((a, b) => a.distanceKm - b.distanceKm)

  function handleBook(practitioner: PractitionerListing, slot: AppointmentSlot) {
    bookAppointment(practitioner, slot)
    setExpandedId(null)
    setJustBooked({ name: practitioner.name, dayLabel: slot.dayLabel, time: slot.time })
    setTimeout(() => setJustBooked(null), 4000)
  }

  return (
    <div className="absolute inset-0 z-20 bg-cream flex flex-col">
      <div className="flex items-center justify-between px-5 pt-[calc(env(safe-area-inset-top)+16px)] pb-3 border-b border-black/5 shrink-0">
        <h1 className="text-lg font-extrabold text-ink">Diététiciens près de chez moi</h1>
        <button onClick={onClose} className="tap w-8 h-8 rounded-full bg-black/5 flex items-center justify-center" aria-label="Fermer">
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-5 py-4 flex flex-col gap-5">
        {justBooked && (
          <div className="fade-up flex items-center gap-2 bg-leaf-50 text-leaf-700 rounded-2xl py-3 px-4 text-[13px] font-semibold">
            <Check size={15} className="shrink-0" /> Rendez-vous confirmé avec {justBooked.name} — {justBooked.dayLabel} à{' '}
            {justBooked.time}.
          </div>
        )}

        {appointments.length > 0 && (
          <div>
            <p className="text-[13px] font-bold text-ink uppercase tracking-wide mb-2">Vos rendez-vous à venir</p>
            <div className="flex flex-col gap-2">
              {appointments.map((a) => (
                <Card key={a.id} className="flex items-center gap-3 !py-3">
                  <div className="w-9 h-9 rounded-xl bg-leaf-50 flex items-center justify-center shrink-0">
                    <Calendar size={15} className="text-leaf-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-ink text-[13.5px] truncate">{a.practitionerName}</p>
                    <p className="text-[12px] text-ink-soft/60">
                      {a.dayLabel} à {a.time}
                    </p>
                  </div>
                  <button
                    onClick={() => cancelAppointment(a.id)}
                    className="tap w-8 h-8 rounded-full bg-black/5 flex items-center justify-center shrink-0 text-ink-soft/50"
                    aria-label="Annuler ce rendez-vous"
                  >
                    <Trash2 size={13} />
                  </button>
                </Card>
              ))}
            </div>
          </div>
        )}

        <div>
          <p className="text-[13px] font-bold text-ink uppercase tracking-wide mb-2">Spécialité</p>
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {PRACTITIONER_SPECIALTIES.map((s) => (
              <button
                key={s}
                onClick={() => setSpecialty(s)}
                className={`tap shrink-0 px-3.5 py-2 rounded-full text-[12.5px] font-bold border ${
                  specialty === s ? 'bg-ink text-cream border-ink' : 'bg-white text-ink-soft border-black/10'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 pb-4">
          {practitioners.map((p) => {
            const isOpen = expandedId === p.id
            const slotsByDay = new Map<string, AppointmentSlot[]>()
            p.slots.forEach((s) => {
              slotsByDay.set(s.dayLabel, [...(slotsByDay.get(s.dayLabel) ?? []), s])
            })

            return (
              <Card key={p.id}>
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-leaf-50 flex items-center justify-center text-2xl shrink-0">{p.photo}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-ink text-[14.5px] truncate">{p.name}</p>
                    <p className="text-[12px] text-ink-soft/70">{p.specialty}</p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <Pill>
                        <MapPin size={11} /> {p.city} · {p.distanceKm} km
                      </Pill>
                      <Pill tone="clementine">
                        <Star size={11} /> {p.rating} ({p.reviewCount})
                      </Pill>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setExpandedId(isOpen ? null : p.id)}
                  className="tap w-full flex items-center justify-center gap-1.5 mt-3 py-2.5 rounded-2xl bg-black/5 text-ink text-[13px] font-bold"
                >
                  {isOpen ? 'Masquer les disponibilités' : 'Voir les disponibilités'}
                  <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && (
                  <div className="fade-up mt-3 pt-3 border-t border-black/5 flex flex-col gap-3">
                    {[...slotsByDay.entries()].map(([day, slots]) => (
                      <div key={day}>
                        <p className="text-[11.5px] font-bold text-ink-soft/60 uppercase mb-1.5">{day}</p>
                        <div className="flex flex-wrap gap-2">
                          {slots.map((slot) => (
                            <button
                              key={slot.id}
                              onClick={() => handleBook(p, slot)}
                              className="tap px-3.5 py-2 rounded-xl bg-leaf-50 text-leaf-700 text-[13px] font-bold"
                            >
                              {slot.time}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )
          })}
          {practitioners.length === 0 && (
            <p className="text-[13px] text-ink-soft/50 italic text-center py-6">Aucun praticien pour cette spécialité pour l’instant.</p>
          )}
        </div>
      </div>

      <div className="px-5 pb-[calc(env(safe-area-inset-bottom)+16px)] pt-3 shrink-0 border-t border-black/5">
        <Button variant="ghost" full onClick={onClose}>
          Fermer
        </Button>
      </div>
    </div>
  )
}
