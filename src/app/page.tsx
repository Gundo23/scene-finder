import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import FallbackImage from '@/app/components/FallbackImage'

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>
}) {
  const params = await searchParams
  const search = params.search || ''

  let query = supabase
    .from('venues')
    .select('venue_id, name, city_area, region, website, category, status, image_url')
    .order('name')

  if (search) {
    query = query.or(
      `name.ilike.%${search}%,city_area.ilike.%${search}%,region.ilike.%${search}%`
    )
  }

  const [
    { data: venues, error },
    { count: venueCount },
    { count: eventCount },
  ] = await Promise.all([
    query,
    supabase.from('venues').select('*', { count: 'exact', head: true }),
    supabase.from('events').select('*', { count: 'exact', head: true }),
  ])

  if (error) {
    return <main className="p-8">Error loading venues: {error.message}</main>
  }

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-zinc-950 px-3 py-5 text-white sm:px-6 sm:py-10">
      <section className="mx-auto w-full max-w-7xl overflow-x-hidden">
        <div className="rounded-3xl border border-zinc-800 bg-gradient-to-b from-blue-950/35 via-zinc-950 to-zinc-950 p-4 shadow-2xl shadow-blue-950/10 sm:p-8">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-blue-400">
              Scene Finder
            </p>

            <h1 className="mt-3 max-w-4xl text-3xl font-bold tracking-tight sm:text-5xl">
              Find venues and events near you.
            </h1>

            <p className="mt-3 max-w-2xl text-sm text-zinc-300 sm:text-lg">
              Search clubs, socials, saunas, kink nights and lifestyle events across the UK.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full border border-blue-500/40 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-200 sm:text-sm">
                {venueCount || 0} Venues
              </span>

              <span className="rounded-full border border-blue-500/40 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-200 sm:text-sm">
                {eventCount || 0} Events
              </span>

              <span className="rounded-full border border-zinc-700 bg-zinc-900/80 px-3 py-1 text-xs font-medium text-zinc-300 sm:text-sm">
                Updated Daily
              </span>
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-800 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.22),rgba(24,24,27,0.92)_45%,rgba(9,9,11,1)_100%)] px-6 py-7 sm:px-10 sm:py-9">
            <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
              <div className="max-w-md">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-300">
                  Discover the scene
                </p>

                <p className="mt-2 text-sm leading-6 text-zinc-300 sm:text-base">
                  Browse trusted venue listings, upcoming parties and community submitted events in one place.
                </p>
              </div>

              <div className="flex h-28 w-40 shrink-0 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 sm:h-32 sm:w-48">
                <FallbackImage
                  src="/images/home-hero.jpg"
                  fallbackSrc="/images/venue-placeholder.jpg"
                  alt="Scene Finder"
                  className="h-full w-full object-contain"
                />
              </div>
            </div>
          </div>
        </div>

        <form className="mt-5 w-full rounded-2xl border border-zinc-800 bg-zinc-900 p-3 sm:p-5">
          <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]">
            <input
              name="search"
              defaultValue={search}
              placeholder="Search Leeds, Blackpool, Quest..."
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-3 text-white placeholder:text-zinc-500 focus:border-blue-500 focus:outline-none"
            />

            <button
              type="submit"
              className="w-full rounded-lg bg-blue-500 px-6 py-3 font-medium text-white transition hover:bg-blue-400 sm:w-auto"
            >
              Search
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Link
              href="/events"
              className="rounded-lg border border-blue-500 bg-blue-500/10 px-4 py-3 text-center text-sm font-medium text-blue-300 transition hover:bg-blue-500 hover:text-white"
            >
              Browse Events →
            </Link>

            <Link
              href="/submit"
              className="rounded-lg border border-blue-500 bg-blue-500/10 px-4 py-3 text-center text-sm font-medium text-blue-300 transition hover:bg-blue-500 hover:text-white"
            >
              Submit Club / Event →
            </Link>

            {search && (
              <Link
                href="/"
                className="rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-center text-sm font-medium text-zinc-300 transition hover:border-zinc-500 hover:text-white sm:col-span-2"
              >
                Clear Search
              </Link>
            )}
          </div>
        </form>

        <div className="mt-6 flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold">
            {search ? `Results for "${search}"` : 'Featured venues'}
          </h2>

          <p className="shrink-0 text-sm text-zinc-400">
            {venues?.length || 0} found
          </p>
        </div>

        <div className="mt-4 grid w-full grid-cols-1 gap-3 overflow-hidden sm:grid-cols-2 xl:grid-cols-3">
          {venues && venues.length > 0 ? (
            venues.map((venue) => (
              <article
                key={venue.venue_id}
                className="h-full min-w-0 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 transition hover:border-blue-500"
              >
                <div className="h-28 w-full overflow-hidden bg-zinc-950 sm:h-44">
                  <FallbackImage
                    src={venue.image_url}
                    fallbackSrc="/images/venue-placeholder.jpg"
                    alt={venue.name}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="min-w-0 p-3 sm:p-4">
                  <div className="mb-2 flex min-w-0 flex-wrap gap-2">
                    {venue.category && (
                      <p className="max-w-full truncate rounded-full border border-zinc-700 px-2.5 py-1 text-[11px] text-zinc-300">
                        {venue.category}
                      </p>
                    )}

                    {venue.status && (
                      <p className="max-w-full truncate rounded-full border border-zinc-700 px-2.5 py-1 text-[11px] text-zinc-300">
                        {venue.status}
                      </p>
                    )}
                  </div>

                  <Link href={`/venue/${venue.venue_id}`}>
                    <h3 className="line-clamp-2 break-words text-base font-semibold leading-snug hover:text-blue-400 sm:text-lg">
                      {venue.name}
                    </h3>
                  </Link>

                  <p className="mt-2 truncate text-xs text-zinc-400 sm:text-sm">
                    {venue.city_area} • {venue.region}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-4">
                    <Link
                      href={`/venue/${venue.venue_id}`}
                      className="text-sm font-medium text-blue-400"
                    >
                      View details →
                    </Link>

                    {venue.website && (
                      <a
                        href={venue.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-medium text-zinc-400 hover:text-white"
                      >
                        Website ↗
                      </a>
                    )}
                  </div>
                </div>
              </article>
            ))
          ) : (
            <p className="text-zinc-400">No venues found.</p>
          )}
        </div>
      </section>
    </main>
  )
}
