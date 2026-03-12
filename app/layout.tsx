import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })

export const metadata: Metadata = {
  title: 'SpeakUp — Real-Time Speech Coaching',
  description: 'Live coaching overlay for sales calls, investor pitches, interviews, and presentations. No recording. No bot. No one knows you\'re using it.',
  openGraph: {
    title: 'SpeakUp — Real-Time Speech Coaching',
    description: 'Speak better in every meeting. Live WPM, filler detection, and coaching tips — invisible to everyone else.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geist.variable} font-sans antialiased`}>{children}</body>
    </html>
  )
}
