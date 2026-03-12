'use client'

import { useState } from 'react'
import AuthModal from '@/components/AuthModal'
import PricingTable from '@/components/PricingTable'

const FEATURES = [
  {
    icon: '⚡',
    title: 'Live during the call',
    body: 'WPM, filler words, confidence score — updating every few seconds while you speak. Not after.',
  },
  {
    icon: '👻',
    title: 'Invisible to everyone else',
    body: 'A floating overlay only you can see. No bot joins. No recording. Your co-workers never know.',
  },
  {
    icon: '📜',
    title: 'Live teleprompter',
    body: 'Paste your script and SpeakUp follows along word-by-word, highlighting exactly where you are.',
  },
  {
    icon: '🎯',
    title: 'Context-aware coaching',
    body: 'Sales pitch tips are different from interview tips. Choose your session type and coaching adapts.',
  },
  {
    icon: '🔒',
    title: 'No recording. Ever.',
    body: 'Audio is streamed to speech-to-text and immediately discarded. Nothing stored, nothing shared.',
  },
  {
    icon: '📊',
    title: 'Session history',
    body: 'Every session gets a grade. Track your WPM trend, filler count, and confidence over time.',
  },
]

const COMPARE = [
  { label: 'Real-time feedback during call', speakup: true, others: false },
  { label: 'No recording required', speakup: true, others: false },
  { label: 'No bot joining the call', speakup: true, others: false },
  { label: 'Works outside of meetings', speakup: true, others: false },
  { label: 'Live teleprompter', speakup: true, others: false },
  { label: 'Zero meeting permissions needed', speakup: true, others: false },
  { label: 'Post-session recap', speakup: true, others: true },
  { label: 'Progress tracking', speakup: true, others: true },
]

export default function Landing() {
  const [showAuth, setShowAuth] = useState(false)

  return (
    <main className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <span style={{ color: 'var(--green)', fontWeight: 700, fontSize: 20 }}>SpeakUp</span>
        <div className="flex items-center gap-4">
          <a href="#pricing" className="text-sm" style={{ color: 'var(--muted)' }}>Pricing</a>
          <button
            onClick={() => setShowAuth(true)}
            className="text-sm px-4 py-2 rounded-lg font-semibold cursor-pointer"
            style={{ background: 'var(--green)', color: '#000' }}
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
        <div
          className="inline-block text-xs font-medium px-3 py-1 rounded-full mb-6"
          style={{ background: 'rgba(0,255,136,0.1)', color: 'var(--green)', border: '1px solid rgba(0,255,136,0.2)' }}
        >
          Real-time speech coaching
        </div>
        <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6" style={{ letterSpacing: '-0.02em' }}>
          Speak better.<br />
          <span style={{ color: 'var(--green)' }}>Right now.</span>
        </h1>
        <p className="text-xl mb-10 max-w-2xl mx-auto leading-relaxed" style={{ color: 'var(--muted)' }}>
          A floating overlay that coaches you live during sales calls, investor pitches,
          and interviews. No recording. No bot. No one knows you&apos;re using it.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => setShowAuth(true)}
            className="px-8 py-4 rounded-xl font-semibold text-base cursor-pointer"
            style={{ background: 'var(--green)', color: '#000' }}
          >
            Download for Mac — Free
          </button>
          <a
            href="#how"
            className="px-8 py-4 rounded-xl font-medium text-base"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
          >
            See how it works
          </a>
        </div>
        <p className="text-xs mt-4" style={{ color: 'var(--muted)' }}>
          Free plan · 3 sessions/month · No credit card required
        </p>
      </section>

      {/* Demo mockup */}
      <section id="how" className="max-w-5xl mx-auto px-6 py-16">
        <div
          className="rounded-2xl p-6 md:p-10 flex flex-col md:flex-row gap-8 items-center"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          {/* Overlay mockup */}
          <div
            className="rounded-2xl p-5 flex-shrink-0 w-full md:w-60 text-sm font-mono"
            style={{ background: '#0a0a0c', border: '1px solid rgba(0,255,136,0.2)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <span style={{ color: 'var(--green)', fontWeight: 700, fontSize: 13 }}>SpeakUp</span>
              <span style={{ color: 'var(--muted)', fontSize: 11 }}>02:14</span>
            </div>
            <div className="space-y-2 mb-4">
              {[['WPM', '138', 'var(--green)'], ['CONF', '81', '#fff'], ['FILL', '3', '#facc15']].map(([k, v, c]) => (
                <div key={k} className="flex justify-between">
                  <span style={{ color: 'var(--muted)', fontSize: 12 }}>{k}</span>
                  <span style={{ color: c, fontWeight: 700, fontSize: 12 }}>{v}</span>
                </div>
              ))}
            </div>
            <div
              className="px-3 py-2 rounded-lg text-xs mb-3"
              style={{ background: 'rgba(0,255,136,0.08)', color: 'var(--green)' }}
            >
              💡 Pause after your key stat
            </div>
            <div className="text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>
              &ldquo;<span style={{ color: '#fff' }}>…conversion rate</span> has gone up{' '}
              <span style={{ color: 'var(--green)' }}>forty percent</span>&hellip;&rdquo;
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-bold mb-4">Your private coach, always on screen</h2>
            <p className="leading-relaxed mb-4" style={{ color: 'var(--muted)' }}>
              SpeakUp sits in the corner of your screen while you present. It tracks your pace,
              catches filler words as they happen, and nudges you with a coaching tip — all without
              anyone on the call seeing anything.
            </p>
            <p className="leading-relaxed" style={{ color: 'var(--muted)' }}>
              Unlike tools that analyse your meeting afterward, SpeakUp gives you feedback
              you can actually use — mid-sentence.
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Everything you need. Nothing you don&apos;t.</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-xl p-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div className="text-2xl mb-3">{f.icon}</div>
              <h3 className="font-semibold mb-2">{f.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Comparison */}
      <section className="max-w-3xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-4">SpeakUp vs the rest</h2>
        <p className="text-center mb-10" style={{ color: 'var(--muted)' }}>
          Most tools record your meetings and analyse them later. SpeakUp coaches you in the moment.
        </p>
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
          <div className="grid grid-cols-3 text-sm font-semibold px-5 py-3" style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
            <span>Feature</span>
            <span className="text-center" style={{ color: 'var(--green)' }}>SpeakUp</span>
            <span className="text-center" style={{ color: 'var(--muted)' }}>Poised / Others</span>
          </div>
          {COMPARE.map((row, i) => (
            <div
              key={row.label}
              className="grid grid-cols-3 text-sm px-5 py-3"
              style={{
                borderBottom: i < COMPARE.length - 1 ? '1px solid var(--border)' : undefined,
                background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)',
              }}
            >
              <span style={{ color: 'var(--muted)' }}>{row.label}</span>
              <span className="text-center" style={{ color: 'var(--green)' }}>✓</span>
              <span className="text-center" style={{ color: row.others ? 'var(--muted)' : '#ef4444' }}>
                {row.others ? '✓' : '✗'}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-4">Simple pricing</h2>
        <p className="text-center mb-12" style={{ color: 'var(--muted)' }}>Start free. Upgrade when you&apos;re ready.</p>
        <PricingTable onCtaClick={() => setShowAuth(true)} />
      </section>

      {/* Footer */}
      <footer className="text-center py-10 text-sm" style={{ color: 'var(--muted)', borderTop: '1px solid var(--border)' }}>
        <p>© {new Date().getFullYear()} SpeakUp · All rights reserved.</p>
      </footer>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </main>
  )
}
