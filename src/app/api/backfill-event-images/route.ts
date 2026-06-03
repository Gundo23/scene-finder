import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function absoluteUrl(base: string, href: string | null) {
  if (!href) return null

  try {
    return new URL(href, base).toString()
  } catch {
    return null
  }
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

    if (ogImage) return absoluteUrl(eventUrl, ogImage)

    const twitterImage =
      html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i)?.[1] ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i)?.[1]

    if (twitterImage) return absoluteUrl(eventUrl, twitterImage)

    const firstImage = html.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1]

    if (firstImage) return absoluteUrl(eventUrl, firstImage)

    return null
  } catch {
    return null
  }
}

export async function GET() {
  const { data: events, error } = await supabaseAdmin
    .from('events')
    .select('event_id, event_name, ticket_url, image_url')
    .not('ticket_url', 'is', null)
    .is('image_url', null)
    .limit(50)

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  let updated = 0
  let noImageFound = 0
  let failed = 0

  const results = []

  for (const event of events || []) {
    try {
      const imageUrl = await extractImageUrl(event.ticket_url)

      if (!imageUrl) {
        noImageFound++

        results.push({
          event_id: event.event_id,
          event_name: event.event_name,
          status: 'no image found',
        })

        continue
      }

      const { error: updateError } = await supabaseAdmin
        .from('events')
        .update({ image_url: imageUrl })
        .eq('event_id', event.event_id)

      if (updateError) {
        failed++

        results.push({
          event_id: event.event_id,
          event_name: event.event_name,
          status: 'update failed',
          error: updateError.message,
        })

        continue
      }

      updated++

      results.push({
        event_id: event.event_id,
        event_name: event.event_name,
        status: 'updated',
        image_url: imageUrl,
      })
    } catch {
      failed++
    }
  }

  return Response.json({
    checked: events?.length || 0,
    updated,
    no_image_found: noImageFound,
    failed,
    results,
  })
}