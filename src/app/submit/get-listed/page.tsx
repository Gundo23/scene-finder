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
    <main className="min-h-screen bg-zinc-950 px-4 py-10 pb-24 text-white">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex justify-center">
          <FallbackImage
            src="/images/home-hero.jpg"
            fallbackSrc="/images/venue-placeholder.jpg"
            alt="Scene Finder"
            className="h-24 w-24 object-contain sm:h-28 sm:w-28"
          />
        </div>

        <h1 className="mb-2 text-center text-4xl font-bold">
          Get Listed on Scene Finder
        </h1>

        <p className="mb-4 text-center text-zinc-400">
          Own a venue, host events, or need to update an existing Scene Finder listing?
        </p>

        <p className="mb-6 text-center text-zinc-400">
          Send us the details and our team will review your request.
        </p>

        <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-sm text-zinc-400">
          All submissions are manually reviewed before publication or changes are made.
        </div>

        {success ? (
          <div className="rounded-xl border border-green-700 bg-green-950 p-6">
            <h2 className="text-xl font-semibold">
              Submission received
            </h2>
            <p className="mt-2 text-zinc-300">
              Thank you. Your listing request is now awaiting review.
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900 p-6"
          >
            <select
              name="type"
              required
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 p-3"
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
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 p-3"
            />

            <input
              name="hosted_at"
              placeholder="Hosted At / Venue Name"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 p-3"
            />

            <input
              name="website"
              placeholder="Website or Ticket Link"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 p-3"
            />

            <input
              name="event_date"
              type="date"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 p-3"
            />

            <input
              name="location"
              placeholder="Town / City"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 p-3"
            />

            <input
              name="contact_name"
              placeholder="Contact Name"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 p-3"
            />

            <input
              name="submitter_email"
              type="email"
              placeholder="Contact Email"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 p-3"
            />

            <textarea
              name="notes"
              rows={5}
              placeholder="Additional Information"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 p-3"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-500 px-4 py-3 font-medium text-white disabled:opacity-60"
            >
              {loading ? 'Submitting...' : 'Submit Listing'}
            </button>
          </form>
        )}
      </div>
    </main>
  )
}
