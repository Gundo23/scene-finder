import Link from 'next/link'
import FallbackImage from '@/app/components/FallbackImage'

const faqs = [
  {
    question: 'Is Scene Finder a venue?',
    answer:
      'No. Scene Finder is an independent directory created to help like-minded adults discover lifestyle, swingers and kink-friendly venues, events and socials across the UK.',
  },
  {
    question: 'Are events checked?',
    answer:
      'We collect information from official venue pages, event listings and organiser sources where possible. However, event details can change, so always check the official venue or organiser source before travelling, especially if a guest list, membership or booking is required.',
  },
  {
    question: 'Do you sell tickets?',
    answer:
      'No. Scene Finder does not sell tickets or take bookings. Where available, we link users to the official venue, event page, organiser or ticket source.',
  },
  {
    question: 'How do I add my venue?',
    answer:
      'Use the Get Listed form and send us the key details. Once submitted, we will review the information before adding or updating the listing.',
  },
  {
    question: 'I host events at different clubs. Can I list my events?',
    answer:
      'Yes. If you are a host, promoter or organiser who moves between venues, you can still submit your events through the Get Listed form.',
  },
  {
    question: 'How do I report wrong event information?',
    answer:
      'Use the Contact & Support form and include the venue name, event name and what needs correcting. The more detail you provide, the faster we can review it.',
  },
  {
    question: 'Do you list private parties?',
    answer:
      'Yes, but only where there is public information available or where the organiser submits the details directly. We do not publish private or sensitive information without a suitable source or submission.',
  },
  {
    question: 'Can venues pay to be promoted?',
    answer:
      'Not currently. Scene Finder is focused on building a useful UK-wide lifestyle directory. We are open to reciprocal promotion with venue owners, hosts and organisers where it makes sense.',
  },
  {
    question: 'Can I ask for my venue or event to be removed?',
    answer:
      'Yes. Contact us through the support form with the venue or event name and the reason for removal or correction. We will review the request.',
  },
  {
    question: 'How often is Scene Finder updated?',
    answer:
      'Scene Finder is updated as new information is found, submitted or corrected. Some listings may update faster than others depending on the quality of available source information.',
  },
]

export default function FAQPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-zinc-950 px-4 pb-28 pt-8 text-white sm:px-6 sm:py-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.20),transparent_34%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.18),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(236,72,153,0.13),transparent_30%)]" />

      <section className="relative mx-auto max-w-4xl">
        <Link
          href="/submit"
          className="mb-5 inline-flex items-center rounded-xl border border-blue-500/30 bg-black/30 px-4 py-2 text-sm font-bold text-blue-200 transition hover:border-blue-400/70 hover:bg-blue-500/10"
        >
          ← Back to support
        </Link>

        <div className="overflow-hidden rounded-3xl border border-pink-500/30 bg-gradient-to-br from-zinc-900 via-zinc-950 to-pink-950/25 p-6 text-center shadow-2xl shadow-pink-950/30 ring-1 ring-pink-500/20 sm:p-10">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full border border-yellow-400/20 bg-black/35 shadow-2xl shadow-yellow-950/20 sm:h-28 sm:w-28">
            <FallbackImage
              src="/images/home-hero.jpg"
              fallbackSrc="/images/venue-placeholder.jpg"
              alt="Scene Finder"
              className="h-20 w-20 object-contain sm:h-24 sm:w-24"
            />
          </div>

          <p className="text-xs font-black uppercase tracking-[0.45em] text-pink-300">
            Scene Finder FAQ
          </p>

          <h1 className="mt-4 text-4xl font-black tracking-tight text-white sm:text-5xl">
            Frequently Asked Questions
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-zinc-300 sm:text-lg">
            Quick answers about listings, events, venue submissions, private parties
            and how Scene Finder works.
          </p>
        </div>

        <div className="mt-6 space-y-4">
          {faqs.map((faq) => (
            <details
              key={faq.question}
              className="group overflow-hidden rounded-2xl border border-white/10 bg-black/35 shadow-xl shadow-black/20 ring-1 ring-white/5 open:border-pink-400/40 open:bg-zinc-950/80"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-left text-base font-black text-white transition hover:bg-white/[0.03] sm:px-6">
                <span>{faq.question}</span>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-pink-400/30 bg-pink-500/10 text-pink-200 transition group-open:rotate-45">
                  +
                </span>
              </summary>

              <div className="border-t border-white/10 px-5 py-4 sm:px-6">
                <p className="leading-7 text-zinc-300">{faq.answer}</p>
              </div>
            </details>
          ))}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Link
            href="/submit/get-listed"
            className="rounded-2xl border border-blue-500/30 bg-blue-500/10 p-5 text-center font-black text-blue-100 transition hover:border-blue-400/70 hover:bg-blue-500/20"
          >
            Submit a listing →
          </Link>

          <Link
            href="/submit/contact"
            className="rounded-2xl border border-purple-500/30 bg-purple-500/10 p-5 text-center font-black text-purple-100 transition hover:border-purple-400/70 hover:bg-purple-500/20"
          >
            Contact support →
          </Link>
        </div>

        <div className="mt-6 rounded-3xl border border-pink-500/20 bg-black/35 p-5 text-center shadow-2xl shadow-pink-950/10 ring-1 ring-pink-500/10">
          <p className="text-sm leading-6 text-zinc-400">
            Scene Finder is an independent directory. Information is provided for
            discovery only and users should always check official venue or organiser
            sources before travelling.
          </p>
        </div>
      </section>
    </main>
  )
}