import Link from 'next/link';

interface DebugRouteCard {
  title: string;
  href: string;
  badge: string;
  description: string;
  features: string[];
}

const DEBUG_PAGES: DebugRouteCard[] = [
  {
    title: 'Agent Thinking Page',
    href: '/debug/agent-thinking',
    badge: 'Overlay & Typewriter',
    description: 'Authentic full-screen UI when the AI agent is thinking, drafting questions, and evaluating responses.',
    features: ['Handwriting Caveat font', 'Typewriter animation loop', 'Blinking caret', 'Includes "Get ready 😈"'],
  },
  {
    title: 'Timer Page',
    href: '/debug/timer',
    badge: 'Countdown Overlay',
    description: 'Authentic full-screen countdown overlay displaying pure 3-2-1 typography with gradient and pop animation.',
    features: ['Giant 3-2-1 countdown typography', 'Gradient text fill', 'Pop-in keyframe animations', 'Full viewport presentation'],
  },
  {
    title: 'Question Stage Page',
    href: '/debug/question',
    badge: 'Active Round Stage',
    description: 'Authentic live session interface when answering an active question without requiring a live database session.',
    features: ['Session header with timers and badges', 'Active question card', 'Markdown toolbar & textarea', 'Submit answer workflow'],
  },
  {
    title: 'Question Summary Page',
    href: '/debug/question-summary',
    badge: 'Round Analysis',
    description: 'Authentic post-question comparison view showing consensus metrics and side-by-side perspectives.',
    features: ['Overall alignment S-curve', 'Personal alignment score', 'Room consensus drawer', 'Side-by-side response cards'],
  },
  {
    title: 'Room Summary Page',
    href: '/debug/room-summary',
    badge: 'Final Report',
    description: 'Authentic session completion analytics showing alignment journey, combination matrix, and final agreements.',
    features: ['Final alignment hero score', 'Consensus breakdown cards', 'Perspective comparison', 'Complete session journey'],
  },
];

export default function DebugHubPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        backgroundColor: '#F8FAFC',
        color: '#0F172A',
        padding: '48px 24px 96px',
        fontFamily: 'var(--font-sans, system-ui, sans-serif)',
      }}
    >
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <header style={{ marginBottom: 40 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 12px', borderRadius: 9999, backgroundColor: '#EEF2FF', color: '#4F46E5', fontSize: '0.8125rem', fontWeight: 600, marginBottom: 12 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block' }} />
            NEXT_PUBLIC_DEBUG_MODE: ENABLED
          </div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.03em', margin: '0 0 8px', color: '#0F172A' }}>
            UI Debug Hub
          </h1>
          <p style={{ fontSize: '1rem', color: '#64748B', margin: 0, maxWidth: 640 }}>
            Dedicated routes to preview and inspect authentic Same Page UI screens in isolation without depending on live backend room states.
          </p>
        </header>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
            gap: 20,
          }}
        >
          {DEBUG_PAGES.map((page) => (
            <div
              key={page.href}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 16,
                border: '1px solid #E2E8F0',
                padding: 24,
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.04)',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    padding: '3px 8px',
                    borderRadius: 6,
                    backgroundColor: '#F1F5F9',
                    color: '#475569',
                  }}
                >
                  {page.badge}
                </span>
                <span style={{ fontSize: '0.8125rem', fontFamily: 'monospace', color: '#94A3B8' }}>
                  {page.href}
                </span>
              </div>

              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 8px', color: '#0F172A' }}>
                {page.title}
              </h2>
              <p style={{ fontSize: '0.875rem', color: '#64748B', lineHeight: 1.5, margin: '0 0 16px', flex: 1 }}>
                {page.description}
              </p>

              <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: 14, marginBottom: 20 }}>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {page.features.map((feat) => (
                    <li
                      key={feat}
                      style={{
                        fontSize: '0.75rem',
                        backgroundColor: '#F8FAFC',
                        border: '1px solid #E2E8F0',
                        color: '#475569',
                        padding: '2px 8px',
                        borderRadius: 4,
                      }}
                    >
                      ✓ {feat}
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                href={page.href}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '10px 16px',
                  borderRadius: 10,
                  backgroundColor: '#4F46E5',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  textDecoration: 'none',
                  textAlign: 'center',
                  transition: 'background-color 0.15s',
                }}
              >
                Open Debug View →
              </Link>
            </div>
          ))}
        </div>

        <footer style={{ marginTop: 48, padding: 20, borderRadius: 12, backgroundColor: '#F1F5F9', border: '1px dashed #CBD5E1', fontSize: '0.8125rem', color: '#64748B' }}>
          <strong>Debug Security Guard:</strong> These debug pages are only active when <code style={{ backgroundColor: '#E2E8F0', padding: '1px 6px', borderRadius: 4, color: '#0F172A' }}>NEXT_PUBLIC_DEBUG_MODE=true</code> is set in <code style={{ backgroundColor: '#E2E8F0', padding: '1px 6px', borderRadius: 4, color: '#0F172A' }}>.env</code>. If this variable is false or removed in production, Next.js immediately responds with a 404 Not Found.
        </footer>
      </div>
    </main>
  );
}
