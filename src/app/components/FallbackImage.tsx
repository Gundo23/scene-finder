'use client'

import { useEffect, useState } from 'react'

function usableImageUrl(value: string | null | undefined, fallback: string) {
  const raw = (value || '').trim().replace(/&amp;/gi, '&')
  if (!raw) return fallback
  // Instagram/Facebook media URLs are short-lived signed CDN links.
  if (/^https?:\/\/[^/]*(?:cdninstagram\.com|fbcdn\.net)(?:\/|$)/i.test(raw)) return fallback
  if (raw.startsWith('/')) return raw
  try {
    const parsed = new URL(raw)
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') return parsed.href
  } catch {}
  return fallback
}

export default function FallbackImage({
  src,
  fallbackSrc,
  alt,
  className,
}: {
  src?: string | null
  fallbackSrc: string
  alt: string
  className?: string
}) {
  const [imageSrc, setImageSrc] = useState(() => usableImageUrl(src, fallbackSrc))

  useEffect(() => {
    setImageSrc(usableImageUrl(src, fallbackSrc))
  }, [src, fallbackSrc])

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
      onError={() => {
        if (imageSrc !== fallbackSrc) setImageSrc(fallbackSrc)
      }}
    />
  )
}
