import type { SupabaseClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

type DigestItem = {
  alert_key: string
  subject: string
  detail: string
  updated_at: string
}

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[character] || character)

export async function queueRoutineAlert(
  supabase: SupabaseClient, alertKey: string, subject: string, detail: string
) {
  const { error } = await supabase.from('scene_finder_routine_alert_queue').upsert({
    alert_key: alertKey, subject, detail, updated_at: new Date().toISOString(),
  }, { onConflict: 'alert_key' })
  return error?.message || null
}

// The independent hourly health cron is also the single dispatcher for both alert producers.
export async function sendRoutineDigest(supabase: SupabaseClient, now: Date) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', hourCycle: 'h23',
  }).formatToParts(now)
  const get = (type: string) => parts.find((part) => part.type === type)?.value
  const hour = get('hour')
  if (hour !== '09' && hour !== '21') return { sent: false, count: 0, error: null }

  const slot = `${get('year')}-${get('month')}-${get('day')}-${hour}`
  const { data, error: claimError } = await supabase.rpc('claim_scene_finder_digest', { p_slot: slot })
  if (claimError) return { sent: false, count: 0, error: claimError.message }
  const items = (data || []) as DigestItem[]
  if (!items.length) return { sent: false, count: 0, error: null }

  if (!process.env.RESEND_API_KEY) return { sent: false, count: 0, error: 'RESEND_API_KEY is missing' }
  const resend = new Resend(process.env.RESEND_API_KEY)
  const html = `<h2>Scene Finder routine alert digest</h2><p>${items.length} issue(s) to review. ` +
    'Critical failures are emailed separately as they happen.</p><ul>' +
    items.map((item) => `<li><strong>${escapeHtml(item.subject)}</strong><br>` +
      `${escapeHtml(item.detail)}</li>`).join('') + '</ul>'
  try {
    const { error } = await resend.emails.send({
      from: process.env.NOTIFY_FROM_EMAIL || 'Scene Finder <notifications@scenefinder.co.uk>',
      to: [process.env.ADMIN_NOTIFY_EMAIL || 'info@scenefinder.co.uk'],
      subject: `Scene Finder routine digest: ${items.length} issue(s)`, html,
    })
    if (error) throw new Error(error.message)
  } catch (error) {
    return { sent: false, count: 0, error: String(error) }
  }
  const { error: completeError } = await supabase.rpc('complete_scene_finder_digest', { p_slot: slot })
  return { sent: true, count: items.length, error: completeError?.message || null }
}
