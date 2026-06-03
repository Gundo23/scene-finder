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
    .select('venue_id, name, city_area, region, website, category, status')
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
    <main className="min-h-screen bg-zinc-950 px-4 py-6 text-white sm:px-6 sm:py-10">
      <section className="mx-auto max-w-7xl">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-blue-400">
            Scene Finder
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            Find venues and events near you.
          </h1>

          <p className="mt-3 max-w-2xl text-sm text-zinc-300 sm:text-lg">
            Search by venue name, city, area, or region.
          </p>
        </div>

        <form className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-4 sm:p-5">
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <input
              name="search"
              defaultValue={search}
              placeholder="Search Leeds, Blackpool, Quest, North West..."
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-white placeholder:text-zinc-500"
            />

            <button
              type="submit"
              className="rounded-lg bg-blue-500 px-6 py-3 font-medium text-white"
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

        <div className="mt-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {search ? `Results for "${search}"` : 'Featured venues'}
          </h2>

          <p className="text-sm text-zinc-400">{venues?.length || 0} found</p>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {venues && venues.length > 0 ? (
            venues.map((venue) => (
              <article
                key={venue.venue_id}
                className="h-full overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 p-4 hover:border-blue-500"
              >
                <div className="mb-3 flex flex-wrap gap-2">
                  {venue.category && (
                    <p className="inline-block rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-300">
                      {venue.category}
                    </p>
                  )}

                  {venue.status && (
                    <p className="inline-block rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-300">
                      {venue.status}
                    </p>
                  )}
                </div>

                <Link href={`/venue/${venue.venue_id}`}>
                  <h3 className="line-clamp-2 text-lg font-semibold leading-snug hover:text-blue-400">
                    {venue.name}
                  </h3>
                </Link>

                <p className="mt-2 line-clamp-1 text-sm text-zinc-400">
                  {venue.city_area} • {venue.region}
                </p>

                <div className="mt-4 flex flex-wrap gap-4">
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