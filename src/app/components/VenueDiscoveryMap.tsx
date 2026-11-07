'use client'

import { useEffect, useRef, useState } from 'react'

type VenuePin = { id: string; name: string; area: string; lat: number; lng: number; href: string }
type LeafletMap = { setView: (center: number[], zoom: number) => LeafletMap; fitBounds: (bounds: number[][], options?: object) => void; remove: () => void }
type LeafletApi = {
  map: (el: HTMLElement, options: object) => LeafletMap
  tileLayer: (url: string, options: object) => { addTo: (map: LeafletMap) => void }
  marker: (point: number[]) => { addTo: (map: LeafletMap) => { bindPopup: (content: HTMLElement) => void } }
}
declare global { interface Window { L?: LeafletApi } }

let leafletPromise: Promise<LeafletApi> | null = null
function loadLeaflet(): Promise<LeafletApi> {
  if (typeof window === 'undefined') return Promise.reject(new Error('Browser required'))
  if (window.L) return Promise.resolve(window.L)
  if (leafletPromise) return leafletPromise
  leafletPromise = new Promise((resolve, reject) => {
    const css = document.createElement('link')
    css.rel = 'stylesheet'
    css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    css.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoV3U+6iH4E7wM='
    css.crossOrigin = 'anonymous'
    document.head.appendChild(css)
    const script = document.createElement('script')
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo='
    script.crossOrigin = 'anonymous'
    script.async = true
    script.onload = () => window.L ? resolve(window.L) : reject(new Error('Map library unavailable'))
    script.onerror = () => reject(new Error('Map library could not load'))
    document.head.appendChild(script)
  }).catch((error) => { leafletPromise = null; throw error })
  return leafletPromise
}

export default function VenueDiscoveryMap({ venues, totalMatches }: { venues: VenuePin[]; totalMatches: number }) {
  const node = useRef<HTMLDivElement>(null)
  const [error, setError] = useState(false)
  useEffect(() => {
    if (!node.current || !venues.length) return
    let cancelled = false
    let map: LeafletMap | undefined
    loadLeaflet().then((L) => {
      if (cancelled || !node.current) return
      map = L.map(node.current, { scrollWheelZoom: false }).setView([54.5, -3.1], 6)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors', maxZoom: 18,
      }).addTo(map)
      for (const venue of venues) {
        const popup = document.createElement('div')
        popup.style.minWidth = '140px'
        const name = document.createElement('strong')
        name.textContent = venue.name
        const area = document.createElement('p')
        area.textContent = venue.area
        area.style.margin = '5px 0'
        const link = document.createElement('a')
        link.href = venue.href
        link.textContent = 'View venue →'
        link.style.color = '#2563eb'
        popup.append(name, area, link)
        L.marker([venue.lat, venue.lng]).addTo(map).bindPopup(popup)
      }
      if (venues.length === 1) map.setView([venues[0].lat, venues[0].lng], 12)
      else map.fitBounds(venues.map((v) => [v.lat, v.lng]), { padding: [32, 32], maxZoom: 12 })
    }).catch(() => { if (!cancelled) setError(true) })
    return () => { cancelled = true; map?.remove() }
  }, [venues])
  if (!venues.length) return (
    <div className="rounded-2xl border border-zinc-700 bg-zinc-900/60 p-6 text-center">
      <p className="font-semibold">No verified public map locations for these results</p>
      <p className="mt-2 text-sm text-zinc-400">Other venues remain available in Grid or List view. Private addresses are never shown.</p>
    </div>
  )
  return (
    <section aria-label="Interactive venue map" className="overflow-hidden rounded-2xl border border-blue-500/25 bg-zinc-900">
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
        <p className="text-sm font-semibold text-white">Explore {venues.length} verified public location{venues.length === 1 ? '' : 's'}</p>
        <span className="text-xs text-zinc-400">{totalMatches > venues.length ? 'Some results have no verified public map pin' : 'Tap a pin to view a venue'}</span>
      </div>
      {error ? (
        <div role="status" className="p-8 text-center text-sm text-zinc-300">The map is temporarily unavailable. Switch to Grid or List to browse venues.</div>
      ) : <div ref={node} className="relative z-0 h-[420px] w-full bg-zinc-800 sm:h-[570px]" aria-label="Map showing verified venue locations" />}
      <p className="border-t border-zinc-800 px-4 py-3 text-xs text-zinc-400">Only verified public fixed venues appear as pins. Use Grid or List for every matching venue.</p>
    </section>
  )
}
