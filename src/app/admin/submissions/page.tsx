'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  async function loadSubmissions() {
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
    loadSubmissions()
  }, [])

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-6 text-3xl font-bold">Submissions</h1>

        {loading && <p className="text-zinc-400">Loading...</p>}

        <div className="space-y-4">
          {submissions.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-zinc-800 bg-zinc-900 p-5"
            >
              <p className="text-sm uppercase text-blue-400">{item.type}</p>
              <h2 className="mt-1 text-xl font-semibold">{item.name}</h2>

              {item.location && <p className="mt-2 text-zinc-400">{item.location}</p>}

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
                <p className="mt-2 text-zinc-300">Date: {item.event_date}</p>
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