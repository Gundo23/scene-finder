'use client'

import { useState } from 'react'

function usableImageUrl(value: string | null | undefined): string | null {
  const raw = (value || '').trim().replace(/&amp;/gi, '&')
  if (!raw) return null
  if (raw.startsWith('/') && !raw.startsWith('//') && !raw.includes('\\')) return raw
  try {
    const parsed = new URL(raw)
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return null
    // Instagram/Facebook media URLs are short-lived signed CDN links.
    if (/(^|\.)(?:cdninstagram\.com|fbcdn\.net)$/i.test(parsed.hostname)) return null
    return parsed.href
  } catch {}
  return null
}

type ImageDisplayProps = {
  alt: string
  className?: string
  loading?: 'eager' | 'lazy'
  fetchPriority?: 'high' | 'low' | 'auto'
}

type FallbackImageProps = ImageDisplayProps & {
  src?: string | null
  fallbackSrc: string
  fallbackSources?: Array<string | null | undefined>
}

function ImageCandidates({ candidates, ...props }: ImageDisplayProps & { candidates: string[] }) {
  const [index, setIndex] = useState(0)
  const [allFailed, setAllFailed] = useState(false)

  if (allFailed || candidates.length === 0) {
    return <span role="img" aria-label={props.alt || 'Scene Finder image unavailable'} className={`${props.className || ''} flex items-center justify-center bg-zinc-950 text-center text-xs font-semibold tracking-widest text-zinc-500`}>SCENE FINDER</span>
  }

  return (
    <img
      key={candidates[index]}
      {...props}
      src={candidates[index]}
      decoding="async"
      onError={() => {
        if (index + 1 < candidates.length) {
          setIndex((current) => current === index ? index + 1 : current)
        } else {
          setAllFailed(true)
        }
      }}
    />
  )
}

export default function FallbackImage({
  src,
  fallbackSrc,
  fallbackSources = [],
  loading = 'lazy',
  ...props
}: FallbackImageProps) {
  const candidates = [...new Set(
    [src, ...fallbackSources, fallbackSrc, '/images/scene-finder-logo-transparent.png']
      .map(usableImageUrl)
      .filter((value): value is string => value !== null)
  )]

  // A changed list starts at its first image immediately. Equivalent arrays
  // retain the current fallback, without an effect flashing the previous image.
  return <ImageCandidates key={JSON.stringify(candidates)} candidates={candidates} loading={loading} {...props} />
}
