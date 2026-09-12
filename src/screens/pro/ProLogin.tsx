import { Leaf } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui'

export default function ProLogin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  return (
    <div className="relative min-h-dvh w-full bg-pro-bg flex items-center justify-center px-4 py-10 overflow-hidden">
      <div
        aria-hidden
        className="pro-drift absolute -top-16 -left-16 w-72 h-72 rounded-full bg-pro-mint-100 blur-3xl opacity-70 pointer-events-none"
      />
      <div
        aria-hidden
        className="pro-drift-slow absolute -bottom-24 -right-10 w-80 h-80 rounded-full bg-pro-coral-100 blur-3xl opacity-60 pointer-events-none"
      />

      <div className="relative w-full max-w-[400px]">
        <div className="pro-rise flex flex-col items-center text-center mb-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-pro-blue-500 text-white flex items-center justify-center">
              <Leaf size={19} strokeWidth={2.5} />
            </div>
            <p className="font-display font-semibold text-[22px] text-pro-ink">
              Nutri<span className="text-pro-blue-500">Drive</span>
            </p>
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wide text-pro-blue-500 mb-2">L'espace des diététiciens</span>
          <h1 className="font-display font-semibold text-[28px] leading-tight text-pro-ink text-balance">
            Votre expertise, au cœur du quotidien
          </h1>
          <p className="text-[14px] text-pro-ink-soft mt-2 max-w-[320px]">
            Prolongez l'accompagnement entre les consultations et repérez qui décroche avant qu'il ne soit trop tard.
          </p>
        </div>

        <form
          className="pro-rise bg-pro-surface rounded-[28px] border border-black/5 p-6 sm:p-7 flex flex-col gap-4 shadow-[0_20px_50px_-24px_rgba(18,23,43,0.25)]"
          style={{ animationDelay: '90ms' }}
          onSubmit={(e) => {
            e.preventDefault()
            navigate('/pro')
          }}
        >
          <label className="flex flex-col gap-1.5">
            <span className="text-[12px] font-bold text-pro-ink-soft">Adresse email professionnelle</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="dr.marchand@cabinet.be"
              className="rounded-2xl border border-black/10 px-4 py-3 text-[14px] outline-none transition-[border-color,box-shadow] duration-200 focus:border-pro-blue-500 focus:ring-4 focus:ring-pro-blue-50"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[12px] font-bold text-pro-ink-soft">Mot de passe</span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="rounded-2xl border border-black/10 px-4 py-3 text-[14px] outline-none transition-[border-color,box-shadow] duration-200 focus:border-pro-blue-500 focus:ring-4 focus:ring-pro-blue-50"
            />
          </label>
          <Button
            type="submit"
            full
            className="!bg-pro-blue-500 hover:!bg-pro-blue-600 mt-2 transition-colors duration-200"
          >
            Se connecter
          </Button>
        </form>

        <p className="pro-rise text-center text-[13px] text-pro-ink-soft mt-6" style={{ animationDelay: '160ms' }}>
          Vous êtes un(e) patient(e) ?{' '}
          <button onClick={() => navigate('/')} className="font-bold text-pro-blue-500 hover:text-pro-blue-600 transition-colors">
            Ouvrir l'app mobile
          </button>
        </p>
      </div>
    </div>
  )
}
