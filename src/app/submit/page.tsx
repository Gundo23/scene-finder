import Link from 'next/link'
import FallbackImage from '@/app/components/FallbackImage'
import Icon, { type IconName } from '@/app/components/Icon'

const supportActions: { href: string; icon: IconName; title: string; description: string; accent: string }[] = [
  {
    href: '/submit/contact',
    icon: 'support',
    title: 'Contact & support',
    description: 'Report a problem, a broken link or information that needs updating.',
    accent: 'bg-purple-400/10 text-purple-300',
  },
  {
    href: '/submit/get-listed',
    icon: 'clubs',
    title: 'Get listed',
    description: 'Tell us about your venue, event or party host.',
    accent: 'bg-blue-400/10 text-blue-300',
  },
  {
    href: '/submit/faq',
    icon: 'search',
    title: 'Frequently asked questions',
    description: 'Find answers about listings, events and using Scene Finder.',
    accent: 'bg-pink-400/10 text-pink-300',
  },
]

export default function SubmitPage() {
  return (
    <main className="relative isolate min-h-[75dvh] bg-zinc-950 px-4 pt-6 pb-8 text-white sm:px-6 sm:pt-8">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-96 bg-[radial-gradient(ellipse_at_top,rgba(168,85,247,0.12),transparent_70%)]" />
      <section className="mx-auto max-w-3xl">
        <header className="mb-8 flex items-center justify-between gap-4">
          <Link href="/" aria-label="Scene Finder home" className="inline-flex items-center gap-3 rounded-xl">
            <FallbackImage src="/images/scene-finder-logo-transparent.png" fallbackSrc="/images/home-hero.jpg" alt="" loading="eager" className="h-14 w-14 object-contain" />
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-blue-300">Scene Finder</span>
          </Link>
          <Link href="/venues" className="inline-flex min-h-11 items-center gap-2 rounded-lg px-2 text-sm font-medium text-zinc-400 transition-colors hover:text-white">Explore<Icon name="arrow-right" className="h-4 w-4" /></Link>
        </header>

        <p className="text-xs font-bold uppercase tracking-[0.18em] text-purple-300">Help & support</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">How can we help?</h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-400 sm:text-base">Find an answer, share an update or bring your venue to the scene.</p>

        <div className="mt-7 overflow-hidden rounded-2xl border border-purple-400/20 bg-gradient-to-br from-zinc-900/70 to-zinc-950 shadow-xl shadow-black/10">
          {supportActions.map((action, index) => (
            <Link key={action.href} href={action.href} className={`group flex items-center gap-4 p-5 transition-colors hover:bg-white/[0.03] sm:gap-5 sm:p-6 ${index > 0 ? 'border-t border-white/10' : ''}`}>
              <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${action.accent}`}><Icon name={action.icon} className="h-6 w-6" /></span>
              <span className="min-w-0 flex-1">
                <span className="block text-base font-bold text-white sm:text-lg">{action.title}</span>
                <span className="mt-1 block text-sm leading-6 text-zinc-400">{action.description}</span>
              </span>
              <Icon name="arrow-right" className="h-5 w-5 shrink-0 text-zinc-500 transition-transform group-hover:translate-x-1 group-hover:text-white" />
            </Link>
          ))}
        </div>

        <p className="mt-6 max-w-xl text-xs leading-6 text-zinc-500">Scene Finder is an independent directory. Submitted listings and updates are reviewed before publication.</p>
      </section>
    </main>
  )
}
