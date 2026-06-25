import Link from 'next/link'
import FallbackImage from '@/app/components/FallbackImage'

const supportActions = [
  {
    href: '/submit/get-listed',
    icon: '🏢',
    title: 'Get Listed',
    description: 'Submit a venue, event or host listing.',
    border: 'border-blue-500/30 hover:border-blue-400/70',
    bg: 'bg-blue-500/10 hover:bg-blue-500/20',
    text: 'text-blue-100',
    iconBorder: 'border-blue-400/30',
  },
  {
    href: '/submit/contact',
    icon: '🛟',
    title: 'Contact Support',
    description: 'Report issues, updates or broken links.',
    border: 'border-purple-500/30 hover:border-purple-400/70',
    bg: 'bg-purple-500/10 hover:bg-purple-500/20',
    text: 'text-purple-100',
    iconBorder: 'border-purple-400/30',
  },
  {
    href: '/submit/faq',
    icon: '❓',
    title: 'FAQ',
    description: 'Quick answers about Scene Finder.',
    border: 'border-pink-500/30 hover:border-pink-400/70',
    bg: 'bg-pink-500/10 hover:bg-pink-500/20',
    text: 'text-pink-100',
    iconBorder: 'border-pink-400/30',
  },
]

export default function SubmitPage() {
  return (
    <main className="fixed inset-0 h-[100dvh] overflow-hidden bg-zinc-950 text-white">
      <div className="relative m-3 flex h-[calc(100dvh-24px)] items-center justify-center overflow-hidden rounded-[42px] border border-blue-500/20 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 px-5 py-4 shadow-[0_0_50px_rgba(59,130,246,0.15)] ring-1 ring-purple-500/20 sm:px-8 sm:py-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.22),transparent_34%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.18),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(236,72,153,0.12),transparent_28%)]" />

        <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent" />
        <div className="pointer-events-none absolute inset-y-8 right-0 w-px bg-gradient-to-b from-transparent via-fuchsia-400 to-transparent" />
        <div className="pointer-events-none absolute inset-y-8 left-0 w-px bg-gradient-to-b from-transparent via-blue-400/70 to-transparent" />

        <section className="relative flex max-h-full w-full max-w-md flex-col items-center justify-center text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full border border-yellow-400/20 bg-black/35 shadow-2xl shadow-yellow-950/20 sm:h-24 sm:w-24">
            <FallbackImage
              src="/images/home-hero.jpg"
              fallbackSrc="/images/venue-placeholder.jpg"
              alt="Scene Finder"
              className="h-16 w-16 object-contain sm:h-20 sm:w-20"
            />
          </div>

          <p className="mb-3 text-xs font-black uppercase tracking-[0.42em] text-blue-300 sm:text-sm">
            Scene Finder
          </p>

          <h1 className="text-[1.8rem] font-black leading-[0.95] tracking-tight text-white sm:text-4xl">
            Support & Venue Submissions
          </h1>

          <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-zinc-300 sm:text-base sm:leading-7">
            Submit a venue, add an event, report an issue, or find quick answers.
          </p>

          <div className="mt-6 w-full space-y-3">
            {supportActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className={`group flex items-center gap-4 rounded-2xl border ${action.border} ${action.bg} p-4 text-left shadow-xl shadow-black/20 transition hover:-translate-y-0.5`}
              >
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${action.iconBorder} bg-black/25 text-2xl`}
                >
                  {action.icon}
                </div>

                <div className="min-w-0 flex-1">
                  <p className={`text-lg font-black ${action.text}`}>
                    {action.title}
                  </p>
                  <p className="mt-0.5 text-xs leading-5 text-zinc-400">
                    {action.description}
                  </p>
                </div>

                <div className="text-xl font-black text-white/50 transition group-hover:translate-x-1 group-hover:text-white">
                  →
                </div>
              </Link>
            ))}
          </div>

          <p className="mx-auto mt-5 max-w-sm text-xs leading-5 text-zinc-500">
            Scene Finder is an independent directory. Submitted information is reviewed
            before publication.
          </p>
        </section>
      </div>
    </main>
  )
}