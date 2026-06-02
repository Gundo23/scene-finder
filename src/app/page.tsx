import { supabase } from '@/lib/supabase'

export default async function Home() {
  const { data: venues, error } = await supabase
    .from('venues')
    .select('venue_id, name, city_area, region, website')
    .limit(40)

  if (error) {
    return <main className="p-8">Error loading venues: {error.message}</main>
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-10 text-white">
      <section className="mx-auto max-w-5xl">
        <h1 className="text-4xl font-bold">Scene Finder</h1>
        <p className="mt-3 text-zinc-300">
          UK lifestyle venues and events.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {venues?.map((venue) => (
            <article
              key={venue.venue_id}
              className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5"
            >
              <h2 className="text-xl font-semibold">{venue.name}</h2>
              <p className="mt-2 text-sm text-zinc-400">
                {venue.city_area} • {venue.region}
              </p>

              {venue.website && (
                <a
                  href={venue.website}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-block text-sm font-medium text-blue-400"
                >
                  Visit website →
                </a>
              )}
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}