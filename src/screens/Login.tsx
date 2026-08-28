import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  return (
    <div className="flex-1 flex flex-col px-6 pt-[calc(env(safe-area-inset-top)+20px)] pb-8 overflow-y-auto no-scrollbar">
      <button onClick={() => navigate(-1)} className="tap w-9 h-9 rounded-full bg-black/5 flex items-center justify-center mb-8">
        <ArrowLeft size={18} />
      </button>

      <h1 className="text-2xl font-extrabold text-ink mb-1">Bon retour !</h1>
      <p className="text-[14px] text-ink-soft mb-8">Connectez-vous pour retrouver votre plan.</p>

      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault()
          navigate('/app/today')
        }}
      >
        <label className="flex flex-col gap-1.5">
          <span className="text-[12px] font-bold text-ink-soft">Adresse email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="prenom@email.com"
            className="rounded-2xl border border-black/10 bg-white px-4 py-3.5 text-[15px] outline-none focus:border-leaf-500 focus:ring-2 focus:ring-leaf-100"
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
            className="rounded-2xl border border-black/10 bg-white px-4 py-3.5 text-[15px] outline-none focus:border-leaf-500 focus:ring-2 focus:ring-leaf-100"
          />
        </label>

        <button type="button" className="self-end text-[12px] font-bold text-leaf-600">
          Mot de passe oublié ?
        </button>

        <Button type="submit" full className="mt-2">
          Se connecter
        </Button>
      </form>

      <p className="text-center text-[13px] text-ink-soft mt-8">
        Pas encore de compte ?{' '}
        <button onClick={() => navigate('/onboarding')} className="font-bold text-leaf-600">
          Inscrivez-vous
        </button>
      </p>
    </div>
  )
}
