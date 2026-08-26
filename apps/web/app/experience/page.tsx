'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useLocale, useTheme } from '@mailmind/ui';
import { ThemeToggle, LocaleToggle } from '@mailmind/ui';

export default function ExperiencePage() {
  const { t } = useLocale();
  const [hasConsented, setHasConsented] = useState(false);
  const [debug] = useState(false);
  const revealRefs = useRef<(HTMLDivElement | null)[]>([]);

  // ─── Connection form state ───
  const [protocol, setProtocol] = useState<'imap' | 'pop3'>('imap');
  const [host, setHost] = useState('');
  const [port, setPort] = useState('');
  const [encryption, setEncryption] = useState<'ssl' | 'starttls' | 'none'>('ssl');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState('');
  const [lastDigest, setLastDigest] = useState<string | null>(null);

  // ─── Consent gate state ───
  const [agreed, setAgreed] = useState({
    userAgreement: false,
    privacyPolicy: false,
    mailProcessingAuth: false,
  });

  const allChecked = Object.values(agreed).every(Boolean);

  const handleConsent = useCallback(() => {
    setHasConsented(true);
  }, []);

  // ─── Connection handler ───
  const handleConnect = async () => {
    if (!host || !port || !username || !password) {
      setError('All fields are required');
      return;
    }
    setConnecting(true);
    setError('');
    try {
      const res = await fetch('/api/demo/dispose');
      if (!res.ok) throw new Error('Connection failed');
      setConnected(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setConnecting(false);
    }
  };

  // ─── Analysis handlers ───
  const handleAnalyze = async () => {
    try {
      const res = await fetch('/api/demo/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ host, port, username, password, protocol, encryption }),
      });
      if (!res.ok) throw new Error('Analysis failed');
      setConnected(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const handleDigest = async () => {
    try {
      const res = await fetch('/api/demo/digest');
      if (!res.ok) throw new Error('Digest generation failed');
      const data = await res.json();
      setLastDigest(JSON.stringify(data, null, 2));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  // ─── Scroll reveal setup ───
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

  // ─── Form field helper ───
  const FormField = ({ label, value, onChange, placeholder, type = 'text', hint }: any) => (
    <div style={{ marginBottom: '16px' }}>
      <label style={{
        fontFamily: 'var(--az-font-mono)',
        fontSize: '10px',
        color: 'var(--az-ink-muted)',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        display: 'block',
        marginBottom: '6px',
      }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '10px 14px',
          fontFamily: 'var(--az-font-body)',
          fontSize: '14px',
          color: 'var(--az-ink)',
          background: 'var(--az-paper-deep)',
          border: '1px solid var(--az-rule-strong)',
          borderRadius: '8px',
          outline: 'none',
          boxSizing: 'border-box',
        }}
      />
      {hint && (
        <p style={{ fontSize: '11px', color: 'var(--az-ink-faint)', margin: '4px 0 0', fontFamily: 'var(--az-font-mono)' }}>{hint}</p>
      )}
    </div>
  );

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
          <ThemeToggle />
          <LocaleToggle />
        </div>
      </nav>

      {/* ── HERO ── */}
      <header className="az-hero">
        <div className="az-container">
          <div className="az-hero-inner">
            <div>
              <div className="az-eyebrow" ref={addReveal()} dangerouslySetInnerHTML={{ __html: t('experience.headline') }} />
              <div className="az-body" ref={addReveal()}>
                <p>{t('landing.tagline')}</p>
              </div>
              <div style={{ marginTop: '32px', fontFamily: 'var(--az-font-mono)', fontSize: '11px', color: 'var(--az-ink-faint)', letterSpacing: '0.04em' }} ref={addReveal()}>
                {t('experience.modeLabel')}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <section style={{ padding: 'var(--az-section-y) 0' }}>
        <div className="az-container">
          {!hasConsented ? (
            /* ─── CONSENT GATE ─── */
            <div className="reveal" ref={addReveal()} style={{ maxWidth: '560px', margin: '0 auto' }}>
              <div className="sec-rule" ref={addReveal()}>
                <span className="roman">I.</span>
                <span className="sec-meta">{t('experience.step1')}</span>
                <span className="page-count">001 / 003</span>
              </div>
              <div style={{
                background: 'var(--az-paper)',
                border: '1px solid var(--az-rule-strong)',
                borderRadius: 'var(--radius-card)',
                padding: '40px',
              }}>
                <h2 style={{
                  fontFamily: 'var(--az-font-display)',
                  fontSize: '28px',
                  fontWeight: 700,
                  letterSpacing: '-0.01em',
                  color: 'var(--az-ink)',
                  margin: '0 0 12px',
                  lineHeight: 1.2,
                }}>{t('consent.title')}</h2>
                <p style={{
                  fontFamily: 'var(--az-font-body)',
                  fontSize: '14px',
                  color: 'var(--az-ink-muted)',
                  lineHeight: 1.7,
                  margin: '0 0 32px',
                }}>{t('consent.description')}</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                  {[
                    { key: 'userAgreement', text: t('consent.checkboxes.userAgreement') },
                    { key: 'privacyPolicy', text: t('consent.checkboxes.privacyPolicy') },
                    { key: 'mailProcessingAuth', text: t('consent.checkboxes.mailProcessingAuth') },
                  ].map(({ key, text }) => (
                    <label key={key} style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      cursor: 'pointer',
                      padding: '16px',
                      background: 'var(--az-paper-deep)',
                      borderRadius: '12px',
                      border: agreed[key as keyof typeof agreed] ? '1px solid var(--az-accent)' : '1px solid var(--az-rule)',
                      transition: 'border-color 0.18s ease',
                    }}>
                      <input
                        type="checkbox"
                        checked={agreed[key as keyof typeof agreed]}
                        onChange={(e) => setAgreed(p => ({ ...p, [key]: e.target.checked }))}
                        style={{ width: '18px', height: '18px', marginTop: '2px', accentColor: 'var(--az-accent)' }}
                      />
                      <span style={{
                        fontFamily: 'var(--az-font-body)',
                        fontSize: '13px',
                        color: 'var(--az-ink-soft)',
                        lineHeight: 1.6,
                      }}>{text}</span>
                    </label>
                  ))}
                </div>

                <p style={{
                  fontFamily: 'var(--az-font-body)',
                  fontSize: '12px',
                  color: 'var(--az-ink-faint)',
                  fontStyle: 'italic',
                  margin: '0 0 24px',
                  lineHeight: 1.7,
                }}>{t('consent.notice')}</p>

                <button
                  onClick={handleConsent}
                  disabled={!allChecked}
                  style={{
                    width: '100%',
                    padding: '14px 24px',
                    fontFamily: 'var(--az-font-display)',
                    fontSize: '15px',
                    fontWeight: 600,
                    letterSpacing: '0.04em',
                    borderRadius: 'var(--radius-button)',
                    border: 'none',
                    cursor: allChecked ? 'pointer' : 'not-allowed',
                    background: allChecked ? 'var(--az-accent)' : 'var(--az-rule-strong)',
                    color: allChecked ? '#1E3932' : 'var(--az-ink-faint)',
                    transition: 'all 0.18s ease',
                  }}
                >
                  {allChecked ? t('consent.connect') : t('consent.connecting')}
                </button>
              </div>
            </div>
          ) : (
            /* ─── CONNECTION FORM & ANALYSIS ─── */
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
              <div className="sec-rule reveal" ref={addReveal()}>
                <span className="roman">II.</span>
                <span className="sec-meta">{t('experience.step2')}</span>
                <span className="page-count">002 / 003</span>
              </div>

              <div className="reveal" ref={addReveal()} style={{
                background: 'var(--az-paper)',
                border: '1px solid var(--az-rule-strong)',
                borderRadius: 'var(--radius-card)',
                padding: '40px',
                marginBottom: '32px',
              }}>
                <h3 style={{
                  fontFamily: 'var(--az-font-display)',
                  fontSize: '22px',
                  fontWeight: 700,
                  letterSpacing: '-0.01em',
                  color: 'var(--az-ink)',
                  margin: '0 0 24px',
                  lineHeight: 1.2,
                }}>{t('connection.title')}</h3>

                {/* Protocol selector */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                  {(['imap', 'pop3'] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setProtocol(p)}
                      style={{
                        padding: '8px 20px',
                        fontFamily: 'var(--az-font-mono)',
                        fontSize: '12px',
                        fontWeight: 600,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        background: protocol === p ? 'var(--az-accent)' : 'var(--az-paper-deep)',
                        color: protocol === p ? '#1E3932' : 'var(--az-ink-muted)',
                        border: `1px solid ${protocol === p ? 'var(--az-accent)' : 'var(--az-rule-strong)'}`,
                        borderRadius: '6px',
                        cursor: 'pointer',
                        transition: 'all 0.18s ease',
                      }}
                    >
                      {p.toUpperCase()}
                    </button>
                  ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <FormField label={t('connection.host')} value={host} onChange={setHost} placeholder={protocol === 'imap' ? 'imap.gmail.com' : 'pop.gmail.com'} />
                  <FormField label={t('connection.port')} value={port} onChange={setPort} placeholder={protocol === 'imap' ? '993' : '995'} type="number" />
                </div>

                {/* Encryption selector */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{
                    fontFamily: 'var(--az-font-mono)',
                    fontSize: '10px',
                    color: 'var(--az-ink-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    display: 'block',
                    marginBottom: '8px',
                  }}>{t('connection.encryption')}</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {(['ssl', 'starttls', 'none'] as const).map((e) => (
                      <button
                        key={e}
                        onClick={() => setEncryption(e)}
                        style={{
                          padding: '6px 16px',
                          fontFamily: 'var(--az-font-mono)',
                          fontSize: '11px',
                          background: encryption === e ? 'var(--az-accent)' : 'var(--az-paper-deep)',
                          color: encryption === e ? '#1E3932' : 'var(--az-ink-muted)',
                          border: `1px solid ${encryption === e ? 'var(--az-accent)' : 'var(--az-rule-strong)'}`,
                          borderRadius: '6px',
                          cursor: 'pointer',
                        }}
                      >
                        {e === 'ssl' ? t('connection.ssl') : e === 'starttls' ? t('connection.starttls') : 'None'}
                      </button>
                    ))}
                  </div>
                </div>

                <FormField label={t('connection.username')} value={username} onChange={setUsername} placeholder="your.email@example.com" />
                <FormField label={t('connection.password')} value={password} onChange={setPassword} placeholder={t('connection.passwordHint')} type="password" hint={t('connection.passwordHint')} />

                {error && (
                  <p style={{ color: 'var(--color-error)', fontSize: '12px', fontFamily: 'var(--az-font-mono)', marginBottom: '16px' }}>{error}</p>
                )}

                <button
                  onClick={handleConnect}
                  disabled={connecting}
                  style={{
                    width: '100%',
                    padding: '14px 24px',
                    fontFamily: 'var(--az-font-display)',
                    fontSize: '14px',
                    fontWeight: 600,
                    letterSpacing: '0.04em',
                    borderRadius: 'var(--radius-button)',
                    border: 'none',
                    cursor: connecting ? 'not-allowed' : 'pointer',
                    background: connecting ? 'var(--az-rule-strong)' : 'var(--az-accent)',
                    color: '#1E3932',
                    transition: 'all 0.18s ease',
                  }}
                >
                  {connecting ? t('consent.connecting') : t('connection.testConnection')}
                </button>
              </div>

              {connected && (
                <>
                  <div className="sec-rule reveal" ref={addReveal()}>
                    <span className="roman">III.</span>
                    <span className="sec-meta">{t('experience.step3')}</span>
                    <span className="page-count">003 / 003</span>
                  </div>

                  <div className="reveal" ref={addReveal()} style={{
                    background: 'var(--az-paper)',
                    border: '1px solid var(--az-rule-strong)',
                    borderRadius: 'var(--radius-card)',
                    padding: '40px',
                  }}>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      <button onClick={handleAnalyze} style={{
                        padding: '12px 24px',
                        fontFamily: 'var(--az-font-display)',
                        fontSize: '14px',
                        fontWeight: 600,
                        background: 'var(--az-accent)',
                        color: '#1E3932',
                        border: 'none',
                        borderRadius: 'var(--radius-button)',
                        cursor: 'pointer',
                      }}>
                        Analyze Emails
                      </button>
                      <button onClick={handleDigest} style={{
                        padding: '12px 24px',
                        fontFamily: 'var(--az-font-display)',
                        fontSize: '14px',
                        fontWeight: 600,
                        background: 'var(--az-paper-deep)',
                        color: 'var(--az-ink)',
                        border: '1px solid var(--az-rule-strong)',
                        borderRadius: 'var(--radius-button)',
                        cursor: 'pointer',
                      }}>
                        Generate Brief
                      </button>
                    </div>

                    {lastDigest && (
                      <pre style={{
                        marginTop: '24px',
                        padding: '20px',
                        background: 'var(--az-paper-deep)',
                        borderRadius: '12px',
                        fontFamily: 'var(--az-font-mono)',
                        fontSize: '12px',
                        color: 'var(--az-ink-soft)',
                        overflowX: 'auto',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-all',
                      }}>
                        {lastDigest}
                      </pre>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="az-footer">
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
              Filed under: Experience · Analysis
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
