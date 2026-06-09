'use client'

import { FormEvent, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AdminSubmissionsPage() {
  const [authenticated, setAuthenticated] = useState(false)
  const [username, setUsername] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginError, setLoginError] = useState('')

  const [submissions, setSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoginLoading(true)
    setLoginError('')

    const formData = new FormData(event.currentTarget)

    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: String(formData.get('username') || ''),
        password: String(formData.get('password') || ''),
      }),
    })

    const result = await response.json()

    setLoginLoading(false)

    if (!response.ok) {
      setLoginError(result.error || 'Login failed')
      return
    }

    setUsername(result.username || '')
    setAuthenticated(true)
  }

  async function loadSubmissions() {
    setLoading(true)

    const { data } = await supabase
      .from('submissions')
      .select('*')
      .order('created_at', { ascending: false })

    setSubmissions(data || [])
    setLoading(false)
  }

  async function handleAction(id: string, action: 'approved' | 'denied' | 'delete') {
    if (action === 'delete' && !confirm('Delete this submission?')) return

    const response = await fetch('/api/admin/submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action }),
    })

    const result = await response.json()

    if (!response.ok) {
      alert(result.error || 'Something went wrong')
      return
    }

    await loadSubmissions()
  }

  useEffect(() => {
    if (authenticated) {
      loadSubmissions()
    }
  }, [authenticated])

  if (!authenticated) {
    return (
      <main className="min-h-screen bg-zinc-950 px-4 py-10 text-white">
        <div className="mx-auto max-w-md">
          <h1 className="mb-2 text-center text-3xl font-bold">
            Admin Login
          </h1>

          <p className="mb-6 text-center text-zinc-400">
            Sign in to manage Scene Finder submissions.
          </p>

          <form
            onSubmit={handleLogin}
            className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900 p-6"
          >
            <input
              name="username"
              required
              placeholder="Username"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 p-3"
            />

            <input
              name="password"
              type="password"
              required
              placeholder="Password"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 p-3"
            />

            {loginError && (
              <p className="text-sm text-red-400">
                {loginError}
              </p>
            )}

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full rounded-lg bg-blue-500 px-4 py-3 font-medium text-white disabled:opacity-60"
            >
              {loginLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold">Submissions</h1>
            <p className="mt-1 text-sm text-zinc-400">
              Signed in as {username}
            </p>
          </div>

          <button
            onClick={() => {
              setAuthenticated(false)
              setUsername('')
              setSubmissions([])
            }}
            className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300"
          >
            Sign Out
          </button>
        </div>

        {loading && <p className="text-zinc-400">Loading...</p>}

        <div className="space-y-4">
          {submissions.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-zinc-800 bg-zinc-900 p-5"
            >
              <p className="text-sm uppercase text-blue-400">{item.type}</p>

              <h2 className="mt-1 text-xl font-semibold">{item.name}</h2>

              {item.hosted_at && (
                <p className="mt-2 text-zinc-400">
                  Hosted at: {item.hosted_at}
                </p>
              )}

              {item.location && (
                <p className="mt-2 text-zinc-400">
                  Location: {item.location}
                </p>
              )}

              {item.contact_name && (
                <p className="mt-2 text-zinc-400">
                  Contact: {item.contact_name}
                </p>
              )}

              {item.submitter_email && (
                <p className="mt-2 text-zinc-400">
                  Email: {item.submitter_email}
                </p>
              )}

              {item.website && (
                <a
                  href={item.website}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 block text-blue-400"
                >
                  Website ↗
                </a>
              )}

              {item.event_date && (
                <p className="mt-2 text-zinc-300">
                  Date: {item.event_date}
                </p>
              )}

              {item.notes && (
                <p className="mt-3 whitespace-pre-wrap text-zinc-300">
                  {item.notes}
                </p>
              )}

              <p className="mt-4 text-sm text-zinc-500">
                Status: {item.status}
              </p>

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  onClick={() => handleAction(item.id, 'approved')}
                  className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white"
                >
                  Approve
                </button>

                <button
                  onClick={() => handleAction(item.id, 'denied')}
                  className="rounded-lg bg-yellow-600 px-4 py-2 text-sm font-medium text-white"
                >
                  Deny
                </button>

                <button
                  onClick={() => handleAction(item.id, 'delete')}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}

          {!loading && submissions.length === 0 && (
            <p className="text-zinc-400">No submissions yet.</p>
          )}
        </div>
      </div>
    </main>
  )
}