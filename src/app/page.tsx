import Link from 'next/link'
import FallbackImage from '@/app/components/FallbackImage'

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md text-center">

        <p className="mb-2 text-sm uppercase tracking-[0.3em] text-blue-400">
          Scene Finder
        </p>

        <div className="mb-10 flex justify-center">
          <div className="h-40 w-40 rounded-3xl border border-zinc-800 bg-zinc-900 p-5 shadow-2xl">
            <FallbackImage
              src="/images/home-hero.jpg"
              fallbackSrc="/images/venue-placeholder.jpg"
              alt="Scene Finder"
              className="h-full w-full object-contain"
            />
          </div>
        </div>

        <div className="space-y-4">

          <Link
            href="/venues"
            className="block rounded-2xl bg-yellow-500 py-5 text-xl font-bold text-white shadow-lg transition hover:scale-[1.02]"
          >
            Clubs
          </Link>

          <Link
            href="/events"
            className="block rounded-2xl bg-emerald-500 py-5 text-xl font-bold text-white shadow-lg transition hover:scale-[1.02]"
          >
            Events
          </Link>

          <Link
            href="/submit"
            className="block rounded-2xl bg-fuchsia-500 py-5 text-xl font-bold text-white shadow-lg transition hover:scale-[1.02]"
          >
            Submit Club / Venue
          </Link>

        </div>

      </div>
    </main>
  )
}