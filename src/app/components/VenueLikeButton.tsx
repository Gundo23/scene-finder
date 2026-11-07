'use client'

import { useEffect, useId, useRef, useState } from 'react'
import Icon from '@/app/components/Icon'

export default function VenueLikeButton({
  venueId,
  initialLikeCount,
  venueName = 'venue',
}: {
  venueId: string
  initialLikeCount: number
  venueName?: string
}) {
  const [likeCount, setLikeCount] = useState(Number(initialLikeCount || 0))
  const [liked, setLiked] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const savingRef = useRef(false)
  const errorId = useId()
  const storageKey = `scene-finder:liked:${venueId}`

  useEffect(() => {
    try {
      setLiked(window.localStorage.getItem(storageKey) === '1')
    } catch {
      // The heart still works when private browsing blocks local storage.
    }
  }, [storageKey])

  useEffect(() => {
    if (!savingRef.current) setLikeCount(Number(initialLikeCount || 0))
  }, [initialLikeCount])

  async function likeVenue() {
    if (savingRef.current || liked || !venueId) return

    const previousCount = likeCount
    savingRef.current = true
    setError('')
    setLiked(true)
    setSaving(true)
    setLikeCount(previousCount + 1)

    try {
      const response = await fetch(`/api/venues/${encodeURIComponent(venueId)}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      const data = await response.json()
      if (!response.ok || typeof data.like_count !== 'number') {
        throw new Error('The like could not be saved.')
      }

      setLikeCount(data.like_count)
      try {
        window.localStorage.setItem(storageKey, '1')
      } catch {
        // Storage is only a convenience; the server has already saved the like.
      }
    } catch {
      setLiked(false)
      setLikeCount(previousCount)
      setError('Could not save. Please try again.')
    } finally {
      savingRef.current = false
      setSaving(false)
    }
  }

  return (
    <span className="inline-flex flex-col items-end gap-1">
      <button
        type="button"
        aria-label={`${liked ? 'Liked' : 'Like'} ${venueName}, ${likeCount} ${likeCount === 1 ? 'like' : 'likes'}`}
        aria-pressed={liked}
        aria-busy={saving}
        aria-describedby={error ? errorId : undefined}
        disabled={liked || saving}
        title={liked ? 'You have liked this venue on this device' : 'Like this venue'}
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          void likeVenue()
        }}
        className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full border px-3 text-sm font-semibold tabular-nums transition-colors disabled:cursor-default ${liked ? 'border-pink-400/30 bg-pink-500/10 text-pink-300' : 'border-zinc-700/80 bg-zinc-950/70 text-zinc-300 hover:border-pink-400/60 hover:text-pink-300'}`}
      >
        <Icon name="heart" className={`h-4 w-4 ${liked ? 'fill-pink-400/25' : ''}`} />
        <span>{likeCount}</span>
        {saving && <span className="sr-only">Saving</span>}
      </button>
      <span id={errorId} role="status" className={error ? 'max-w-40 text-right text-xs leading-4 text-pink-300' : 'sr-only'}>
        {error || (liked && !saving ? 'Like saved' : '')}
      </span>
    </span>
  )
}
