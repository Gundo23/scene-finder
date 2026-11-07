'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'

export default function BottomNav() {
  const router = useRouter()
  const pathname = usePathname()

  if (pathname === '/') return null

  const items = [
    { href: '/', icon: '⌂', label: 'Home', active: pathname === '/' },
    { href: '/venues', icon: '🏢', label: 'Clubs', active: pathname.startsWith('/venues') || pathname.startsWith('/venue/') },
    { href: '/events', icon: '📅', label: 'Events', active: pathname.startsWith('/events') },
    { href: '/submit', icon: '💜', label: 'Support', active: pathname.startsWith('/submit') },
  ]

  return (
    <nav aria-label="Main navigation" className="fixed bottom-0 left-0 right-0 z-50 border-t border-blue-500/20 bg-zinc-950/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-stretch justify-around gap-1 px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] text-white">
        {items.map(({ href, icon, label, active }) => (
          <Link key={href} href={href} aria-current={active ? 'page' : undefined}
            className={`flex min-h-12 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 text-xs transition focus-visible:outline-2 focus-visible:outline-blue-400 ${active ? 'bg-blue-500/15 font-bold text-blue-300' : 'text-zinc-300 hover:bg-zinc-800/70 hover:text-white'}`}>
            <span aria-hidden="true" className="text-lg">{icon}</span>
            {label}
          </Link>
        ))}
        <button type="button" onClick={() => router.back()}
          className="flex min-h-12 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 text-xs text-zinc-300 transition hover:bg-zinc-800/70 focus-visible:outline-2 focus-visible:outline-blue-400">
          <span aria-hidden="true" className="text-lg">←</span>
          Back
        </button>
      </div>
    </nav>
  )
}
