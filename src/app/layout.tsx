import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import BottomNav from '@/app/components/BottomNav'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Scene Finder',
  description: 'Find clubs. Discover events. Explore the scene.',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon-192.png',
    apple: '/apple-touch-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#09090b',
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-zinc-950">
        <a href="#main-content" className="sf-skip-link">Skip to content</a>
        <div id="main-content" tabIndex={-1} className="flex-1 outline-none">
          {children}
        </div>
        <BottomNav />
        <Analytics />
      </body>
    </html>
  )
}
