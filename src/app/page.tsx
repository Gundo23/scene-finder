import { supabase } from '@/lib/supabase'
import Link from 'next/link'

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

  const { data: venues, error } = await query

  if (error) {
    return <main className="p-8">Error loading venues: {error.message}</main>
  }

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-zinc-950 px-3 py-5 text-white sm:px-6 sm:py-10">
      <section className="mx-auto w-full max-w-7xl overflow-x-hidden">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-blue-400">
            Scene Finder
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-5xl">
            Find venues and events near you.
          </h1>

          <p className="mt-3 max-w-2xl text-sm text-zinc-300 sm:text-lg">
            Search by venue name, city, area, or region.
          </p>

          <div className="mt-5 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
            <img
              src="/images/home-hero.jpg"
              alt="Scene Finder"
              className="h-20 w-full object-cover object-center sm:h-28"
            />
          </div>
        </div>

        <form className="mt-5 w-full rounded-2xl border border-zinc-800 bg-zinc-900 p-3 sm:p-5">
          <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]">
            <input
              name="search"
              defaultValue={search}
              placeholder="Search Leeds, Blackpool, Quest..."
              className="w-full min-w-0 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-3 text-white placeholder:text-zinc-500"
            />

            <button
              type="submit"
              className="w-full rounded-lg bg-blue-500 px-4 py-3 font-medium text-white sm:w-auto"
            >
              Search
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <Link href="/events" className="text-blue-400">
              Browse events →
            </Link>

            {search && (
              <Link href="/" className="text-zinc-400 hover:text-white">
                Clear search
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
                className="h-full min-w-0 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 hover:border-blue-500"
              >
                <div className="h-28 w-full overflow-hidden bg-zinc-950 sm:h-44">
                  <img
                    src={venue.image_url || '/images/venue-placeholder.jpg'}
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