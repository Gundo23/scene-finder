'use client'

import { useRef, useState } from 'react'

export default function VenueLikeButton({
  venueId,
  initialLikeCount,
}: {
  venueId: string
  initialLikeCount: number
}) {
  const [likeCount, setLikeCount] = useState(Number(initialLikeCount || 0))
  const [liked, setLiked] = useState(false)
  const [saving, setSaving] = useState(false)
  const clickedRef = useRef(false)

  async function likeVenue() {
    if (clickedRef.current) return

    clickedRef.current = true
    setLiked(true)
    setSaving(true)
    setLikeCount((current) => current + 1)

    try {
      const response = await fetch(`/api/venues/${venueId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (response.ok && typeof data.like_count === 'number') {
        setLikeCount(data.like_count)
      }
    } catch (error) {
      console.error('Venue like failed:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <button
      type="button"
      aria-label={liked ? 'Venue liked' : 'Like venue'}
      onPointerDownCapture={(event) => {
        event.preventDefault()
        event.stopPropagation()
        likeVenue()
      }}
      onClick={(event) => {
        event.preventDefault()
        event.stopPropagation()
      }}
      className="relative z-[9999] inline-flex cursor-pointer select-none items-center gap-2 rounded-full border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-sm font-medium text-zinc-300 transition hover:border-pink-500 hover:text-pink-300"
    >
      <span className={liked ? 'text-pink-400' : 'text-zinc-400'}>
        {liked ? '♥' : '♡'}
      </span>

      <span>{likeCount}</span>

      {saving && <span className="text-xs text-zinc-500">...</span>}
    </button>
  )
}