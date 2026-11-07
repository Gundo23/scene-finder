export default function LoadingVenues() {
  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-8 text-white sm:px-6" aria-busy="true" aria-label="Loading venues">
      <div className="mx-auto max-w-6xl">
        <p role="status" className="text-sm text-blue-200">Finding your venues…</p>
        <div aria-hidden="true" className="mt-5 space-y-5 motion-safe:animate-pulse">
          <div className="h-40 rounded-3xl border border-blue-500/15 bg-zinc-900" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/70">
                <div className="h-40 bg-zinc-800/60" />
                <div className="space-y-4 p-5">
                  <div className="h-5 w-3/4 rounded bg-zinc-800" />
                  <div className="h-3 w-1/2 rounded bg-zinc-800" />
                  <div className="h-11 rounded-xl bg-blue-950/40" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
