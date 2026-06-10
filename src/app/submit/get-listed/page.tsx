'use client'

import { FormEvent, useState } from 'react'
import { supabase } from '@/lib/supabase'
import FallbackImage from '@/app/components/FallbackImage'

export default function GetListedPage() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)

    const formData = new FormData(event.currentTarget)

    const payload = {
      type: String(formData.get('type') || ''),
      name: String(formData.get('name') || ''),
      hosted_at: String(formData.get('hosted_at') || ''),
      website: String(formData.get('website') || ''),
      event_date: formData.get('event_date')
        ? String(formData.get('event_date'))
        : null,
      location: String(formData.get('location') || ''),
      contact_name: String(formData.get('contact_name') || ''),
      submitter_email: String(formData.get('submitter_email') || ''),
      notes: String(formData.get('notes') || ''),
      status: 'pending',
    }

    const { error } = await supabase
      .from('submissions')
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
        <div className="overflow-hidden rounded-3xl border border-blue-500/30 bg-gradient-to-br from-zinc-900 via-zinc-950 to-blue-950/30 p-6 text-center shadow-2xl shadow-blue-950/30 ring-1 ring-blue-500/20 sm:p-10">
          <div className="mx-auto mb-6 flex h-28 w-28 items-center justify-center rounded-full border border-blue-500/20 bg-black/35 shadow-2xl shadow-blue-950/20">
            <FallbackImage
              src="/images/home-hero.jpg"
              fallbackSrc="/images/venue-placeholder.jpg"
              alt="Scene Finder"
              className="h-24 w-24 object-contain"
            />
          </div>

          <p className="text-xs font-black uppercase tracking-[0.45em] text-blue-300">
            Scene Finder
          </p>

          <h1 className="mt-4 text-4xl font-black tracking-tight text-white sm:text-5xl">
            Get Listed on Scene Finder
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-zinc-300 sm:text-lg">
            Own a venue, host events, or need to update an existing listing?
            Send us the details and we'll review your request.
          </p>

          <div className="mx-auto mt-7 grid max-w-3xl gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-blue-500/20 bg-black/35 px-4 py-3">
              <p className="text-lg font-black text-white">Venues</p>
              <p className="mt-1 text-xs text-zinc-400">New listings</p>
            </div>

            <div className="rounded-2xl border border-purple-500/20 bg-black/35 px-4 py-3">
              <p className="text-lg font-black text-white">Events</p>
              <p className="mt-1 text-xs text-zinc-400">Submit dates</p>
            </div>

            <div className="rounded-2xl border border-pink-500/20 bg-black/35 px-4 py-3">
              <p className="text-lg font-black text-white">Updates</p>
              <p className="mt-1 text-xs text-zinc-400">Fix old info</p>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-blue-500/20 bg-black/35 p-5 text-center shadow-2xl shadow-blue-950/10 ring-1 ring-blue-500/10">
          <p className="text-sm leading-6 text-zinc-400">
            All submissions are manually reviewed before publication or changes
            are made. Please include official links wherever possible.
          </p>
        </div>

        <div className="mt-6">
          {success ? (
            <div className="rounded-3xl border border-green-500/30 bg-gradient-to-br from-green-950/70 to-zinc-900 p-8 shadow-2xl shadow-green-950/20 ring-1 ring-green-500/20">
              <h2 className="text-2xl font-black text-white">
                Submission Received ✓
              </h2>

              <p className="mt-3 leading-7 text-zinc-300">
                Thank you. Your listing request has been received and is now
                awaiting review.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="rounded-3xl border border-blue-500/20 bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 p-6 shadow-2xl shadow-blue-950/20 ring-1 ring-blue-500/10 sm:p-8"
            >
              <div className="mb-6">
                <h2 className="text-2xl font-black text-white">
                  Submit Listing Details
                </h2>

                <p className="mt-2 text-zinc-400">
                  Add a new venue, submit an event, claim a listing, or request
                  an update.
                </p>
              </div>

              <div className="space-y-4">
                <select
                  name="type"
                  required
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-3 text-white transition focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Select submission type</option>
                  <option value="venue_listing">List a New Venue</option>
                  <option value="event_submission">Submit an Event</option>
                  <option value="update_listing">Request to Update a Listing</option>
                  <option value="claim_listing">Request to Claim a Listing</option>
                </select>

                <input
                  name="name"
                  required
                  placeholder="Venue or Event Name"
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-3 text-white transition focus:border-blue-500 focus:outline-none"
                />

                <input
                  name="hosted_at"
                  placeholder="Hosted At / Venue Name"
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-3 text-white transition focus:border-blue-500 focus:outline-none"
                />

                <input
                  name="website"
                  placeholder="Website or Ticket Link"
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-3 text-white transition focus:border-blue-500 focus:outline-none"
                />

                <input
                  name="event_date"
                  type="date"
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-3 text-white transition focus:border-blue-500 focus:outline-none"
                />

                <input
                  name="location"
                  placeholder="Town / City"
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-3 text-white transition focus:border-blue-500 focus:outline-none"
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <input
                    name="contact_name"
                    placeholder="Contact Name"
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-3 text-white transition focus:border-blue-500 focus:outline-none"
                  />

                  <input
                    name="submitter_email"
                    type="email"
                    placeholder="Contact Email"
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-3 text-white transition focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <textarea
                  name="notes"
                  rows={6}
                  placeholder="Additional Information"
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-3 text-white transition focus:border-blue-500 focus:outline-none"
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl border border-blue-500 bg-gradient-to-r from-blue-500 to-purple-600 px-5 py-3 font-bold text-white shadow-lg shadow-blue-950/30 transition hover:from-blue-400 hover:to-purple-500 disabled:opacity-60"
                >
                  {loading ? 'Submitting...' : 'Submit Listing'}
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="mt-6 rounded-3xl border border-zinc-800 bg-black/30 p-5 text-center">
          <p className="text-sm leading-6 text-zinc-500">
            Scene Finder is an independent directory. Listings may be edited for
            clarity, safety, accuracy and consistency before publication.
          </p>
        </div>
      </section>
    </main>
  )
}