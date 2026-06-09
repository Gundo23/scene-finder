import Link from 'next/link'
import FallbackImage from '@/app/components/FallbackImage'

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center px-6">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-blue-500/30 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 p-8 shadow-2xl shadow-blue-950/40 ring-1 ring-purple-500/20">

        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.22),transparent_34%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.18),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(236,72,153,0.12),transparent_28%)]" />

        <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent" />

        <div className="pointer-events-none absolute inset-y-8 right-0 w-px bg-gradient-to-b from-transparent via-fuchsia-400 to-transparent" />

        <div className="relative text-center">

          <p className="mb-6 text-sm font-bold uppercase tracking-[0.4em] text-blue-300">
            Scene Finder
          </p>

          <div className="mb-8 flex justify-center">
            <FallbackImage
              src="/images/home-hero.jpg"
              fallbackSrc="/images/venue-placeholder.jpg"
              alt="Scene Finder"
              className="w-64 max-w-full object-contain"
            />
          </div>

          <div className="mb-10">
            <p className="text-xl font-semibold text-zinc-100">
              Find clubs. Discover events.
            </p>

            <p className="mt-2 text-xl font-semibold text-zinc-100">
              Explore the scene.
            </p>
          </div>

          <div className="space-y-4">

            <Link
              href="/venues"
              className="block rounded-2xl border border-blue-400 bg-gradient-to-r from-blue-500 to-purple-600 py-5 text-xl font-bold text-white shadow-lg shadow-blue-500/25 transition hover:-translate-y-1 hover:shadow-blue-500/40"
            >
              Clubs
            </Link>

            <Link
              href="/events"
              className="block rounded-2xl border border-purple-400/50 bg-purple-500/10 py-5 text-xl font-bold text-purple-200 shadow-lg shadow-purple-500/15 transition hover:-translate-y-1 hover:bg-purple-500/20 hover:shadow-purple-500/30"
            >
              Events
            </Link>

            <Link
              href="/support"
              className="block rounded-2xl border border-pink-400/50 bg-pink-500/10 py-5 text-xl font-bold text-pink-200 shadow-lg shadow-pink-500/15 transition hover:-translate-y-1 hover:bg-pink-500/20 hover:shadow-pink-500/30"
            >
              Support
            </Link>

          </div>

        </div>

      </div>
    </main>
  )
}