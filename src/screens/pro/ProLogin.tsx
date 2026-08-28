import { Stethoscope } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui'

export default function ProLogin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  return (
    <div className="min-h-dvh w-full bg-[#f3f1ea] flex items-center justify-center px-4">
      <div className="w-full max-w-[380px]">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-ink text-cream flex items-center justify-center mb-4">
            <Stethoscope size={24} />
          </div>
          <h1 className="text-2xl font-extrabold text-ink">Espace praticien</h1>
          <p className="text-[14px] text-ink-soft mt-1">Suivez l’observance réelle de vos patients.</p>
        </div>

        <form
          className="bg-white rounded-3xl border border-black/5 p-6 flex flex-col gap-4 shadow-sm"
          onSubmit={(e) => {
            e.preventDefault()
            navigate('/pro')
          }}
        >
          <label className="flex flex-col gap-1.5">
            <span className="text-[12px] font-bold text-ink-soft">Adresse email professionnelle</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="dr.marchand@cabinet.be"
              className="rounded-2xl border border-black/10 px-4 py-3 text-[14px] outline-none focus:border-leaf-500 focus:ring-2 focus:ring-leaf-100"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[12px] font-bold text-ink-soft">Mot de passe</span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="rounded-2xl border border-black/10 px-4 py-3 text-[14px] outline-none focus:border-leaf-500 focus:ring-2 focus:ring-leaf-100"
            />
          </label>
          <Button type="submit" full className="mt-2">
            Se connecter
          </Button>
        </form>

        <p className="text-center text-[13px] text-ink-soft mt-6">
          Vous êtes un(e) patient(e) ?{' '}
          <button onClick={() => navigate('/')} className="font-bold text-leaf-600">
            Ouvrir l’app mobile
          </button>
        </p>
      </div>
    </div>
  )
}
