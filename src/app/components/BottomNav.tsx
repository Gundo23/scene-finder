'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Icon, { type IconName } from '@/app/components/Icon'

export default function BottomNav() {
  const pathname = usePathname()

  if (pathname === '/') return null

  const items: { href: string; icon: IconName; label: string; active: boolean }[] = [
    { href: '/', icon: 'home', label: 'Home', active: pathname === '/' },
    { href: '/venues', icon: 'clubs', label: 'Clubs', active: pathname.startsWith('/venues') || pathname.startsWith('/venue/') },
    { href: '/events', icon: 'calendar', label: 'Events', active: pathname.startsWith('/events') },
    { href: '/submit', icon: 'support', label: 'Support', active: pathname.startsWith('/submit') },
  ]

  return (
    <>
      <div aria-hidden="true" className="h-[calc(5rem+env(safe-area-inset-bottom))] shrink-0" />
      <nav aria-label="Main navigation" className="fixed inset-x-0 bottom-0 z-50 border-t border-blue-400/20 bg-zinc-950/95 shadow-[0_-8px_30px_rgba(0,0,0,0.2)] backdrop-blur-xl">
        <div className="mx-auto grid max-w-xl grid-cols-4 gap-2 px-3 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          {items.map(({ href, icon, label, active }) => (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={`relative flex min-h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-2 text-xs font-semibold transition-colors ${active ? 'bg-blue-500/12 text-blue-300' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}
            >
              <Icon name={icon} className="h-5 w-5" />
              {label}
              {active && <span aria-hidden="true" className="absolute inset-x-6 top-0 h-0.5 rounded-full bg-gradient-to-r from-blue-400 to-purple-400" />}
            </Link>
          ))}
        </div>
      </nav>
    </>
  )
}
