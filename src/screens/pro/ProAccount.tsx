import { UserPlus } from 'lucide-react'

export default function ProAccount() {
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-extrabold text-ink mb-6">Mon compte</h1>

      <div className="bg-white rounded-3xl border border-black/5 p-6 flex items-center gap-4 mb-5">
        <div className="w-14 h-14 rounded-full bg-berry-400 flex items-center justify-center text-lg font-bold text-white">EM</div>
        <div>
          <p className="font-extrabold text-ink text-[16px]">Dr. Elise Marchand</p>
          <p className="text-[12.5px] text-ink-soft/60">Diététicienne nutritionniste · Cabinet Marchand, Bruxelles</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-black/5 p-6">
        <div className="flex items-center gap-2 mb-3">
          <UserPlus size={16} className="text-leaf-600" />
          <p className="text-[13px] font-bold text-ink-soft/70 uppercase tracking-wide">Comment ajouter un patient</p>
        </div>
        <p className="text-[13px] text-ink-soft leading-relaxed">
          Chaque patient génère son propre code depuis son espace « Progression » dans l’app mobile, et vous le transmet
          (SMS, en consultation…). Rendez-vous sur <strong>Patients</strong> puis <strong>« Ajouter un patient »</strong> pour
          entrer ce code : son suivi (planning, observance, poids) apparaît alors immédiatement dans votre tableau de bord.
        </p>
      </div>
    </div>
  )
}
