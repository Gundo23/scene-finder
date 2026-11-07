'use client'

import { useState } from 'react'

type Props = {
  src?: string | null
  eventName: string
  date?: string | null
  className?: string
  loading?: 'eager' | 'lazy'
}

function validImage(value?: string | null) {
  const raw = (value || '').trim().replace(/&amp;/gi, '&')
  if (!raw) return null
  if (raw.startsWith('/') && !raw.startsWith('//') && !raw.includes('\\')) return raw
  try {
    const url = new URL(raw)
    if (!['https:', 'http:'].includes(url.protocol)) return null
    if (/(^|\.)(?:cdninstagram\.com|fbcdn\.net)$/i.test(url.hostname)) return null
    return url.href
  } catch {
    return null
  }
}

export default function EventArtwork({ src, eventName, date, className = '', loading = 'lazy' }: Props) {
  const url = validImage(src)
  const [failedUrl, setFailedUrl] = useState<string | null>(null)
  if (url && failedUrl !== url) {
    return <img src={url} alt={eventName + ' event artwork'} loading={loading} decoding="async" onError={() => setFailedUrl(url)} className={className} />
  }
  const label = date && /^\d{4}-\d{2}-\d{2}$/.test(date)
    ? new Date(date + 'T12:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'Europe/London' })
    : 'Upcoming event'
  return (
    <div role="img" aria-label={eventName + ' — poster not supplied'} className={`${className} relative flex min-h-0 flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#111b34] via-[#171127] to-[#241037] p-4 text-center`}>
      <span aria-hidden="true" className="absolute inset-3 rounded-xl border border-purple-300/15" />
      <span className="relative text-[10px] font-bold uppercase tracking-[0.25em] text-blue-300">Scene Finder</span>
      <span className="relative mt-3 line-clamp-3 max-w-full break-words text-sm font-bold leading-snug text-white sm:text-base">{eventName || 'Upcoming event'}</span>
      <span className="relative mt-3 rounded-full border border-purple-300/25 bg-purple-300/10 px-3 py-1 text-[10px] font-semibold text-purple-200">{label}</span>
    </div>
  )
}
