import { Calendar, CalendarDays, ChevronRight, Sparkles, Users } from 'lucide-react'
import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { Card, SectionTitle } from '../../components/ui'
import AppointmentBooking from './AppointmentBooking'
import AssistanceChat from './AssistanceChat'

const FEATURES = [
  {
    icon: CalendarDays,
    title: 'Planning & Courses',
    description: 'Un menu personnalisé généré chaque semaine selon vos objectifs, avec la liste de courses qui va avec.',
  },
  {
    icon: Sparkles,
    title: 'Aujourd’hui',
    description: 'Suivez vos repas du jour, marquez-les comme consommés, et échangez-en un en cas d’imprévu.',
  },
  {
    icon: Users,
    title: 'Foyer',
    description:
      'Ajoutez les autres personnes de la maison (objectif, régime, allergies) et suivez la progression de chacun — poids, observance et journal alimentaire.',
  },
]

export default function AccueilScreen() {
  const { appointments } = useApp()
  const [bookingOpen, setBookingOpen] = useState(false)

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative">
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="px-5 pt-5 pb-2">
          <h1 className="text-xl font-extrabold text-ink">Bienvenue sur NutriFlow</h1>
          <p className="text-[13px] text-ink-soft mt-1">
            Votre nutrition personnalisée : un menu généré pour vous, une liste de courses prête, et un accompagnement
            professionnel si vous en avez besoin.
          </p>
        </div>

        <div className="px-5 mt-4">
          <SectionTitle>À quoi sert l’appli</SectionTitle>
          <div className="flex flex-col gap-3">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <Card key={title} className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-leaf-50 flex items-center justify-center shrink-0">
                  <Icon size={17} className="text-leaf-600" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-ink text-[14px]">{title}</p>
                  <p className="text-[12.5px] text-ink-soft/70 mt-0.5">{description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="px-5 mt-6">
          <SectionTitle>Un accompagnement professionnel</SectionTitle>
          <Card className="flex flex-col gap-3">
            <p className="text-[13px] text-ink-soft">
              Faites-vous accompagner par un(e) diététicien(ne) : trouvez-en un(e) près de chez vous et prenez rendez-vous
              directement depuis l’appli.
            </p>
            {appointments.length > 0 && (
              <div className="flex flex-col gap-2">
                {appointments.map((a) => (
                  <div key={a.id} className="flex items-center gap-3 bg-black/[0.03] rounded-2xl px-3.5 py-2.5">
                    <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shrink-0">
                      <Calendar size={15} className="text-leaf-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-ink text-[13.5px] truncate">{a.practitionerName}</p>
                      <p className="text-[12px] text-ink-soft/60">
                        {a.dayLabel} à {a.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={() => setBookingOpen(true)}
              className="tap w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-black/5"
            >
              <span className="text-[13px] font-bold text-ink">Trouver un(e) diététicien(ne) près de chez moi</span>
              <ChevronRight size={15} className="text-ink-soft/50 shrink-0" />
            </button>
          </Card>
        </div>

        <div className="px-5 mt-6 pb-8">
          <SectionTitle>Besoin d’aide ?</SectionTitle>
          <AssistanceChat />
        </div>
      </div>

      {bookingOpen && <AppointmentBooking onClose={() => setBookingOpen(false)} />}
    </div>
  )
}
