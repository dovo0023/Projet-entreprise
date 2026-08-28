import type { ReactNode } from 'react'

export default function PhoneShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh w-full flex items-center justify-center bg-[#e9e4da] sm:py-8">
      <div className="relative w-full sm:w-[420px] sm:h-[900px] h-dvh bg-cream sm:rounded-[2.5rem] sm:shadow-2xl overflow-hidden sm:border-8 border-black/90 flex flex-col">
        {children}
      </div>
    </div>
  )
}
