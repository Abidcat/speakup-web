import CursorGlow from '@/components/CursorGlow'

const mono = { fontFamily: 'var(--font-dm-mono)' } as const
const syne = { fontFamily: 'var(--font-syne)', fontWeight: 800 } as const

const WHATS_INCLUDED = [
  { icon: '🎙', title: 'Live transcription', desc: 'Deepgram-powered, sub-300ms latency' },
  { icon: '⚠️', title: 'Filler word detection', desc: 'um, uh, like, you know — caught instantly' },
  { icon: '⏱', title: 'Pace meter', desc: 'Real-time WPM with color feedback' },
  { icon: '▤', title: 'Teleprompter', desc: 'Word-by-word script tracking with auto-advance' },
  { icon: '⧉', title: 'Slide-aware notes', desc: 'AI detects your current slide automatically' },
  { icon: '🤖', title: 'AI coaching report', desc: 'Post-session analysis powered by Claude' },
]

const REQUIREMENTS = [
  'macOS 13 Ventura or later',
  'Apple Silicon or Intel (64-bit)',
  'Microphone access required',
  'Screen recording permission for slide detection',
]

export default function DownloadPage() {
  return (
    <main style={{ background: 'var(--bg)', color: 'var(--text)', minHeight: '100vh', cursor: 'none' }}>
      <CursorGlow />

      {/* Nav */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', borderBottom: '1px solid var(--border)', background: 'rgba(9,9,11,.75)', backdropFilter: 'blur(24px)' }}>
        <a href="/" style={{ ...syne, fontSize: 17, letterSpacing: '-0.03em', display: 'flex', alignItems: 'center', gap: 7, textDecoration: 'none', color: 'var(--text)' }}>
          <div style={{ width: 7, height: 7, background: 'var(--accent)', borderRadius: '50%', animation: 'pulse 2s ease-in-out infinite' }} />
          SpeakUp
        </a>
        <a href="/dashboard" style={{ padding: '7px 16px', borderRadius: 7, fontSize: 13, fontWeight: 500, background: 'var(--accent)', color: '#09090b', textDecoration: 'none', fontFamily: 'var(--font-dm-sans)' }}>
          Open dashboard →
        </a>
      </nav>

      {/* Hero */}
      <section style={{ paddingTop: 140, paddingBottom: 80, paddingLeft: 40, paddingRight: 40, maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, border: '1px solid var(--border)', borderRadius: 100, padding: '5px 14px 5px 8px', ...mono, fontSize: 10.5, color: 'var(--muted)', letterSpacing: '0.05em', marginBottom: 32 }}>
          <div style={{ width: 5, height: 5, background: 'var(--accent)', borderRadius: '50%' }} />
          Mac · Free to start
        </div>

        <h1 style={{ ...syne, fontSize: 'clamp(48px,8vw,80px)', letterSpacing: '-0.05em', lineHeight: 0.95, marginBottom: 20 }}>
          Download<br /><span style={{ color: 'var(--accent)' }}>SpeakUp</span>
        </h1>
        <p style={{ fontSize: 17, color: 'var(--text2)', lineHeight: 1.7, marginBottom: 48, fontWeight: 300 }}>
          Your AI speaking coach, running invisibly on your Mac during every call, pitch, and presentation.
        </p>

        {/* Download button */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <a
            href="/speakup-mac.dmg"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              padding: '16px 40px', borderRadius: 12, fontSize: 16, fontWeight: 600,
              background: 'var(--accent)', color: '#09090b', textDecoration: 'none',
              fontFamily: 'var(--font-dm-sans)', boxShadow: '0 0 40px rgba(34,197,94,0.25)',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 2a1 1 0 011 1v9.586l2.293-2.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L9 12.586V3a1 1 0 011-1z"/>
              <path d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"/>
            </svg>
            Download for Mac — Free
          </a>
          <div style={{ ...mono, fontSize: 10.5, color: 'var(--muted)', letterSpacing: '0.04em' }}>
            v1.0.0 · macOS 13+
          </div>
        </div>
      </section>

      {/* System requirements */}
      <section style={{ maxWidth: 760, margin: '0 auto', padding: '0 40px 80px' }}>
        <div style={{ border: '1px solid var(--border)', borderRadius: 16, padding: '32px 36px', background: 'var(--surface)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
          <div>
            <div style={{ ...mono, fontSize: 10, color: 'var(--accent)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>System requirements</div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {REQUIREMENTS.map(r => (
                <li key={r} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13.5, color: 'var(--text2)' }}>
                  <span style={{ color: 'var(--accent)', fontSize: 11, marginTop: 2, flexShrink: 0 }}>✓</span>
                  {r}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div style={{ ...mono, fontSize: 10, color: 'var(--accent)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>Permissions used</div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {['Microphone — speech transcription', 'Screen recording — slide detection only', 'No audio is stored or transmitted'].map(r => (
                <li key={r} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13.5, color: 'var(--text2)' }}>
                  <span style={{ color: 'var(--accent)', fontSize: 11, marginTop: 2, flexShrink: 0 }}>◈</span>
                  {r}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* What's included */}
      <section style={{ maxWidth: 1080, margin: '0 auto', padding: '0 40px 100px' }}>
        <div style={{ ...mono, fontSize: 10, color: 'var(--accent)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12, textAlign: 'center' }}>What&apos;s included</div>
        <h2 style={{ ...syne, fontSize: 'clamp(32px,5vw,48px)', letterSpacing: '-0.03em', textAlign: 'center', marginBottom: 48 }}>Every feature, in one overlay</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 1, background: 'var(--border)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
          {WHATS_INCLUDED.map(f => (
            <div key={f.title} style={{ background: 'var(--bg)', padding: '32px 28px' }}>
              <div style={{ width: 36, height: 36, border: '1px solid var(--border)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, fontSize: 16 }}>{f.icon}</div>
              <div style={{ ...syne, fontSize: 15, letterSpacing: '-0.02em', marginBottom: 6 }}>{f.title}</div>
              <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.65 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Install steps */}
      <section style={{ maxWidth: 760, margin: '0 auto', padding: '0 40px 100px' }}>
        <div style={{ ...mono, fontSize: 10, color: 'var(--accent)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12, textAlign: 'center' }}>Getting started</div>
        <h2 style={{ ...syne, fontSize: 'clamp(28px,4vw,40px)', letterSpacing: '-0.03em', textAlign: 'center', marginBottom: 48 }}>Up in 60 seconds</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: 'var(--border)', borderRadius: 16, overflow: 'hidden' }}>
          {[
            { n: '01', title: 'Download & install', desc: 'Open the .dmg, drag SpeakUp to Applications.' },
            { n: '02', title: 'Sign in', desc: 'Log in with your Google account — same as the web dashboard.' },
            { n: '03', title: 'Choose your session type', desc: 'Sales pitch, investor deck, interview, zoom call, or custom.' },
            { n: '04', title: 'Launch and speak', desc: 'The overlay appears over all your windows. Grant mic + screen permissions when asked.' },
          ].map(step => (
            <div key={step.n} style={{ background: 'var(--bg)', padding: '28px 36px', display: 'flex', gap: 24, alignItems: 'flex-start' }}>
              <div style={{ ...mono, fontSize: 12, color: 'var(--muted)', flexShrink: 0, paddingTop: 2 }}>{step.n}</div>
              <div>
                <div style={{ ...syne, fontSize: 17, letterSpacing: '-0.02em', marginBottom: 4 }}>{step.title}</div>
                <div style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.6 }}>{step.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
