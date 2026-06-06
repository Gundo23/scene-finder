import Link from 'next/link'
import FallbackImage from '@/app/components/FallbackImage'

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md text-center">

        <p className="mb-6 text-sm uppercase tracking-[0.4em] text-blue-400">
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
          <p className="text-lg font-medium text-zinc-200">
            Find clubs. Discover events.
          </p>

          <p className="mt-1 text-lg font-medium text-zinc-200">
            Explore the scene.
          </p>
        </div>

        <div className="space-y-4">

          <Link
            href="/venues"
            className="block rounded-2xl bg-blue-600 py-5 text-xl font-bold text-white shadow-lg transition hover:bg-blue-500 hover:scale-[1.02]"
          >
            Clubs
          </Link>

          <Link
            href="/events"
            className="block rounded-2xl border border-blue-500 bg-transparent py-5 text-xl font-bold text-blue-300 transition hover:bg-blue-500 hover:text-white hover:scale-[1.02]"
          >
            Events
          </Link>

          <Link
            href="/submit"
            className="block rounded-2xl border border-blue-500 bg-zinc-900 py-5 text-xl font-bold text-blue-300 transition hover:bg-blue-500 hover:text-white hover:scale-[1.02]"
          >
            Submit Club / Venue
          </Link>

        </div>

      </div>
    </main>
  )
}