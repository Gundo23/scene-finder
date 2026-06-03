import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function cleanText(value: string) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function absoluteUrl(base: string, href: string | null) {
  if (!href) return null

  try {
    return new URL(href, base).toString()
  } catch {
    return null
  }
}

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
  let cleaned = cleanText(title)
    .replace(
      /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2}\b/i,
      ''
    )
    .replace(/CUPIDS SWINGERS CLUB.*$/i, '')
    .replace(/\s+/g, ' ')
    .trim()

  const markers = [
    ' newbie nights',
    ' our ',
    ' who ',
    ' what ',
    ' these ',
    ' a night ',
    ' come ',
    ' the legendary ',
    ' a swing event',
  ]

  for (const marker of markers) {
    const index = cleaned.toLowerCase().indexOf(marker)
    if (index > 8) {
      cleaned = cleaned.slice(0, index).trim()
      break
    }
  }

  return cleaned || 'Untitled Event'
}

async function extractImageUrl(eventUrl: string) {
  try {
    const response = await fetch(eventUrl, {
      headers: {
        'User-Agent': 'SceneFinderBot/1.0',
      },
    })

    if (!response.ok) return null

    const html = await response.text()

    const ogImage =
      html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)?.[1] ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i)?.[1]

    if (ogImage) {
      return absoluteUrl(eventUrl, ogImage)
    }

    const twitterImage =
      html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i)?.[1] ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i)?.[1]

    if (twitterImage) {
      return absoluteUrl(eventUrl, twitterImage)
    }

    const firstImage = html.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1]

    if (firstImage) {
      return absoluteUrl(eventUrl, firstImage)
    }

    return null
  } catch {
    return null
  }
}

export async function GET() {
  const { data: sources, error } = await supabaseAdmin
    .from('event_sources')
    .select('source_id, venue_id, source_url, active')
    .eq('active', true)
    .limit(50)

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  let created = 0

  let skippedNotEvent = 0
  let skippedBadUrl = 0
  let skippedBadName = 0
  let skippedDuplicate = 0
  let skippedSourceError = 0
  let skippedInsertError = 0

  const found = []
  const sampleSkippedNotEvent = []
  const sampleDuplicates = []
  const insertErrors = []

  for (const source of sources || []) {
    try {
      const response = await fetch(source.source_url, {
        headers: {
          'User-Agent': 'SceneFinderBot/1.0',
        },
      })

      if (!response.ok) {
        skippedSourceError++
        continue
      }

      const html = await response.text()
      const linkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi

      let match

      while ((match = linkRegex.exec(html)) !== null) {
        const href = match[1]
        const rawTitle = cleanText(match[2])
        const combined = `${href} ${rawTitle}`.toLowerCase()

        const looksLikeEvent =
          combined.includes('event') ||
          combined.includes('events') ||
          combined.includes('ticket') ||
          combined.includes('tickets') ||
          combined.includes('party') ||
          combined.includes('club night') ||
          combined.includes('social') ||
          combined.includes('munch') ||
          combined.includes('calendar') ||
          combined.includes('whats-on') ||
          combined.includes('whatson') ||
          combined.includes('night')

        if (!looksLikeEvent) {
          skippedNotEvent++

          if (sampleSkippedNotEvent.length < 10) {
            sampleSkippedNotEvent.push({
              venue_id: source.venue_id,
              title: rawTitle,
              href,
            })
          }

          continue
        }

        const eventUrl = absoluteUrl(source.source_url, href)

        if (!eventUrl) {
          skippedBadUrl++
          continue
        }

        const eventName = cleanEventName(rawTitle)
        const eventDate = extractDate(rawTitle)

        if (!eventName || eventName.length < 4) {
          skippedBadName++
          continue
        }

        const { data: existing } = await supabaseAdmin
          .from('events')
          .select('event_id')
          .eq('venue_id', source.venue_id)
          .eq('ticket_url', eventUrl)
          .maybeSingle()

        if (existing) {
          skippedDuplicate++

          if (sampleDuplicates.length < 10) {
            sampleDuplicates.push({
              venue_id: source.venue_id,
              event_name: eventName,
              event_url: eventUrl,
            })
          }

          continue
        }

        const imageUrl = await extractImageUrl(eventUrl)

        const { error: insertError } = await supabaseAdmin.from('events').insert({
          venue_id: source.venue_id,
          event_name: eventName,
          event_date: eventDate,
          event_type: 'Club Night',
          description: rawTitle,
          ticket_url: eventUrl,
          image_url: imageUrl,
          source_url: source.source_url,
          status: 'published',
        })

        if (insertError) {
          skippedInsertError++

          if (insertErrors.length < 10) {
            insertErrors.push({
              venue_id: source.venue_id,
              event_name: eventName,
              event_url: eventUrl,
              error: insertError.message,
            })
          }

          continue
        }

        found.push({
          venue_id: source.venue_id,
          event_name: eventName,
          event_date: eventDate,
          event_url: eventUrl,
          image_url: imageUrl,
        })

        created++
      }
    } catch (error) {
      console.error(error)
      skippedSourceError++
      continue
    }
  }

  return Response.json({
    checked_sources: sources?.length || 0,
    events_created: created,

    skipped_not_event: skippedNotEvent,
    skipped_bad_url: skippedBadUrl,
    skipped_bad_name: skippedBadName,
    skipped_duplicate: skippedDuplicate,
    skipped_source_error: skippedSourceError,
    skipped_insert_error: skippedInsertError,

    total_skipped:
      skippedNotEvent +
      skippedBadUrl +
      skippedBadName +
      skippedDuplicate +
      skippedSourceError +
      skippedInsertError,

    sample_skipped_not_event: sampleSkippedNotEvent,
    sample_duplicates: sampleDuplicates,
    insert_errors: insertErrors,

    found,
  })
}