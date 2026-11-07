export default function EventsLoading() {
  return (
    <main className="min-h-screen bg-zinc-950 px-4 pb-8 pt-6 text-white sm:px-6 sm:pt-8">
      <div className="mx-auto max-w-6xl">
        <p role="status" className="mb-6 text-sm font-medium text-blue-200">Loading events…</p>
        <div aria-hidden="true" className="space-y-6 motion-safe:animate-pulse">
          <div className="rounded-3xl border border-blue-500/20 bg-zinc-900/60 p-5">
            <div className="h-12 rounded-xl bg-zinc-800/70" />
            <div className="mt-4 grid grid-cols-4 gap-2">
              {Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-11 rounded-xl bg-zinc-800/60" />)}
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50">
                <div className="aspect-[16/10] bg-zinc-800/60" />
                <div className="space-y-3 p-5">
                  <div className="h-3 w-2/3 rounded bg-zinc-800" />
                  <div className="h-6 w-5/6 rounded bg-zinc-800" />
                  <div className="h-4 w-1/2 rounded bg-zinc-800" />
                  <div className="h-11 rounded-xl bg-zinc-800/70" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
