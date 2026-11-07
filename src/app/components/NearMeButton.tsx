'use client'

import { useState } from 'react'

export default function NearMeButton() {
  const [state, setState] = useState<'idle' | 'loading' | 'error'>('idle')
  const [message, setMessage] = useState('')
  async function findNearby() {
    if (!navigator.geolocation) {
      setMessage('Location is unavailable in this browser. Enter a postcode instead.')
      setState('error')
      return
    }
    setState('loading')
    setMessage('')
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      try {
        // Convert a consented position into a postcode so the existing
        // postcode search, 30-mile radius and sorting remain unchanged.
        const response = await fetch(`https://api.postcodes.io/postcodes?lon=${encodeURIComponent(coords.longitude)}&lat=${encodeURIComponent(coords.latitude)}&limit=1`)
        if (!response.ok) throw new Error('Postcode lookup unavailable')
        const result = await response.json()
        const postcode = result?.result?.[0]?.postcode
        if (typeof postcode !== 'string' || !postcode) throw new Error('No nearby UK postcode')
        const url = new URL(window.location.href)
        url.searchParams.set('search', postcode)
        url.searchParams.delete('page')
        window.location.assign(url.pathname + url.search + '#results')
      } catch {
        setState('error')
        setMessage('Could not find a nearby UK postcode. Please enter one above.')
      }
    }, () => {
      setState('error')
      setMessage('Location access was unavailable or declined. You can still search by postcode.')
    }, { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 })
  }
  return (
    <div className="mt-3">
      <button type="button" onClick={findNearby} disabled={state === 'loading'} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-blue-400/35 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-100 transition hover:bg-blue-500/20 disabled:opacity-60">
        <span aria-hidden="true">◎</span>{state === 'loading' ? 'Finding nearby clubs…' : 'Use my location'}
      </button>
      {message && <p role="status" className="mt-2 text-xs leading-5 text-amber-200">{message}</p>}
      <p className="mt-1.5 text-xs text-zinc-500">Only asks for location when tapped. Finds venues within 30 miles using the existing postcode search.</p>
    </div>
  )
}
