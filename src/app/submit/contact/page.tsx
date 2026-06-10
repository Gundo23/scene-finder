'use client'

import { FormEvent, useState } from 'react'
import { supabase } from '@/lib/supabase'
import FallbackImage from '@/app/components/FallbackImage'

export default function ContactPage() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)

    const formData = new FormData(event.currentTarget)

    const payload = {
      type: String(formData.get('type') || ''),
      name: String(formData.get('name') || ''),
      email: String(formData.get('email') || ''),
      message: String(formData.get('message') || ''),
      status: 'pending',
    }

    const { error } = await supabase
      .from('contact_requests')
      .insert(payload)

    setLoading(false)

    if (error) {
      alert(error.message)
      return
    }

    setSuccess(true)
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-zinc-950 px-4 pb-28 pt-8 text-white sm:px-6 sm:py-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.20),transparent_34%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.18),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(236,72,153,0.13),transparent_30%)]" />

      <section className="relative mx-auto max-w-3xl">
        <div className="overflow-hidden rounded-3xl border border-purple-500/30 bg-gradient-to-br from-zinc-900 via-zinc-950 to-purple-950/30 p-6 text-center shadow-2xl shadow-purple-950/30 ring-1 ring-purple-500/20 sm:p-10">
          <div className="mx-auto mb-6 flex h-28 w-28 items-center justify-center rounded-full border border-purple-500/20 bg-black/35 shadow-2xl shadow-purple-950/20">
            <FallbackImage
              src="/images/home-hero.jpg"
              fallbackSrc="/images/venue-placeholder.jpg"
              alt="Scene Finder"
              className="h-24 w-24 object-contain"
            />
          </div>

          <p className="text-xs font-black uppercase tracking-[0.45em] text-purple-300">
            Scene Finder
          </p>

          <h1 className="mt-4 text-4xl font-black tracking-tight text-white sm:text-5xl">
            Contact & Support
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-zinc-300 sm:text-lg">
            Need help, found an issue, or spotted incorrect information?
            Send us a message and we'll review it as soon as possible.
          </p>
        </div>

        <div className="mt-6">
          {success ? (
            <div className="rounded-3xl border border-green-500/30 bg-gradient-to-br from-green-950/70 to-zinc-900 p-8 shadow-2xl shadow-green-950/20 ring-1 ring-green-500/20">
              <h2 className="text-2xl font-black text-white">
                Message Received ✓
              </h2>

              <p className="mt-3 leading-7 text-zinc-300">
                Thank you for contacting Scene Finder. Your message has been
                received and will be reviewed shortly.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="rounded-3xl border border-purple-500/20 bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 p-6 shadow-2xl shadow-purple-950/20 ring-1 ring-purple-500/10 sm:p-8"
            >
              <div className="mb-6">
                <h2 className="text-2xl font-black text-white">
                  Send a Message
                </h2>

                <p className="mt-2 text-zinc-400">
                  Report issues, broken links, incorrect venue information or
                  contact the team.
                </p>
              </div>

              <div className="space-y-4">
                <select
                  name="type"
                  required
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-3 text-white transition focus:border-purple-500 focus:outline-none"
                >
                  <option value="">Select issue type</option>
                  <option value="report_problem">Report a problem</option>
                  <option value="broken_link">Broken link</option>
                  <option value="incorrect_information">
                    Incorrect information
                  </option>
                  <option value="general_contact">
                    General contact
                  </option>
                </select>

                <input
                  name="name"
                  required
                  placeholder="Your name"
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-3 text-white transition focus:border-purple-500 focus:outline-none"
                />

                <input
                  name="email"
                  type="email"
                  required
                  placeholder="Your email"
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-3 text-white transition focus:border-purple-500 focus:outline-none"
                />

                <textarea
                  name="message"
                  rows={7}
                  required
                  placeholder="Tell us more..."
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-3 text-white transition focus:border-purple-500 focus:outline-none"
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl border border-purple-500 bg-gradient-to-r from-blue-500 to-purple-600 px-5 py-3 font-bold text-white shadow-lg shadow-purple-950/30 transition hover:from-blue-400 hover:to-purple-500 disabled:opacity-60"
                >
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="mt-6 rounded-3xl border border-zinc-800 bg-black/30 p-5 text-center">
          <p className="text-sm leading-6 text-zinc-500">
            We review all submissions manually. Please include as much detail as
            possible so we can investigate and respond quickly.
          </p>
        </div>
      </section>
    </main>
  )
}