'use client'

import { FormEvent, Suspense, useRef, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Icon from '@/app/components/Icon'

const requestTypes = [
  { value: 'report_problem', label: 'Report a problem' },
  { value: 'broken_link', label: 'Broken link' },
  { value: 'incorrect_information', label: 'Incorrect information' },
  { value: 'general_contact', label: 'General enquiry' },
]

export default function ContactPage() {
  return (
    <main className="relative isolate min-h-[75dvh] bg-zinc-950 px-4 pt-6 pb-8 text-white sm:px-6 sm:pt-8">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-96 bg-[radial-gradient(ellipse_at_top,rgba(168,85,247,0.12),transparent_70%)]" />
      <section className="mx-auto max-w-2xl">
        <Link href="/submit" className="mb-6 inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-medium text-zinc-400 transition-colors hover:text-white"><Icon name="arrow-left" className="h-4 w-4" />Help & support</Link>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-purple-300">Scene Finder</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Contact & support</h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-400 sm:text-base">Spotted something that needs fixing? Share the details and we’ll review it.</p>
        <Suspense fallback={<div role="status" aria-busy="true" className="mt-7 h-96 animate-pulse rounded-2xl border border-zinc-800 bg-zinc-900/40"><span className="sr-only">Loading contact form</span></div>}>
          <ContactFormFromQuery />
        </Suspense>
      </section>
    </main>
  )
}

function ContactFormFromQuery() {
  const searchParams = useSearchParams()
  const type = searchParams.get('type') || ''
  const initialType = requestTypes.some((item) => item.value === type) ? type : ''
  const initialMessage = (searchParams.get('message') || '').slice(0, 5000)

  return <ContactForm key={`${initialType}:${initialMessage}`} initialType={initialType} initialMessage={initialMessage} />
}

function ContactForm({ initialType, initialMessage }: { initialType: string; initialMessage: string }) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const submitting = useRef(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting.current) return

    const form = event.currentTarget
    const formData = new FormData(form)
    const payload = {
      type: String(formData.get('type') || '').trim(),
      name: String(formData.get('name') || '').trim(),
      email: String(formData.get('email') || '').trim(),
      message: String(formData.get('message') || '').trim(),
      status: 'pending',
    }

    if (!requestTypes.some((item) => item.value === payload.type) || !payload.name || !payload.email || !payload.message) {
      setErrorMessage('Please complete each field before sending your message.')
      return
    }

    submitting.current = true
    setLoading(true)
    setErrorMessage('')

    try {
      const { error } = await supabase.from('contact_requests').insert(payload)
      if (error) throw error
    } catch {
      setErrorMessage('Your message could not be sent. Please try again — your details are still here.')
      submitting.current = false
      setLoading(false)
      return
    }

    // The message is saved even if the separate admin notification is delayed.
    setSuccess(true)
    setLoading(false)
    form.reset()

    try {
      const response = await fetch('/api/admin-notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: 'New Scene Finder contact request',
          heading: 'New Contact & Support Request',
          replyTo: payload.email,
          message: [
            `Type: ${formatRequestType(payload.type)}`,
            `Name: ${payload.name}`,
            `Email: ${payload.email}`,
            '',
            'Message:',
            payload.message,
          ].join('\n'),
        }),
      })
      if (!response.ok) console.error('Support message saved; admin notification was not delivered.')
    } catch {
      console.error('Support message saved; admin notification was not delivered.')
    }
  }

  if (success) {
    return (
      <div role="status" className="mt-7 rounded-2xl border border-emerald-400/25 bg-emerald-400/5 p-6 sm:p-8">
        <span className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-300"><Icon name="check" className="h-5 w-5" /></span>
        <h2 className="text-2xl font-bold tracking-tight">Message received</h2>
        <p className="mt-3 text-sm leading-6 text-zinc-300">Thank you. Your message has been saved for the team to review.</p>
        <Link href="/venues" className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-blue-500/15 px-4 py-2 text-sm font-bold text-blue-200 transition-colors hover:bg-blue-500/25">Back to exploring<Icon name="arrow-right" className="h-4 w-4" /></Link>
      </div>
    )
  }

  const fieldClass = 'mt-2 min-h-12 w-full rounded-xl border border-zinc-700 bg-zinc-950/80 px-3 py-3 text-base text-white transition-colors placeholder:text-zinc-500 focus:border-purple-400 focus:outline-none'

  return (
    <form onSubmit={handleSubmit} aria-busy={loading} aria-describedby={errorMessage ? 'contact-error' : undefined} className="mt-7 rounded-2xl border border-purple-400/20 bg-zinc-900/40 p-5 sm:p-7">
      {initialMessage && <p className="mb-5 rounded-xl border border-blue-400/20 bg-blue-400/5 px-3 py-3 text-sm leading-6 text-blue-200">We’ve added the listing details below. Please tell us what needs changing.</p>}
      <div className="space-y-5">
        <div>
          <label htmlFor="contact-type" className="text-sm font-semibold text-zinc-200">What can we help with?</label>
          <select id="contact-type" name="type" defaultValue={initialType} required className={fieldClass}>
            <option value="">Choose a topic</option>
            {requestTypes.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="contact-name" className="text-sm font-semibold text-zinc-200">Your name</label>
            <input id="contact-name" name="name" autoComplete="name" required maxLength={200} className={fieldClass} />
          </div>
          <div>
            <label htmlFor="contact-email" className="text-sm font-semibold text-zinc-200">Email address</label>
            <input id="contact-email" name="email" type="email" autoComplete="email" required maxLength={254} className={fieldClass} />
          </div>
        </div>
        <div>
          <label htmlFor="contact-message" className="text-sm font-semibold text-zinc-200">Your message</label>
          <textarea id="contact-message" name="message" rows={7} defaultValue={initialMessage} required maxLength={5000} placeholder="Include the venue or event and what needs updating…" className={`${fieldClass} resize-y leading-6`} />
        </div>
        {errorMessage && <p id="contact-error" role="alert" className="rounded-xl border border-pink-400/25 bg-pink-500/10 p-3 text-sm leading-6 text-pink-200">{errorMessage}</p>}
        <button type="submit" disabled={loading} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-950/25 transition hover:from-blue-400 hover:to-purple-500 disabled:cursor-wait disabled:opacity-60">
          {loading ? 'Sending your message…' : 'Send message'}
          {!loading && <Icon name="arrow-right" className="h-4 w-4" />}
        </button>
        <p className="text-xs leading-5 text-zinc-500">All fields are required. Messages are reviewed by the Scene Finder team.</p>
      </div>
    </form>
  )
}

function formatRequestType(type: string) {
  return type.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
}
