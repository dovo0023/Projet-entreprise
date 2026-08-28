import { Copy } from 'lucide-react'

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
        <p className="text-[13px] font-bold text-ink-soft/70 uppercase tracking-wide mb-3">Inviter un nouveau patient</p>
        <p className="text-[13px] text-ink-soft mb-4">
          Partagez ce code : votre patient l’entre dans son espace « Progression » pour lier son suivi à votre tableau de bord.
        </p>
        <div className="flex items-center justify-between bg-black/[0.03] rounded-2xl px-4 py-3">
          <span className="font-mono font-bold text-ink text-[15px] tracking-wider">NF-72K9</span>
          <button className="tap w-8 h-8 rounded-full bg-white flex items-center justify-center">
            <Copy size={13} className="text-ink-soft" />
          </button>
        </div>
      </div>
    </div>
  )
}
