'use client';

import Link from 'next/link';
import { useLocale, useTheme } from '@mailmind/ui';
import { useEffect, useRef } from 'react';

/* ─── Collage SVG fragments used as placeholder imagery ─── */
const CollageHero = () => (
  <svg viewBox="0 0 600 450" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
    {/* Warm paper background */}
    <rect width="600" height="450" fill="#edebe9" />
    {/* Classical plaster head fragment silhouette */}
    <ellipse cx="280" cy="200" rx="110" ry="130" fill="#d4e9e2" opacity="0.5" />
    <ellipse cx="280" cy="190" rx="75" ry="90" fill="#c8dcc8" opacity="0.35" />
    <ellipse cx="265" cy="175" rx="18" ry="22" fill="#b8c8b8" opacity="0.3" />
    <ellipse cx="300" cy="175" rx="18" ry="22" fill="#b8c8b8" opacity="0.3" />
    <path d="M260 220 Q280 245 300 220" stroke="#a8b8a8" strokeWidth="1.5" fill="none" opacity="0.4" />
    {/* Brutalist concrete block */}
    <rect x="420" y="80" width="140" height="180" fill="#c8c4b8" opacity="0.3" rx="2" />
    <rect x="440" y="100" width="40" height="40" fill="#b8b4a8" opacity="0.25" rx="1" />
    <rect x="440" y="160" width="40" height="40" fill="#b8b4a8" opacity="0.25" rx="1" />
    {/* Archway cutout */}
    <path d="M40 280 Q40 180 140 180 Q240 180 240 280 L240 450 L40 450 Z" fill="#d4e9e2" opacity="0.25" />
    <path d="M70 280 Q70 210 140 210 Q210 210 210 280" stroke="#006241" strokeWidth="1" fill="none" opacity="0.2" />
    {/* Small human figure (silhouette) */}
    <circle cx="140" cy="340" r="8" fill="#1E3932" opacity="0.15" />
    <line x1="140" y1="348" x2="140" y2="380" stroke="#1E3932" strokeWidth="2" opacity="0.15" />
    <line x1="140" y1="358" x2="125" y2="370" stroke="#1E3932" strokeWidth="1.5" opacity="0.15" />
    <line x1="140" y1="358" x2="155" y2="370" stroke="#1E3932" strokeWidth="1.5" opacity="0.15" />
    <line x1="140" y1="380" x2="130" y2="400" stroke="#1E3932" strokeWidth="1.5" opacity="0.15" />
    <line x1="140" y1="380" x2="150" y2="400" stroke="#1E3932" strokeWidth="1.5" opacity="0.15" />
    {/* Sky cutout */}
    <rect x="380" y="300" width="180" height="120" fill="#e8f0f4" opacity="0.4" rx="2" />
    <circle cx="440" cy="340" r="20" fill="#cba258" opacity="0.12" />
    {/* Hairline annotations */}
    <line x1="40" y1="60" x2="560" y2="60" stroke="#006241" strokeWidth="0.5" opacity="0.15" />
    <line x1="40" y1="400" x2="560" y2="400" stroke="#006241" strokeWidth="0.5" opacity="0.15" />
    <line x1="60" y1="40" x2="60" y2="410" stroke="#006241" strokeWidth="0.5" opacity="0.15" />
    <line x1="540" y1="40" x2="540" y2="410" stroke="#006241" strokeWidth="0.5" opacity="0.15" />
    {/* Crosshairs */}
    <line x1="280" y1="140" x2="280" y2="260" stroke="#cba258" strokeWidth="0.5" opacity="0.3" />
    <line x1="230" y1="200" x2="330" y2="200" stroke="#cba258" strokeWidth="0.5" opacity="0.3" />
    {/* Plate number */}
    <text x="540" y="430" fontFamily="monospace" fontSize="10" fill="#5a5448" opacity="0.5" textAnchor="end">
      PLATE Nº 01 · MMXXVI
    </text>
    {/* Registration marks */}
    <circle cx="50" cy="50" r="4" stroke="#006241" strokeWidth="0.5" fill="none" opacity="0.3" />
    <circle cx="550" cy="50" r="4" stroke="#006241" strokeWidth="0.5" fill="none" opacity="0.3" />
    <circle cx="50" cy="400" r="4" stroke="#006241" strokeWidth="0.5" fill="none" opacity="0.3" />
    <circle cx="550" cy="400" r="4" stroke="#006241" strokeWidth="0.5" fill="none" opacity="0.3" />
  </svg>
);

/* ─── Styled theme toggle (Atelier Zero aesthetic) ─── */
function ThemeToggleStyled() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label="Toggle theme"
      style={{
        background: 'transparent',
        border: '1px solid var(--az-rule-strong)',
        borderRadius: '9999px',
        padding: '5px 12px',
        cursor: 'pointer',
        fontFamily: 'var(--az-font-display)',
        fontSize: '11px',
        fontWeight: 600,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: 'var(--az-ink-soft)',
        transition: 'all 0.18s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,0,0,0.04)';
        (e.currentTarget as HTMLButtonElement).style.color = 'var(--az-ink)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
        (e.currentTarget as HTMLButtonElement).style.color = 'var(--az-ink-soft)';
      }}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: isDark ? 'var(--az-accent)' : 'var(--az-ink-muted)',
          display: 'inline-block',
          transition: 'background 0.18s ease',
        }}
      />
      {isDark ? 'Light' : 'Dark'}
    </button>
  );
}

/* ─── Styled locale toggle (Atelier Zero aesthetic) ─── */
function LocaleToggleStyled() {
  const { locale, setLocale } = useLocale();
  const isZh = locale === 'zh-CN';

  return (
    <button
      onClick={() => setLocale(isZh ? 'en' : 'zh-CN')}
      aria-label="Toggle language"
      style={{
        background: 'transparent',
        border: '1px solid var(--az-rule-strong)',
        borderRadius: '9999px',
        padding: '5px 12px',
        cursor: 'pointer',
        fontFamily: 'var(--az-font-display)',
        fontSize: '11px',
        fontWeight: 600,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: 'var(--az-ink-soft)',
        transition: 'all 0.18s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,0,0,0.04)';
        (e.currentTarget as HTMLButtonElement).style.color = 'var(--az-ink)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
        (e.currentTarget as HTMLButtonElement).style.color = 'var(--az-ink-soft)';
      }}
    >
      <span style={{ fontFamily: 'var(--az-font-mono)', fontSize: '10px', color: 'var(--az-accent)' }}>⌘</span>
      {isZh ? 'EN' : '中文'}
    </button>
  );
}

export default function LandingPage() {
  const { t } = useLocale();
  const revealRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    revealRefs.current = revealRefs.current.filter(Boolean);
    revealRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const addReveal = () => {
    const i = revealRefs.current.length;
    revealRefs.current.push(null);
    return (ref: HTMLDivElement | null) => { revealRefs.current[i] = ref; };
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--az-paper)', position: 'relative' }}>

      {/* ── Side Rails ── */}
      <div className="side-rail side-rail-left">MailMind v0.1 · Read-Only · EST. 2025</div>
      <div className="side-rail side-rail-right">SECURE · PRIVATE · LOCAL-FIRST</div>

      {/* ── Navigation ── */}
      <nav className="az-nav">
        <Link href="/" className="az-nav-brand">MailMind</Link>
        <ul className="az-nav-links">
          <li><Link href="/experience">{t('nav.experience')}</Link></li>
          <li><Link href="/about">{t('nav.about')}</Link></li>
          <li><Link href="/privacy">{t('nav.privacy')}</Link></li>
          <li><a href="https://github.com/GavinCnod/mail-mind-assistant" target="_blank" rel="noreferrer">{t('nav.github')}</a></li>
        </ul>
        {/* Theme + Locale toggles — visible on all screen sizes */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
          <ThemeToggleStyled />
          <LocaleToggleStyled />
        </div>
      </nav>

      {/* ── HERO ── */}
      <header className="az-hero">
        <div className="az-container">
          <div className="az-hero-inner">
            {/* Left: Editorial copy */}
            <div>
              <div className="az-eyebrow" ref={addReveal()}>Read-only AI · Inbox Triage</div>
              <h1 className="az-headline" ref={addReveal()}>
                Understand<br />
                <em>your inbox,</em><br />
                never send<span style={{ color: 'var(--az-accent)' }}>.</span>
              </h1>
              <div className="az-body" ref={addReveal()}>
                <p>{t('landing.tagline')}</p>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '40px', flexWrap: 'wrap' }} ref={addReveal()}>
                <Link href="/experience" className="az-btn-primary">
                  {t('landing.cta')}
                  <span className="arrow">↗</span>
                </Link>
                <a href="https://github.com/GavinCnod/mail-mind-assistant" target="_blank" rel="noreferrer" className="az-btn-ghost">
                  {t('nav.github')}
                </a>
              </div>
            </div>

            {/* Right: Collage image */}
            <div className="az-hero-visual" ref={addReveal()} style={{ backgroundImage: \`url('/images/bg-01.png')`, backgroundSize: 'cover', backgroundPosition: 'center' }}><img src="/images/bg-01.png" alt="Landing" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} /><CollageHero />
              {/* Corner brackets */}
              <div style={{ position: 'absolute', top: 12, left: 12, width: 22, height: 22, borderTop: '1px solid rgba(0,0,0,0.2)', borderLeft: '1px solid rgba(0,0,0,0.2)' }} />
              <div style={{ position: 'absolute', top: 12, right: 12, width: 22, height: 22, borderTop: '1px solid rgba(0,0,0,0.2)', borderRight: '1px solid rgba(0,0,0,0.2)' }} />
              <div style={{ position: 'absolute', bottom: 12, left: 12, width: 22, height: 22, borderBottom: '1px solid rgba(0,0,0,0.2)', borderLeft: '1px solid rgba(0,0,0,0.2)' }} />
              <div style={{ position: 'absolute', bottom: 12, right: 12, width: 22, height: 22, borderBottom: '1px solid rgba(0,0,0,0.2)', borderRight: '1px solid rgba(0,0,0,0.2)' }} />
            </div>
          </div>
        </div>
      </header>

      {/* ── SECTION II: STATS ── */}
      <section style={{ padding: 'var(--az-section-y) 0' }}>
        <div className="az-container">
          <div className="sec-rule reveal" ref={addReveal()}>
            <span className="roman">II.</span>
            <span className="sec-meta">By the numbers · zero write operations · verified</span>
            <span className="page-count">002 / 004</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '24px' }}>
            {[
              { num: '0', label: 'Emails written', accent: true },
              { num: '0', label: 'Deletions', accent: false },
              { num: '5', label: 'Days max retention', accent: false },
              { num: '100%', label: 'Local processing', accent: false },
            ].map((stat, i) => (
              <div key={i} className="reveal" ref={addReveal()} style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', textAlign: 'center' }}>
                <div className={`az-stat-ring ${stat.accent ? 'az-stat-ring--accent' : ''}`}>{stat.num}</div>
                <span style={{ fontFamily: 'var(--az-font-body)', fontSize: '12px', color: 'var(--az-ink-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION III: FEATURES ── */}
      <section style={{ padding: 'var(--az-section-y) 0', background: 'var(--az-paper-dark)' }}>
        <div className="az-container">
          <div className="sec-rule reveal" ref={addReveal()}>
            <span className="roman">III.</span>
            <span className="sec-meta">Capabilities · read-only triage system</span>
            <span className="page-count">003 / 004</span>
          </div>

          <h2 className="az-headline reveal" ref={addReveal()} style={{ fontSize: 'clamp(32px, 5vw, 56px)', marginBottom: '48px' }}>
            Safe by <em>design,</em> secure<span style={{ color: 'var(--az-accent)' }}>.</span>
          </h2>

          <div className="az-features-grid">
            {[
              {
                num: '01',
                tag: 'Read-only',
                icon: '🔒',
                title: 'Read Access Only',
                desc: 'IMAP EXAMINE / POP3 LIST — no STORE, APPEND, COPY, or DELETE. Your mailbox stays exactly as you left it.',
              },
              {
                num: '02',
                tag: 'Privacy',
                icon: '🛡️',
                title: 'Privacy First',
                desc: 'Passwords never touch disk. Email content is retained for at most 5 days on the local Desktop. Nothing leaves your machine unencrypted.',
              },
              {
                num: '03',
                tag: 'AI Triage',
                icon: '🤖',
                title: 'AI Structured Summaries',
                desc: 'LLM-powered analysis produces structured summaries with priority levels and action recommendations — never automated responses.',
              },
              {
                num: '04',
                tag: 'Local-first',
                icon: '💻',
                title: 'Local-first Desktop',
                desc: 'Desktop application processes everything locally. Web experience requires explicit consent and runs in-session only.',
              },
            ].map((feature) => (
              <div key={feature.num} className="az-card reveal" ref={addReveal()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <span className="az-card-num">{feature.num}</span>
                  <span className="meta-pill" style={{ fontSize: '9px' }}>{feature.tag}</span>
                </div>
                <div style={{ fontSize: '28px', marginBottom: '12px' }}>{feature.icon}</div>
                <h3 style={{
                  fontFamily: 'var(--az-font-display)',
                  fontSize: '17px',
                  fontWeight: 700,
                  letterSpacing: '-0.01em',
                  color: 'var(--az-ink)',
                  margin: '0 0 10px',
                  lineHeight: 1.2,
                }}>{feature.title}</h3>
                <p style={{
                  fontFamily: 'var(--az-font-body)',
                  fontSize: '13px',
                  color: 'var(--az-ink-faint)',
                  lineHeight: 1.6,
                  margin: 0,
                }}>{feature.desc}</p>
                {/* Bottom-right arrow mark */}
                <div style={{
                  position: 'absolute',
                  bottom: '16px',
                  right: '16px',
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  border: '1.5px solid var(--az-rule-strong)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  color: 'var(--az-ink-faint)',
                  transition: 'all 0.18s ease',
                }}>↗</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION IV: HOW IT WORKS ── */}
      <section style={{ padding: 'var(--az-section-y) 0' }}>
        <div className="az-container">
          <div className="sec-rule reveal" ref={addReveal()}>
            <span className="roman">IV.</span>
            <span className="sec-meta">Workflow · four steps from connection to insight</span>
            <span className="page-count">004 / 004</span>
          </div>

          <h2 className="az-headline reveal" ref={addReveal()} style={{ fontSize: 'clamp(32px, 5vw, 56px)', marginBottom: '16px' }}>
            How it <em>works,</em><span style={{ color: 'var(--az-accent)' }}>.</span>
          </h2>
          <p className="az-body reveal" ref={addReveal()} style={{ marginBottom: '56px' }}>
            From protocol handshake to structured summary — every step is read-only, encrypted, and ephemeral.
          </p>

          <div className="az-steps reveal" ref={addReveal()}>
            {[
              { num: 'I', title: 'Protocol Auth', desc: 'IMAP/POP3 CONNECT with read-only mode enabled' },
              { num: 'II', title: 'Encrypted Link', desc: 'STARTTLS / STLS secured channel established' },
              { num: 'III', title: 'AI Analysis', desc: 'Local LLM parses & structures email content' },
              { num: 'IV', title: 'Read Summary', desc: 'Priority triage delivered — zero writes persisted' },
            ].map((step, i) => (
              <div key={step.num} className="az-step">
                <div className="az-step-num">{step.num}</div>
                <div className="az-step-title">{step.title}</div>
                <div className="az-step-desc">{step.desc}</div>
                {i < 3 && <span className="az-step-arrow">→</span>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section style={{ padding: 'var(--az-tight-section) 0 0', background: 'var(--az-paper-dark)' }}>
        <div className="az-container" style={{ textAlign: 'center', paddingBottom: '80px' }}>
          <div className="sec-rule reveal" ref={addReveal()} style={{ maxWidth: '400px', margin: '0 auto 48px' }}>
            <span className="roman" />
            <span className="sec-meta">Get started · free & open source</span>
            <span className="page-count" />
          </div>
          <h2 className="az-headline reveal" ref={addReveal()} style={{ fontSize: 'clamp(36px, 6vw, 72px)' }}>
            Your inbox,<br /><em>understood.</em><span style={{ color: 'var(--az-accent)' }}>.</span>
          </h2>
          <div className="reveal" ref={addReveal()} style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '40px', flexWrap: 'wrap' }}>
            <Link href="/experience" className="az-btn-primary">
              {t('landing.cta')}
              <span className="arrow">↗</span>
            </Link>
            <a href="https://github.com/GavinCnod/mail-mind-assistant" target="_blank" rel="noreferrer" className="az-btn-ghost">
              {t('nav.sourceCode')}
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="az-footer">
        {/* Mega-word background */}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', pointerEvents: 'none' }}>
          <span className="az-footer-mega" style={{ opacity: 0.06, position: 'absolute', fontSize: 'clamp(80px, 18vw, 280px)' }}>
            MAILMIND
          </span>
        </div>
        <div className="az-container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ height: '1px', background: 'var(--az-rule-strong)', margin: '0 0 40px' }} />
          <div className="az-footer-info">
            <span className="az-footer-copy">
              <span className="pulse-dot" style={{ marginRight: '8px' }} />
              MailMind v0.1 · Hackathon Edition · MMXXVI
            </span>
            <span className="az-footer-credit">
              <a href="https://mindrose.xyz" target="_blank" rel="noreferrer" style={{ color: 'var(--az-ink-muted)', textDecoration: 'underline dotted', textUnderlineOffset: '3px' }}>by Mindrose Team</a> · Apache-2.0 License
            </span>
            <span className="az-footer-copy">
              Filed under: AI · Privacy · Read-only
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
