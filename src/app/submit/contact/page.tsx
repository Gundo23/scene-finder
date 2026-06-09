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
          Contact & Support
        </h1>

        <p className="mb-8 text-center text-zinc-400">
          Need help or found an issue? Let us know.
        </p>

        {success ? (
          <div className="rounded-xl border border-green-700 bg-green-950 p-6">
            <h2 className="text-xl font-semibold">
              Message received
            </h2>
            <p className="mt-2 text-zinc-300">
              Thank you. We will review your message shortly.
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
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 p-3"
            />

            <input
              name="email"
              type="email"
              required
              placeholder="Your email"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 p-3"
            />

            <textarea
              name="message"
              rows={6}
              required
              placeholder="Tell us more..."
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 p-3"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-500 px-4 py-3 font-medium text-white disabled:opacity-60"
            >
              {loading ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        )}
      </div>
    </main>
  )
}