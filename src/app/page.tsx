import Link from 'next/link'
import FallbackImage from '@/app/components/FallbackImage'

export default function Home() {
  return (
    <main className="fixed inset-0 h-[100dvh] overflow-hidden bg-zinc-950 text-white">
      <div className="relative m-3 flex h-[calc(100dvh-24px)] items-center justify-center overflow-hidden rounded-[42px] border border-blue-500/20 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 px-5 py-4 shadow-[0_0_50px_rgba(59,130,246,0.15)] ring-1 ring-purple-500/20 sm:px-8 sm:py-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.22),transparent_34%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.18),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(236,72,153,0.12),transparent_28%)]" />

        <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent" />
        <div className="pointer-events-none absolute inset-y-8 right-0 w-px bg-gradient-to-b from-transparent via-fuchsia-400 to-transparent" />
        <div className="pointer-events-none absolute inset-y-8 left-0 w-px bg-gradient-to-b from-transparent via-blue-400/70 to-transparent" />

        <div className="relative flex max-h-full w-full max-w-md flex-col items-center justify-center text-center">
          <p className="mb-3 text-xs font-black uppercase tracking-[0.45em] text-blue-300 sm:text-sm">
            Scene Finder
          </p>

          <div className="mb-4 flex justify-center">
            <FallbackImage
              src="/images/scene-finder-logo-transparent.png"
              fallbackSrc="/images/home-hero.jpg"
              alt="Scene Finder"
              className="w-52 max-w-full object-contain drop-shadow-[0_0_30px_rgba(255,215,0,0.18)] sm:w-72"
            />
          </div>

          <div className="mb-5">
            <h1 className="text-[1.45rem] font-black leading-tight tracking-tight text-white sm:text-3xl">
              Find UK swinging clubs, lifestyle venues, saunas, socials and kink nights.
            </h1>

            <p className="mx-auto mt-3 max-w-sm text-sm font-bold leading-6 text-blue-200 sm:text-lg sm:leading-7">
              157 venues. 3,300+ events. Updated daily.
            </p>
          </div>

          <div className="w-full space-y-3">
            <Link
              href="/venues"
              className="block rounded-2xl border border-blue-400 bg-gradient-to-r from-blue-500 to-purple-600 py-4 text-lg font-black text-white shadow-lg shadow-blue-500/25 transition hover:-translate-y-1 hover:shadow-blue-500/40 sm:py-5 sm:text-xl"
            >
              Clubs
            </Link>

            <Link
              href="/events"
              className="block rounded-2xl border border-purple-400/50 bg-purple-500/10 py-4 text-lg font-black text-purple-200 shadow-lg shadow-purple-500/15 transition hover:-translate-y-1 hover:bg-purple-500/20 hover:shadow-purple-500/30 sm:py-5 sm:text-xl"
            >
              Events
            </Link>

            <Link
              href="/submit"
              className="block rounded-2xl border border-pink-400/50 bg-pink-500/10 py-4 text-lg font-black text-pink-200 shadow-lg shadow-pink-500/15 transition hover:-translate-y-1 hover:bg-pink-500/20 hover:shadow-pink-500/30 sm:py-5 sm:text-xl"
            >
              Support
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}