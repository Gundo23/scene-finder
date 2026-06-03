'use client'

import { useState } from 'react'

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
  const [imageSrc, setImageSrc] = useState(src || fallbackSrc)

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      onError={() => setImageSrc(fallbackSrc)}
    />
  )
}