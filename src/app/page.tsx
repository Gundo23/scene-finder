import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { shouldShowPublicVenue } from '@/lib/venue-visibility'
import FallbackImage from '@/app/components/FallbackImage'
import Icon from '@/app/components/Icon'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const today = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/London', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date())
  const [venuesResult, eventsResult, lifetimeResult] = await Promise.all([
    supabase.from('venues').select('name, category, status').limit(5000),
    supabase.from('events').select('*', { count: 'exact', head: true }).eq('is_published', true).gte('event_date', today),
    supabase.rpc('sf_public_lifetime_event_count'),
  ])
  const venueCount = venuesResult.error ? null : (venuesResult.data || []).filter(shouldShowPublicVenue).length
  const upcomingEventCount = eventsResult.error ? null : eventsResult.count
  const lifetimeCount = lifetimeResult.error ? null : lifetimeResult.data

  return (
    <main className="relative isolate flex min-h-[100dvh] items-center bg-zinc-950 px-4 py-6 text-white sm:px-6 sm:py-10">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,rgba(59,130,246,0.13),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(168,85,247,0.12),transparent_50%)]" />
      <section className="relative mx-auto w-full max-w-5xl overflow-hidden rounded-[2rem] border border-blue-400/20 bg-gradient-to-br from-zinc-900/80 via-zinc-950 to-purple-950/20 p-5 shadow-[0_0_60px_rgba(59,130,246,0.09)] sm:p-8 lg:p-10">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/80 to-transparent" />
        <header className="flex items-center justify-between gap-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-blue-300 sm:text-xs">Your guide to the scene</p>
          <Link href="/submit" className="inline-flex min-h-11 items-center gap-2 rounded-lg px-2 text-sm text-zinc-400 transition-colors hover:text-white">
            <Icon name="support" className="h-4 w-4" />
            Help
          </Link>
        </header>

        <div className="mt-3 grid items-center gap-7 lg:mt-5 lg:grid-cols-[1.05fr_1fr] lg:gap-12">
          <div className="text-center lg:text-left">
            <FallbackImage
              src="/images/scene-finder-logo-transparent.png"
              fallbackSrc="/images/home-hero.jpg"
              alt="Scene Finder"
              loading="eager"
              fetchPriority="high"
              className="mx-auto h-36 w-36 object-contain drop-shadow-[0_0_25px_rgba(255,215,0,0.12)] sm:h-44 sm:w-44 lg:mx-0 lg:h-52 lg:w-52"
            />
            <h1 className="mt-3 text-3xl font-black leading-[1.08] tracking-tight sm:text-4xl lg:text-5xl">
              Find your next<br />
              <span className="bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">night out.</span>
            </h1>
            <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-zinc-300 sm:text-base lg:mx-0">
              UK swinging clubs, lifestyle venues, saunas, socials and kink nights. Discover your scene, in one place.
            </p>
            {(venueCount !== null || upcomingEventCount !== null) && (
              <p className="mt-5 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-zinc-400 lg:justify-start">
                {venueCount !== null && <span><strong className="font-bold tabular-nums text-white">{venueCount.toLocaleString('en-GB')}</strong> venues</span>}
                {upcomingEventCount !== null && <span><strong className="font-bold tabular-nums text-white">{upcomingEventCount.toLocaleString('en-GB')}</strong> upcoming events</span>}
              </p>
            )}
          </div>

          <div>
            <div className="rounded-2xl border border-blue-400/20 bg-zinc-950/60 p-4 sm:p-5">
              <h2 className="text-lg font-bold tracking-tight">Where are you heading?</h2>
              <form action="/venues" method="get" role="search" className="mt-4">
                <label htmlFor="home-search" className="sr-only">Search clubs and venues by name, city or postcode</label>
                <div className="flex items-center gap-3 rounded-xl border border-zinc-700 bg-zinc-900/70 px-3 focus-within:border-blue-400">
                  <Icon name="search" className="h-5 w-5 shrink-0 text-blue-300" />
                  <input id="home-search" name="search" type="search" placeholder="Venue, city or postcode" className="min-h-12 min-w-0 flex-1 bg-transparent py-3 text-base text-white placeholder:text-zinc-500 focus:outline-none" />
                </div>
                <button type="submit" className="mt-3 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-950/30 transition hover:from-blue-400 hover:to-purple-500">
                  Find clubs & venues
                  <Icon name="arrow-right" className="h-4 w-4" />
                </button>
              </form>
              <p className="mt-3 text-xs leading-5 text-zinc-400">Use a postcode to find venues within 30 miles.</p>
            </div>

            <div className="mt-4 grid gap-3">
              <Link href="/events" className="group flex min-h-20 items-center gap-4 rounded-2xl border border-purple-400/25 bg-purple-500/10 px-4 py-4 transition-colors hover:border-purple-400/60 hover:bg-purple-500/15 sm:px-5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-400/10 text-purple-300"><Icon name="calendar" className="h-5 w-5" /></span>
                <span className="min-w-0 flex-1"><span className="block text-base font-bold text-purple-100">Find events</span><span className="mt-0.5 block text-xs leading-5 text-zinc-400">Explore dates, venues and what’s on.</span></span>
                <Icon name="arrow-right" className="h-5 w-5 shrink-0 text-purple-300 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link href="/venues" className="group flex min-h-14 items-center justify-between gap-3 rounded-xl px-3 text-sm font-semibold text-zinc-300 transition-colors hover:bg-white/5 hover:text-white">
                <span className="inline-flex items-center gap-3"><Icon name="clubs" className="h-5 w-5 text-blue-300" />Browse all clubs & venues</span>
                <Icon name="arrow-right" className="h-4 w-4 shrink-0 text-zinc-500 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <nav aria-label="Explore quickly" className="mt-2 flex flex-wrap items-center gap-2 border-t border-white/10 pt-4">
              <Link href="/events?timing=tonight" className="inline-flex min-h-11 items-center rounded-full border border-zinc-700/80 px-3 text-xs font-semibold text-zinc-300 transition-colors hover:border-blue-400/50 hover:text-white">Tonight</Link>
              <Link href="/events?timing=weekend" className="inline-flex min-h-11 items-center rounded-full border border-zinc-700/80 px-3 text-xs font-semibold text-zinc-300 transition-colors hover:border-purple-400/50 hover:text-white">This weekend</Link>
              <Link href="/venues?sort=popular" className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-pink-400/25 bg-pink-500/5 px-3 text-xs font-semibold text-pink-200 transition-colors hover:border-pink-400/60"><Icon name="heart" className="h-3.5 w-3.5" />Most liked</Link>
            </nav>
          </div>
        </div>

        <footer className="mt-7 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-5 text-xs sm:flex-row lg:mt-10">
          {typeof lifetimeCount === 'number' ? (
            <p className="flex items-center gap-2 text-fuchsia-200"><span aria-hidden="true" className="text-fuchsia-400">✦</span><strong className="font-bold tabular-nums">{lifetimeCount.toLocaleString('en-GB')}</strong> all-time published events</p>
          ) : <p className="text-zinc-400">Discover the scene across the UK.</p>}
          <div className="flex items-center gap-5 text-zinc-400">
            <Link href="/submit/get-listed" className="inline-flex min-h-11 items-center transition-colors hover:text-white">Get listed</Link>
            <Link href="/submit/faq" className="inline-flex min-h-11 items-center transition-colors hover:text-white">How it works</Link>
          </div>
        </footer>
      </section>
    </main>
  )
}
