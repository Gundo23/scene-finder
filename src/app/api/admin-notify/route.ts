import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resendApiKey = process.env.RESEND_API_KEY
const adminNotifyEmail = process.env.ADMIN_NOTIFY_EMAIL || 'info@scenefinder.co.uk'
const notifyFromEmail =
  process.env.NOTIFY_FROM_EMAIL || 'Scene Finder <onboarding@resend.dev>'

export async function POST(request: Request) {
  try {
    if (!resendApiKey) {
      console.warn('Admin notification skipped: missing RESEND_API_KEY')
      return NextResponse.json({ ok: true, skipped: true })
    }

    const body = await request.json()

    const subject = cleanPlainText(body.subject || 'New Scene Finder submission')
    const heading = cleanPlainText(body.heading || 'New Scene Finder submission')
    const message = cleanPlainText(body.message || 'A new submission has been received.')
    const replyTo = cleanEmail(body.replyTo || '')

    const resend = new Resend(resendApiKey)

    await resend.emails.send({
      from: notifyFromEmail,
      to: adminNotifyEmail,
      replyTo: replyTo || undefined,
      subject,
      text: `${heading}\n\n${message}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111827;">
          <h2 style="margin: 0 0 16px;">${escapeHtml(heading)}</h2>
          <pre style="white-space: pre-wrap; font-family: Arial, sans-serif; background: #f3f4f6; padding: 16px; border-radius: 12px;">${escapeHtml(message)}</pre>
        </div>
      `,
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Admin notification error:', error)
    return NextResponse.json({ ok: true, emailFailed: true })
  }
}

function cleanPlainText(value: string) {
  return String(value)
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim()
    .slice(0, 4000)
}

function cleanEmail(value: string) {
  const email = String(value).trim().slice(0, 320)

  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return ''
  }

  return email
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
