import Link from 'next/link'
import FallbackImage from '@/app/components/FallbackImage'

export default function SubmitPage() {
  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-10 pb-24 text-white">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex justify-center">
          <FallbackImage
            src="/images/home-hero.jpg"
            fallbackSrc="/images/venue-placeholder.jpg"
            alt="Scene Finder"
            className="h-24 w-24 object-contain sm:h-28 sm:w-28"
          />
        </div>

        <h1 className="mb-2 text-center text-4xl font-bold">
          Support / Get Listed
        </h1>

        <p className="mb-8 text-center text-zinc-400">
          Choose what you need help with and we'll point you in the right direction.
        </p>

        <div className="grid gap-5 sm:grid-cols-2">
          <Link
            href="/submit/get-listed"
            className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 transition hover:border-blue-500"
          >
            <div className="mb-4 text-4xl">🏢</div>

            <h2 className="mb-2 text-2xl font-semibold">
              Get Listed
            </h2>

            <p className="text-zinc-400">
              Venue owners, hosts and promoters can submit listings, events and updates.
            </p>

            <div className="mt-5 font-medium text-blue-400">
              Get listed →
            </div>
          </Link>

          <Link
            href="/submit/contact"
            className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 transition hover:border-blue-500"
          >
            <div className="mb-4 text-4xl">🛟</div>

            <h2 className="mb-2 text-2xl font-semibold">
              Contact & Support
            </h2>

            <p className="text-zinc-400">
              Report incorrect information, broken links, event issues, or contact the Scene Finder team.
            </p>

            <div className="mt-5 font-medium text-blue-400">
              Contact support →
            </div>
          </Link>
        </div>
      </div>
    </main>
  )
}