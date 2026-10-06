// Install as src/app/api/events-health/route.ts after applying event_health_migration.sql.
// Call independently from the scraper, at least hourly, with Authorization: Bearer <CRON_SECRET>.
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { queueRoutineAlert, sendRoutineDigest } from '@/lib/routine-alerts'

export const runtime = 'nodejs'

type HealthRow = {
  venue_id: string
  active_source_count: number
  latest_source_attempt: string | null
  last_completed_success: string | null
  historical_event_count: number
  visible_future_count: number
  last_future_event_date: string | null
}

type IssueKind = 'zero_events' | 'stale_scrape' | 'short_runway' | 'missing_source'
type Issue = { venue_id: string; issue_kind: IssueKind; detail: string }
type AlertState = {
  venue_id: string
  issue_kind: IssueKind
  active: boolean
  last_notified_at: string | null
}

// New issues alert immediately; unresolved issues are reminders, not new incidents.
const repeatAfterMs = 7 * 24 * 60 * 60 * 1000
const staleAfterMs = 48 * 60 * 60 * 1000

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character] || character)
}

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const now = new Date()
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(now)
  const get = (type: string) => parts.find((part) => part.type === type)?.value
  const today = `${get('year')}-${get('month')}-${get('day')}`
  const runwayEnd = new Date(`${today}T12:00:00Z`)
  runwayEnd.setUTCDate(runwayEnd.getUTCDate() + 21)
  const lastRunwayDate = runwayEnd.toISOString().slice(0, 10)

  const { data: health, error: healthError } = await supabase.rpc('get_venue_event_health')
  if (healthError || !health) {
    console.error('EVENT HEALTH: metrics failed', healthError)
    return Response.json({ error: 'Health metrics unavailable' }, { status: 503 })
  }

  const { data: oldStates, error: stateError } = await supabase
    .from('venue_event_health_alert_state')
    .select('venue_id, issue_kind, active, last_notified_at')
  if (stateError || !oldStates) {
    console.error('EVENT HEALTH: state read failed', stateError)
    return Response.json({ error: 'Health alert state unavailable' }, { status: 503 })
  }

  const issues: Issue[] = []
  for (const row of health as HealthRow[]) {
    const visible = Number(row.visible_future_count)
    const historical = Number(row.historical_event_count)
    const successAt = row.last_completed_success
      ? new Date(row.last_completed_success).getTime() : 0

    if (visible === 0 && historical > 0) {
      issues.push({ venue_id: row.venue_id, issue_kind: 'zero_events',
        detail: 'Previously published events exist, but none are visible now.' })
    }
    if (Number(row.active_source_count) === 0) {
      issues.push({ venue_id: row.venue_id, issue_kind: 'missing_source',
        detail: 'No active official event source is configured for this public venue.' })
    } else if (!successAt || now.getTime() - successAt > staleAfterMs) {
      issues.push({ venue_id: row.venue_id, issue_kind: 'stale_scrape',
        detail: `Last scrape yielding confirmed future events: ${row.last_completed_success || 'never'}. ` +
          `Last source attempt: ${row.latest_source_attempt || 'never'}.` })
    }
    if (visible > 0 &&
        row.last_future_event_date && row.last_future_event_date <= lastRunwayDate) {
      issues.push({ venue_id: row.venue_id, issue_kind: 'short_runway',
        detail: `${visible} visible future event(s); last dated event ${row.last_future_event_date}. ` +
          'The venue has no published events beyond the next 21 days.' })
    }
  }

  const key = (venueId: string, kind: string) => `${venueId}\u0000${kind}`
  const previous = new Map<string, AlertState>(
    (oldStates as AlertState[]).map((state) => [key(state.venue_id, state.issue_kind), state])
  )
  const currentKeys = new Set(issues.map((issue) => key(issue.venue_id, issue.issue_kind)))
  const toNotify = issues.filter((issue) => {
    const state = previous.get(key(issue.venue_id, issue.issue_kind))
    return !state?.active || !state.last_notified_at ||
      now.getTime() - new Date(state.last_notified_at).getTime() >= repeatAfterMs
  })

  const critical = toNotify.filter((issue) => issue.issue_kind === 'zero_events')
  const routine = toNotify.filter((issue) => issue.issue_kind !== 'zero_events')
  for (const issue of routine) {
    const error = await queueRoutineAlert(supabase,
      `health:${issue.venue_id}:${issue.issue_kind}`,
      `${issue.venue_id}: ${issue.issue_kind}`, issue.detail)
    if (error) {
      console.error('EVENT HEALTH: routine queue failed', error)
      return Response.json({ error: 'Routine alert queue unavailable' }, { status: 503 })
    }
  }

  if (critical.length > 0) {
    if (!process.env.RESEND_API_KEY) {
      return Response.json({ error: 'RESEND_API_KEY is missing', issue_count: issues.length },
        { status: 503 })
    }
    const resend = new Resend(process.env.RESEND_API_KEY)
    const lines = critical.map((issue) =>
      `<li><strong>${escapeHtml(issue.venue_id)}</strong> — ` +
      `${escapeHtml(issue.issue_kind)}: ${escapeHtml(issue.detail)}</li>`
    ).join('')
    try {
      const { error } = await resend.emails.send({
        from: process.env.NOTIFY_FROM_EMAIL || 'Scene Finder <notifications@scenefinder.co.uk>',
        to: [process.env.ADMIN_NOTIFY_EMAIL || 'info@scenefinder.co.uk'],
        subject: `Scene Finder CRITICAL: ${critical.length} venue(s) have zero events`,
        html: `<p>Checked ${escapeHtml(now.toISOString())}. These venues have no visible future events:</p><ul>${lines}</ul>`,
      })
      if (error) throw new Error(error.message)
    } catch (error) {
      console.error('EVENT HEALTH: alert send failed', error)
      return Response.json({ error: 'Health alert delivery failed', issue_count: issues.length },
        { status: 503 })
    }
  }

  const notified = new Set(toNotify.map((issue) => key(issue.venue_id, issue.issue_kind)))
  const updates = issues.map((issue) => {
    const issueKey = key(issue.venue_id, issue.issue_kind)
    return { venue_id: issue.venue_id, issue_kind: issue.issue_kind,
      active: true, last_notified_at: notified.has(issueKey)
        ? now.toISOString() : previous.get(issueKey)?.last_notified_at || null,
      updated_at: now.toISOString() }
  })
  for (const state of oldStates as AlertState[]) {
    if (state.active && !currentKeys.has(key(state.venue_id, state.issue_kind))) {
      updates.push({ venue_id: state.venue_id, issue_kind: state.issue_kind,
        active: false, last_notified_at: state.last_notified_at,
        updated_at: now.toISOString() })
    }
  }
  const resolvedRoutineKeys = (oldStates as AlertState[])
    .filter((state) => state.active && state.issue_kind !== 'zero_events' &&
      !currentKeys.has(key(state.venue_id, state.issue_kind)))
    .map((state) => `health:${state.venue_id}:${state.issue_kind}`)
  if (resolvedRoutineKeys.length) {
    const { error } = await supabase.from('scene_finder_routine_alert_queue')
      .delete().in('alert_key', resolvedRoutineKeys)
    if (error) {
      console.error('EVENT HEALTH: resolved alert cleanup failed', error)
      return Response.json({ error: 'Routine alert queue unavailable' }, { status: 503 })
    }
  }
  if (updates.length > 0) {
    const { error } = await supabase.from('venue_event_health_alert_state')
      .upsert(updates, { onConflict: 'venue_id,issue_kind' })
    if (error) {
      console.error('EVENT HEALTH: state write failed', error)
      return Response.json({ error: 'Health alert state write failed' }, { status: 503 })
    }
  }

  const digest = await sendRoutineDigest(supabase, now)
  if (digest.error) {
    console.error('EVENT HEALTH: routine digest failed', digest.error)
    return Response.json({ error: 'Routine digest delivery failed', issue_count: issues.length },
      { status: 503 })
  }

  const issueCounts = Object.fromEntries(
    (['zero_events', 'stale_scrape', 'short_runway', 'missing_source'] as IssueKind[])
      .map((kind) => [kind, issues.filter((issue) => issue.issue_kind === kind).length])
  )
  return Response.json({ checked_venues: health.length,
    issue_count: issues.length, issues_by_kind: issueCounts,
    critical_alerts_sent: critical.length, routine_alerts_queued: routine.length,
    routine_digest_sent: digest.sent, routine_digest_items: digest.count,
    alerts_sent: critical.length + (digest.sent ? 1 : 0) })
}
