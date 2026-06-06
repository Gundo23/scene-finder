'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function BottomNav() {
  const router = useRouter()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-800 bg-zinc-950/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl justify-around py-2 text-white">

        <Link
          href="/"
          className="flex flex-col items-center text-xs text-blue-400"
        >
          <span className="text-lg">⌂</span>
          Home
        </Link>

        <Link
          href="/venues"
          className="flex flex-col items-center text-xs"
        >
          <span className="text-lg">🏢</span>
          Clubs
        </Link>

        <Link
          href="/events"
          className="flex flex-col items-center text-xs"
        >
          <span className="text-lg">📅</span>
          Events
        </Link>

        <Link
          href="/submit"
          className="flex flex-col items-center text-xs"
        >
          <span className="text-lg">➕</span>
          Submit
        </Link>

        <button
          onClick={() => router.back()}
          className="flex flex-col items-center text-xs"
        >
          <span className="text-lg">←</span>
          Back
        </button>

      </div>
    </nav>
  )
}