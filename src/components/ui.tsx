import type { ButtonHTMLAttributes, ReactNode } from 'react'

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`bg-white rounded-3xl p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(0,0,0,0.12)] ${className}`}>{children}</div>
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-[13px] font-bold uppercase tracking-wide text-ink-soft/70">{children}</h2>
      {action}
    </div>
  )
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'dark'
  full?: boolean
}

export function Button({ variant = 'primary', full, className = '', children, ...rest }: ButtonProps) {
  const base = 'tap inline-flex items-center justify-center gap-2 rounded-2xl font-bold text-[14px] px-5 py-3.5 disabled:opacity-40'
  const variants: Record<string, string> = {
    primary: 'bg-leaf-500 text-white',
    dark: 'bg-ink text-cream',
    secondary: 'bg-leaf-100 text-leaf-700',
    ghost: 'bg-black/5 text-ink',
  }
  return (
    <button className={`${base} ${variants[variant]} ${full ? 'w-full' : ''} ${className}`} {...rest}>
      {children}
    </button>
  )
}

export function MacroBar({ label, value, target, unit = 'g', color }: { label: string; value: number; target: number; unit?: string; color: string }) {
  const pct = Math.min(100, Math.round((value / target) * 100))
  return (
    <div>
      <div className="flex justify-between text-[12px] mb-1">
        <span className="font-semibold text-ink-soft">{label}</span>
        <span className="text-ink-soft/70">
          {value}
          <span className="text-ink-soft/40">/{target}{unit}</span>
        </span>
      </div>
      <div className="h-2 rounded-full bg-black/5 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}

export function KcalRing({ consumed, target, size = 128 }: { consumed: number; target: number; size?: number }) {
  const pct = Math.min(1, consumed / target)
  const stroke = 12
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const remaining = Math.max(0, target - consumed)
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#eeece4" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="#2f9d5f"
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-extrabold text-ink leading-none">{remaining}</span>
        <span className="text-[11px] text-ink-soft/60 mt-1">kcal restantes</span>
      </div>
    </div>
  )
}

export function Pill({ children, tone = 'default' }: { children: ReactNode; tone?: 'default' | 'leaf' | 'clementine' | 'berry' }) {
  const tones: Record<string, string> = {
    default: 'bg-black/5 text-ink-soft',
    leaf: 'bg-leaf-100 text-leaf-700',
    clementine: 'bg-clementine-100 text-clementine-500',
    berry: 'bg-berry-100 text-berry-500',
  }
  return <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${tones[tone]}`}>{children}</span>
}
