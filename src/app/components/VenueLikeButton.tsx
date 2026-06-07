'use client'

import { useState } from 'react'

export default function VenueLikeButton({
  venueId,
  initialLikeCount,
}: {
  venueId: string
  initialLikeCount: number
}) {
  const [likeCount, setLikeCount] = useState(initialLikeCount)
  const [liked, setLiked] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleLike(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault()
    event.stopPropagation()

    if (loading || liked) return

    setLoading(true)

    try {
      const response = await fetch(`/api/venues/${venueId}/like`, {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.error || 'Could not like venue')
      }

      setLikeCount(Number(data.like_count || likeCount + 1))
      setLiked(true)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleLike}
      disabled={loading || liked}
      aria-label={liked ? 'Venue liked' : 'Like venue'}
      className="inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-sm font-medium text-zinc-300 transition hover:border-pink-500 hover:text-pink-300 disabled:cursor-default disabled:opacity-90"
    >
      <span className={liked ? 'text-pink-400' : 'text-zinc-400'}>
        {liked ? '♥' : '♡'}
      </span>
      <span>{likeCount}</span>
    </button>
  )
}
