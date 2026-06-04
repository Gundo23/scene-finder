'use client'

import { FormEvent, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function SubmitPage() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)

    const formData = new FormData(event.currentTarget)

    const payload = {
      type: String(formData.get('type') || ''),
      name: String(formData.get('name') || ''),
      website: String(formData.get('website') || ''),
      event_date: formData.get('event_date')
        ? String(formData.get('event_date'))
        : null,
      location: String(formData.get('location') || ''),
      notes: String(formData.get('notes') || ''),
      submitter_email: String(formData.get('submitter_email') || ''),
      status: 'pending',
    }

    const { error } = await supabase.from('submissions').insert(payload)

    setLoading(false)

    if (error) {
      alert(error.message)
      return
    }

    setSuccess(true)
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-10 text-white">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-2 text-4xl font-bold">Submit a Club or Event</h1>

        <p className="mb-8 text-zinc-400">
          Missing something from Scene Finder? Send it to us for review.
        </p>

        {success ? (
          <div className="rounded-xl border border-green-700 bg-green-950 p-6">
            <h2 className="text-xl font-semibold">Submission received</h2>
            <p className="mt-2 text-zinc-300">
              Thank you. Your submission is now awaiting approval.
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
              <option value="">Select type</option>
              <option value="club">Club</option>
              <option value="event">Event</option>
            </select>

            <input
              name="name"
              required
              placeholder="Club or Event Name"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 p-3"
            />

            <input
              name="website"
              placeholder="Website URL"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 p-3"
            />

            <input
              name="event_date"
              type="date"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 p-3"
            />

            <input
              name="location"
              placeholder="Location"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 p-3"
            />

            <textarea
              name="notes"
              rows={5}
              placeholder="Additional information"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 p-3"
            />

            <input
              name="submitter_email"
              type="email"
              placeholder="Email optional"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 p-3"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-500 px-4 py-3 font-medium text-white disabled:opacity-60"
            >
              {loading ? 'Submitting...' : 'Submit'}
            </button>
          </form>
        )}
      </div>
    </main>
  )
}