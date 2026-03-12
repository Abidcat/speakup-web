import type { Metadata } from 'next'
import { Syne, DM_Mono, DM_Sans } from 'next/font/google'
import './globals.css'

const syne   = Syne({ subsets: ['latin'], variable: '--font-syne',    weight: ['400','500','600','700','800'] })
const dmMono = DM_Mono({ subsets: ['latin'], variable: '--font-dm-mono', weight: ['300','400','500'] })
const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans', weight: ['300','400','500'] })

export const metadata: Metadata = {
  title: 'SpeakUp — Real-time Presentation Coaching',
  description: 'SpeakUp sits invisibly on top of Zoom, Meet, and Teams — catching filler words, tracking pace, and coaching you in real time.',
  openGraph: {
    title: 'SpeakUp — Real-time Presentation Coaching',
    description: 'A floating AI coach for every call. No recording. No bot. No one knows you\'re using it.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${syne.variable} ${dmMono.variable} ${dmSans.variable}`}>
        {children}
      </body>
    </html>
  )
}
