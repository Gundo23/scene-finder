import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function extractDate(title: string) {
  const year = new Date().getFullYear()

  const match = title.match(
    /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2})\b/i
  )

  if (!match) return null

  const months: Record<string, string> = {
    jan: '01',
    feb: '02',
    mar: '03',
    apr: '04',
    may: '05',
    jun: '06',
    jul: '07',
    aug: '08',
    sep: '09',
    oct: '10',
    nov: '11',
    dec: '12',
  }

  return `${year}-${months[match[1].toLowerCase()]}-${match[2].padStart(2, '0')}`
}

function cleanEventName(title: string) {
  let cleaned = title
    .replace(/&amp;/g, '&')
    .replace(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2}\b/i, '')
    .replace(/CUPIDS SWINGERS CLUB.*$/i, '')
    .replace(/\s+/g, ' ')
    .trim()

  const repeatedWords = cleaned.split(' ')
  const midpoint = Math.floor(repeatedWords.length / 2)

  const firstHalf = repeatedWords.slice(0, midpoint).join(' ')
  const secondHalf = repeatedWords.slice(midpoint).join(' ')

  if (
    firstHalf.length > 5 &&
    secondHalf.toLowerCase().includes(firstHalf.toLowerCase())
  ) {
    cleaned = firstHalf
  }

  const sentenceMarkers = [
    ' new ',
    ' our ',
    ' who ',
    ' what ',
    ' these ',
    ' a night ',
    ' come ',
    ' the legendary ',
  ]

  for (const marker of sentenceMarkers) {
    const index = cleaned.toLowerCase().indexOf(marker)
    if (index > 8) {
      cleaned = cleaned.slice(0, index).trim()
      break
    }
  }

  return cleaned || 'Untitled Event'
}

export async function POST(request: Request) {
  const formData = await request.formData()
  const id = formData.get('id')

  if (!id) {
    return NextResponse.redirect(
      new URL('/admin/candidates?error=missing-id', request.url)
    )
  }

  const { data: candidate } = await supabaseAdmin
    .from('event_candidates')
    .select('*')
    .eq('id', id)
    .single()

  if (!candidate) {
    return NextResponse.redirect(
      new URL('/admin/candidates?error=not-found', request.url)
    )
  }

  await supabaseAdmin.from('events').insert({
    venue_id: candidate.venue_id,
    event_name: cleanEventName(candidate.candidate_title || 'Untitled Event'),
    event_date: extractDate(candidate.candidate_title || ''),
    event_type: 'Club Night',
    description: candidate.matched_text,
    ticket_url: candidate.candidate_url,
    source_url: candidate.source_url,
    status: 'published',
  })

  await supabaseAdmin
    .from('event_candidates')
    .update({ status: 'approved' })
    .eq('id', id)

  return NextResponse.redirect(new URL('/admin/candidates', request.url))
}