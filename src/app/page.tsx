import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ region?: string; search?: string }>
}) {
  const params = await searchParams
  const selectedRegion = params.region || 'All'
  const search = params.search || ''

  let query = supabase
    .from('venues')
    .select('venue_id, name, city_area, region, website')
    .order('name')

  if (selectedRegion !== 'All') {
    query = query.eq('region', selectedRegion)
  }

  if (search) {
    query = query.or(
      `name.ilike.%${search}%,city_area.ilike.%${search}%,region.ilike.%${search}%`
    )
  }

  const { data: venues, error } = await query

  const { data: allVenues } = await supabase.from('venues').select('region')

  const regions = [
    'All',
    ...Array.from(
      new Set(allVenues?.map((venue) => venue.region).filter(Boolean))
    ),
  ]

  if (error) {
    return <main className="p-8">Error loading venues: {error.message}</main>
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-10 text-white">
      <section className="mx-auto max-w-5xl">
        <h1 className="text-4xl font-bold">Scene Finder</h1>
        <p className="mt-3 text-zinc-300">UK lifestyle venues and events.</p>

        <Link
          href="/events"
          className="mt-4 inline-block text-sm font-medium text-blue-400"
        >
          Browse events →
        </Link>

        <form className="mt-8 grid gap-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-5 sm:grid-cols-[1fr_220px_auto]">
          <div>
            <label className="block text-sm font-medium text-zinc-300">
              Search venues
            </label>
            <input
              name="search"
              defaultValue={search}
              placeholder="Try Leeds, Blackpool, Quest..."
              className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300">
              Region
            </label>
            <select
              name="region"
              defaultValue={selectedRegion}
              className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2 text-white"
            >
              {regions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="self-end rounded-lg bg-blue-500 px-5 py-2 font-medium text-white"
          >
            Search
          </button>
        </form>

        <p className="mt-6 text-sm text-zinc-400">
          Showing {venues?.length || 0} venues
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {venues?.map((venue) => (
            <article
              key={venue.venue_id}
              className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5"
            >
              <Link href={`/venue/${venue.venue_id}`}>
                <h2 className="text-xl font-semibold hover:text-blue-400">
                  {venue.name}
                </h2>
              </Link>

              <p className="mt-2 text-sm text-zinc-400">
                {venue.city_area} • {venue.region}
              </p>

              <div className="mt-4 flex gap-4">
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
          ))}
        </div>
      </section>
    </main>
  )
}