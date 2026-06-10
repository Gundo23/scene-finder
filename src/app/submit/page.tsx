import Link from 'next/link'
import FallbackImage from '@/app/components/FallbackImage'

export default function SubmitPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-zinc-950 px-4 pb-28 pt-8 text-white sm:px-6 sm:py-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.20),transparent_34%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.18),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(236,72,153,0.13),transparent_30%)]" />

      <section className="relative mx-auto max-w-5xl">
        <div className="overflow-hidden rounded-3xl border border-blue-500/30 bg-gradient-to-br from-zinc-900 via-zinc-950 to-purple-950/30 p-6 text-center shadow-2xl shadow-blue-950/40 ring-1 ring-purple-500/20 sm:p-10">
          <div className="mx-auto mb-6 flex h-28 w-28 items-center justify-center rounded-full border border-yellow-400/20 bg-black/35 shadow-2xl shadow-yellow-950/20 sm:h-32 sm:w-32">
            <FallbackImage
              src="/images/home-hero.jpg"
              fallbackSrc="/images/venue-placeholder.jpg"
              alt="Scene Finder"
              className="h-24 w-24 object-contain sm:h-28 sm:w-28"
            />
          </div>

          <p className="text-xs font-black uppercase tracking-[0.45em] text-blue-300">
            Scene Finder
          </p>

          <h1 className="mt-4 text-4xl font-black tracking-tight text-white sm:text-5xl">
            Support & Venue Submissions
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-zinc-300 sm:text-lg">
            Help keep Scene Finder accurate, up to date and growing. Submit a venue,
            add an event, report an issue, or contact the team.
          </p>

          <div className="mx-auto mt-7 grid max-w-3xl gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-blue-500/20 bg-black/35 px-4 py-3">
              <p className="text-lg font-black text-white">UK-wide</p>
              <p className="mt-1 text-xs text-zinc-400">Venues & events</p>
            </div>

            <div className="rounded-2xl border border-purple-500/20 bg-black/35 px-4 py-3">
              <p className="text-lg font-black text-white">Reviewed</p>
              <p className="mt-1 text-xs text-zinc-400">Before publishing</p>
            </div>

            <div className="rounded-2xl border border-pink-500/20 bg-black/35 px-4 py-3">
              <p className="text-lg font-black text-white">Updated</p>
              <p className="mt-1 text-xs text-zinc-400">As data improves</p>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <Link
            href="/submit/get-listed"
            className="group overflow-hidden rounded-3xl border border-blue-500/30 bg-gradient-to-br from-zinc-900 via-zinc-950 to-blue-950/25 p-6 shadow-2xl shadow-blue-950/25 ring-1 ring-blue-500/10 transition hover:-translate-y-1 hover:border-blue-400/70 hover:shadow-blue-900/40 sm:p-7"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-400/30 bg-blue-500/15 text-3xl shadow-lg shadow-blue-950/30">
              🏢
            </div>

            <h2 className="mt-5 text-3xl font-black tracking-tight text-white">
              Get Listed
            </h2>

            <p className="mt-3 leading-7 text-zinc-300">
              Venue owners, hosts and promoters can submit venues, events, socials
              and listing updates for review.
            </p>

            <div className="mt-6 inline-flex items-center rounded-xl border border-blue-500/40 bg-blue-500/10 px-4 py-2 text-sm font-bold text-blue-200 transition group-hover:border-blue-400 group-hover:bg-blue-500/20">
              Submit listing →
            </div>
          </Link>

          <Link
            href="/submit/contact"
            className="group overflow-hidden rounded-3xl border border-purple-500/30 bg-gradient-to-br from-zinc-900 via-zinc-950 to-purple-950/25 p-6 shadow-2xl shadow-purple-950/25 ring-1 ring-purple-500/10 transition hover:-translate-y-1 hover:border-purple-400/70 hover:shadow-purple-900/40 sm:p-7"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-purple-400/30 bg-purple-500/15 text-3xl shadow-lg shadow-purple-950/30">
              🛟
            </div>

            <h2 className="mt-5 text-3xl font-black tracking-tight text-white">
              Contact & Support
            </h2>

            <p className="mt-3 leading-7 text-zinc-300">
              Report incorrect information, broken links, event problems, image
              issues, or contact the Scene Finder team.
            </p>

            <div className="mt-6 inline-flex items-center rounded-xl border border-purple-500/40 bg-purple-500/10 px-4 py-2 text-sm font-bold text-purple-200 transition group-hover:border-purple-400 group-hover:bg-purple-500/20">
              Contact support →
            </div>
          </Link>
        </div>

        <div className="mt-6 rounded-3xl border border-pink-500/20 bg-black/35 p-5 text-center shadow-2xl shadow-pink-950/10 ring-1 ring-pink-500/10">
          <p className="text-sm leading-6 text-zinc-400">
            Scene Finder is an independent directory. Submitted information is reviewed
            before publication and may be edited for accuracy, safety and consistency.
          </p>
        </div>
      </section>
    </main>
  )
}