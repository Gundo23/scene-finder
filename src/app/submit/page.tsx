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
    <main className="relative h-[100dvh] overflow-hidden bg-zinc-950 px-4 pb-24 pt-6 text-white sm:px-6 sm:py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.20),transparent_34%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.18),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(236,72,153,0.13),transparent_30%)]" />

      <section className="relative mx-auto flex h-full max-w-2xl items-center">
        <div className="w-full overflow-hidden rounded-3xl border border-blue-500/30 bg-gradient-to-br from-zinc-900 via-zinc-950 to-purple-950/30 p-5 text-center shadow-2xl shadow-blue-950/40 ring-1 ring-purple-500/20 sm:p-8">
          <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full border border-yellow-400/20 bg-black/35 shadow-2xl shadow-yellow-950/20 sm:h-28 sm:w-28">
            <FallbackImage
              src="/images/home-hero.jpg"
              fallbackSrc="/images/venue-placeholder.jpg"
              alt="Scene Finder"
              className="h-20 w-20 object-contain sm:h-24 sm:w-24"
            />
          </div>

          <p className="text-xs font-black uppercase tracking-[0.42em] text-blue-300">
            Scene Finder
          </p>

          <h1 className="mt-3 text-4xl font-black leading-[0.95] tracking-tight text-white sm:text-5xl">
            Support & Venue Submissions
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-zinc-300 sm:text-base sm:leading-7">
            Help keep Scene Finder accurate, up to date and growing. Submit a venue,
            add an event, report an issue, or find quick answers.
          </p>

          <div className="mt-6 grid gap-3">
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
                  <p className="mt-0.5 text-xs leading-5 text-zinc-400 sm:text-sm">
                    {action.description}
                  </p>
                </div>

                <div className="text-xl font-black text-white/50 transition group-hover:translate-x-1 group-hover:text-white">
                  →
                </div>
              </Link>
            ))}
          </div>

          <p className="mx-auto mt-5 max-w-xl text-xs leading-5 text-zinc-500">
            Scene Finder is an independent directory. Submitted information is reviewed
            before publication and may be edited for accuracy, safety and consistency.
          </p>
        </div>
      </section>
    </main>
  )
}