import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function VenueCandidatesPage() {
  const { data: candidates, error } = await supabaseAdmin
    .from('venue_candidates')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(200)

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-10 text-white">
      <section className="mx-auto max-w-6xl">
        <Link href="/admin/submissions" className="text-sm text-blue-400">
          ← Back to admin
        </Link>

        <h1 className="mt-6 text-4xl font-bold">Venue Candidates</h1>

        <p className="mt-3 text-zinc-400">
          Review Scout discoveries before adding them to Scene Finder.
        </p>

        {error ? (
          <p className="mt-6 text-red-400">{error.message}</p>
        ) : (
          <p className="mt-6 text-sm text-zinc-500">
            Showing {candidates?.length || 0} pending candidates
          </p>
        )}

        <div className="mt-6 grid gap-4">
          {candidates && candidates.length > 0 ? (
            candidates.map((candidate) => (
              <article
                key={candidate.id}
                className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-blue-400">
                      {candidate.location || 'Unknown location'} • Score:{' '}
                      {candidate.confidence_score || 0}
                    </p>

                    <h2 className="mt-2 text-xl font-semibold">
                      {candidate.name || 'Untitled candidate'}
                    </h2>

                    <p className="mt-2 break-all text-sm text-zinc-400">
                      {candidate.website}
                    </p>

                    <p className="mt-2 text-sm text-zinc-500">
                      Query: {candidate.discovery_query || 'Unknown'}
                    </p>

                    <p className="mt-1 text-sm text-zinc-500">
                      Source: {candidate.discovery_source || 'Unknown'}
                    </p>
                  </div>
                </div>

                <form
                  action="/api/admin/venue-candidates/approve"
                  method="post"
                  className="mt-5 grid gap-3 rounded-xl border border-zinc-800 bg-zinc-950 p-4"
                >
                  <input type="hidden" name="id" value={candidate.id} />

                  <label className="text-sm text-zinc-300">
                    Source type
                    <select
                      name="source_type"
                      defaultValue={candidate.source_type || 'unknown'}
                      className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white"
                    >
                      <option value="venue">Venue</option>
                      <option value="event_organiser">Event organiser</option>
                      <option value="club">Club</option>
                      <option value="social_group">Social group</option>
                      <option value="unknown">Unknown</option>
                    </select>
                  </label>

                  <label className="text-sm text-zinc-300">
                    Event source URL
                    <input
                      name="event_source_url"
                      defaultValue={
                        candidate.event_source_url ||
                        candidate.source_url ||
                        candidate.website ||
                        ''
                      }
                      className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white"
                    />
                  </label>

                  <div className="flex flex-wrap gap-3">
                    <a
                      href={candidate.website}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:text-white"
                    >
                      Open website
                    </a>

                    <button
                      type="submit"
                      className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white"
                    >
                      Approve & create venue
                    </button>
                  </div>
                </form>

                <div className="mt-3 flex flex-wrap gap-3">
                  <form action="/api/admin/venue-candidates/reject" method="post">
                    <input type="hidden" name="id" value={candidate.id} />
                    <button
                      type="submit"
                      className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white"
                    >
                      Reject
                    </button>
                  </form>

                  <form action="/api/admin/venue-candidates/delete" method="post">
                    <input type="hidden" name="id" value={candidate.id} />
                    <button
                      type="submit"
                      className="rounded-lg border border-red-700 px-4 py-2 text-sm font-medium text-red-300"
                    >
                      Delete
                    </button>
                  </form>
                </div>
              </article>
            ))
          ) : (
            <p className="text-zinc-400">No pending venue candidates.</p>
          )}
        </div>
      </section>
    </main>
  )
}