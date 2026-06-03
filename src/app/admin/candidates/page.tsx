import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default async function CandidateReviewPage() {
  const { data: candidates } = await supabase
    .from('event_candidates')
    .select('*')
    .eq('status', 'new')
    .order('created_at', { ascending: false })
    .limit(100)

  const { data: venues } = await supabase
    .from('venues')
    .select('venue_id, name, city_area, region')

  const venueMap = new Map(
    venues?.map((venue) => [venue.venue_id, venue]) || []
  )

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-10 text-white">
      <section className="mx-auto max-w-6xl">
        <Link href="/" className="text-sm text-blue-400">
          ← Back to site
        </Link>

        <h1 className="mt-6 text-4xl font-bold">Event Candidates</h1>

        <p className="mt-3 text-zinc-400">
          Review scraped event candidates before publishing them.
        </p>

        <p className="mt-6 text-sm text-zinc-500">
          Showing {candidates?.length || 0} new candidates
        </p>

        <div className="mt-6 grid gap-4">
          {candidates && candidates.length > 0 ? (
            candidates.map((candidate) => {
              const venue = venueMap.get(candidate.venue_id)

              return (
                <article
                  key={candidate.id}
                  className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5"
                >
                  <p className="text-sm text-blue-400">
                    {venue
                      ? `${venue.name} • ${venue.city_area} • ${venue.region}`
                      : candidate.venue_id}
                  </p>

                  <h2 className="mt-2 text-xl font-semibold">
                    {candidate.candidate_title}
                  </h2>

                  <p className="mt-3 text-sm text-zinc-400">
                    {candidate.matched_text}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-3">
                    <a
                      href={candidate.candidate_url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:text-white"
                    >
                      Open candidate
                    </a>

                    <form action="/api/approve-candidate" method="post">
                      <input
                        type="hidden"
                        name="id"
                        value={candidate.id}
                      />
                      <button
                        type="submit"
                        className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white"
                      >
                        Approve
                      </button>
                    </form>

                    <form action="/api/reject-candidate" method="post">
                      <input
                        type="hidden"
                        name="id"
                        value={candidate.id}
                      />
                      <button
                        type="submit"
                        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white"
                      >
                        Reject
                      </button>
                    </form>
                  </div>
                </article>
              )
            })
          ) : (
            <p className="text-zinc-400">No new candidates.</p>
          )}
        </div>
      </section>
    </main>
  )
}