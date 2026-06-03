import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function extractDate(title: string) {
  const year = new Date().getFullYear()
  const match = title.match(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2})\b/i)

  if (!match) return null

  const months: Record<string, string> = {
    jan: '01', feb: '02', mar: '03', apr: '04',
    may: '05', jun: '06', jul: '07', aug: '08',
    sep: '09', oct: '10', nov: '11', dec: '12',
  }

  return `${year}-${months[match[1].toLowerCase()]}-${match[2].padStart(2, '0')}`
}

function cleanTitle(title: string) {
  return title
    .replace(/&amp;/g, '&')
    .replace(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2}\b/i, '')
    .replace(/CUPIDS SWINGERS CLUB.*$/i, '')
    .replace(/newbie nights.*$/i, '')
    .replace(/our .*$/i, '')
    .replace(/who .*$/i, '')
    .replace(/these .*$/i, '')
    .replace(/a night .*$/i, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function isJunk(candidateUrl: string, title: string) {
  const text = `${candidateUrl} ${title}`.toLowerCase()

  if (text.endsWith('.png')) return true
  if (text.endsWith('.jpg')) return true
  if (text.endsWith('.jpeg')) return true
  if (text.endsWith('.webp')) return true

  if (title.toLowerCase() === 'events') return true
  if (title.toLowerCase() === 'view events') return true
  if (title.toLowerCase() === 'full calendar') return true
  if (title.toLowerCase() === 'events and tickets') return true

  return false
}

export async function GET() {
  const { data: candidates, error } = await supabaseAdmin
    .from('event_candidates')
    .select('*')
    .eq('status', 'new')
    .limit(200)

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  let published = 0
  let skipped = 0

  for (const candidate of candidates || []) {
    const title = candidate.candidate_title || ''
    const url = candidate.candidate_url || ''

    if (isJunk(url, title)) {
      skipped++
      continue
    }

    const eventName = cleanTitle(title)

    if (!eventName || eventName.length < 4) {
      skipped++
      continue
    }

    const { data: existing } = await supabaseAdmin
      .from('events')
      .select('event_id')
      .eq('venue_id', candidate.venue_id)
      .eq('ticket_url', url)
      .maybeSingle()

    if (existing) {
      skipped++
      continue
    }

    await supabaseAdmin.from('events').insert({
      venue_id: candidate.venue_id,
      event_name: eventName,
      event_date: extractDate(title),
      event_type: 'Club Night',
      description: candidate.matched_text,
      ticket_url: url,
      source_url: candidate.source_url,
      status: 'published',
    })

    await supabaseAdmin
      .from('event_candidates')
      .update({ status: 'approved' })
      .eq('id', candidate.id)

    published++
  }

  return Response.json({
    checked: candidates?.length || 0,
    published,
    skipped,
  })
}