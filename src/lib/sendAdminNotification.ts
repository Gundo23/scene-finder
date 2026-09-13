import { Resend } from 'resend'

const resendApiKey = process.env.RESEND_API_KEY
const adminNotifyEmail = process.env.ADMIN_NOTIFY_EMAIL
const notifyFromEmail =
  process.env.NOTIFY_FROM_EMAIL || 'Scene Finder <onboarding@resend.dev>'

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export async function sendAdminNotification({
  subject,
  heading,
  message,
  replyTo,
}: {
  subject: string
  heading: string
  message: string
  replyTo?: string | null
}) {
  if (!resendApiKey || !adminNotifyEmail) {
    console.warn(
      'Email notification skipped: missing RESEND_API_KEY or ADMIN_NOTIFY_EMAIL'
    )
    return
  }

  const resend = new Resend(resendApiKey)

  await resend.emails.send({
    from: notifyFromEmail,
    to: adminNotifyEmail,
    replyTo: replyTo || undefined,
    subject,
    text: `${heading}\n\n${message}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h2>${escapeHtml(heading)}</h2>
        <p>${escapeHtml(message).replace(/\n/g, '<br />')}</p>
      </div>
    `,
  })
}