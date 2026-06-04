'use client'

import { useEffect, useState } from 'react'

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

  useEffect(() => {
    setImageSrc(src || fallbackSrc)
  }, [src, fallbackSrc])

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      onError={() => {
        if (imageSrc !== fallbackSrc) {
          setImageSrc(fallbackSrc)
        }
      }}
    />
  )
}