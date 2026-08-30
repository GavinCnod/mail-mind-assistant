'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useLocale, useTheme } from '@mailmind/ui';

/* ─── Styled toggle components (same as other pages) ─── */
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
      <span style={{ fontFamily: 'var(--az-font-mono)', fontSize: '10px', color: 'var(--az-accent)' }}>{isZh ? '中' : 'EN'}</span>
      {isZh ? 'EN' : '中文'}
    </button>
  );
}

export default function AboutPage() {
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
      <div className="side-rail side-rail-left">MailMind v0.1.2 · Read-Only · EST. 2026</div>
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
          <ThemeToggleStyled />
          <LocaleToggleStyled />
        </div>
      </nav>

      {/* ── HERO ── */}
      <header className="az-hero" style={{ paddingBottom: 'var(--az-section-y)', backgroundImage: `url('/images/bg-02.png')`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.68) 100%)', zIndex: 1 }} />
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div className="az-hero-inner" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', color: '#ffffff', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
            <div style={{ maxWidth: '800px' }}>
              <div className="az-eyebrow" ref={addReveal()} style={{ justifyContent: 'center', color: 'rgba(255,255,255,0.85)' }}>Author & Team · Origin Story</div>
              <h1 className="az-headline" ref={addReveal()} style={{ maxWidth: '700px', margin: '0 auto', color: '#ffffff', textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}>
                Who builds<br /><em>MailMind</em><span style={{ color: 'var(--az-accent)' }}>.</span>
              </h1>
              <div className="az-body" ref={addReveal()} style={{ maxWidth: '560px', margin: '0 auto', color: 'rgba(255,255,255,0.9)' }}>
                <p>{t('about.intro')}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── AUTHOR SECTION ── */}
      <section style={{ padding: 'var(--az-section-y) 0' }}>
        <div className="az-container">
          <div className="sec-rule reveal" ref={addReveal()} style={{ maxWidth: '800px', margin: '0 auto 32px' }}>
            <span className="roman">I.</span>
            <span className="sec-meta">Author · Gavin Chen</span>
            <span className="page-count">001 / 004</span>
          </div>
          <div className="reveal" ref={addReveal()} style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ background: 'var(--az-paper)', border: '1px solid var(--az-rule)', borderRadius: 'var(--radius-card)', padding: '40px', display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
              <div style={{ flexShrink: 0 }}>
                <div style={{ width: '120px', height: '120px', borderRadius: '50%', overflow: 'hidden', background: 'var(--az-paper-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px', fontWeight: 700, color: 'var(--az-accent)', fontFamily: 'var(--az-font-display)', flexShrink: 0 }}>
                  G
                </div>
              </div>
              <div>
                <h3 style={{ fontFamily: 'var(--az-font-display)', fontSize: '24px', fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--az-ink)', margin: '0 0 12px' }}>Gavin Chen</h3>
                <p style={{ fontFamily: 'var(--az-font-mono)', fontSize: '11px', color: 'var(--az-ink-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>Solution Architect & Developer</p>
                <p style={{ fontFamily: 'var(--az-font-body)', fontSize: '14px', color: 'var(--az-ink-soft)', lineHeight: 1.8, margin: 0 }}>
                  {t('about.gavinBio')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── AWARD SECTION ── */}
      <section style={{ padding: 'var(--az-section-y) 0' }}>
        <div className="az-container">
          <div className="sec-rule reveal" ref={addReveal()} style={{ maxWidth: '800px', margin: '0 auto 32px' }}>
            <span className="roman">I·II.</span>
            <span className="sec-meta">{t('about.award.meta')}</span>
            <span className="page-count">Award</span>
          </div>
          <div className="reveal" ref={addReveal()} style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ background: 'var(--az-paper)', border: '1px solid #cba258', borderRadius: 'var(--radius-card)', padding: '40px', borderLeft: '3px solid #cba258' }}>
              <h3 style={{ fontFamily: 'var(--az-font-display)', fontSize: '22px', fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--az-ink)', margin: '0 0 16px' }}>
                {t('about.award.title')}
              </h3>
              <p style={{ fontFamily: 'var(--az-font-body)', fontSize: '14px', color: 'var(--az-ink-soft)', lineHeight: 1.8, margin: '0 0 16px' }}>
                {t('about.award.desc')}
              </p>
              <blockquote style={{ margin: '0 0 16px', padding: '16px 20px', background: 'var(--az-paper-deep)', borderLeft: '3px solid var(--az-accent)', borderRadius: '8px', fontFamily: 'var(--az-font-body)', fontSize: '14px', color: 'var(--az-ink-muted)', fontStyle: 'italic', lineHeight: 1.7 }}>
                {t('about.award.comment')}
              </blockquote>
              <p style={{ fontFamily: 'var(--az-font-mono)', fontSize: '11px', color: 'var(--az-ink-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 24px' }}>
                {t('about.award.prize')}
              </p>
              <div style={{ marginTop: '8px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--az-rule)' }}>
                <img src="/images/agnesChallengeAward.png" alt="AgnesCode Build Challenge Award" style={{ width: '100%', height: 'auto', display: 'block' }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TEAM SECTION ── */}
      <section style={{ padding: 'var(--az-section-y) 0', background: 'var(--az-paper-dark)' }}>
        <div className="az-container">
          <div className="sec-rule reveal" ref={addReveal()} style={{ maxWidth: '800px', margin: '0 auto 32px' }}>
            <span className="roman">II.</span>
            <span className="sec-meta">Team · MindRose</span>
            <span className="page-count">002 / 004</span>
          </div>
          <div className="reveal" ref={addReveal()} style={{ maxWidth: '800px', margin: '0 auto 24px' }}>
            <div style={{ background: 'var(--az-paper)', border: '1px solid var(--az-rule)', borderRadius: 'var(--radius-card)', padding: '24px 32px', textAlign: 'center' }}>
              <p style={{ fontFamily: 'var(--az-font-body)', fontSize: '14px', color: 'var(--az-ink-soft)', lineHeight: 1.8, margin: 0 }}>
                {t('about.team.desc')}
              </p>
            </div>
          </div>
          <div className="reveal" ref={addReveal()} style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ background: 'var(--az-paper)', border: '1px solid var(--az-rule)', borderRadius: 'var(--radius-card)', padding: '40px' }}>
              <h3 style={{ fontFamily: 'var(--az-font-display)', fontSize: '20px', fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--az-ink)', margin: '0 0 24px' }}>
                {t('about.team.title')}
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
                {[
                  { name: 'Lindsay Lin', role: 'SEO & International Trade Specialist', initial: 'L', desc: t('about.team.lindsay') },
                  { name: 'Angela Lee', role: 'Online Marketing Specialist', initial: 'A', desc: t('about.team.anthony') },
                  { name: 'Simon L.', role: 'Backend & DevOps Engineer', initial: 'S', desc: t('about.team.simon') },
                ].map((member, i) => (
                  <div key={i} style={{ padding: '20px', background: 'var(--az-paper-deep)', borderRadius: '12px', border: '1px solid var(--az-rule)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', background: 'var(--az-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 700, color: 'var(--az-paper)', flexShrink: 0 }}>
                        {member.initial}
                      </div>
                      <div>
                        <div style={{ fontFamily: 'var(--az-font-display)', fontSize: '14px', fontWeight: 600, color: 'var(--az-ink)' }}>{member.name}</div>
                        <div style={{ fontFamily: 'var(--az-font-mono)', fontSize: '10px', color: 'var(--az-ink-faint)', textTransform: 'uppercase' }}>{member.role}</div>
                      </div>
                    </div>
                    <p style={{ fontFamily: 'var(--az-font-body)', fontSize: '13px', color: 'var(--az-ink-muted)', lineHeight: 1.6, margin: 0 }}>{member.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── OPEN SOURCE TOOLS SECTION ── */}
      <section style={{ padding: 'var(--az-section-y) 0' }}>
        <div className="az-container">
          <div className="sec-rule reveal" ref={addReveal()} style={{ maxWidth: '800px', margin: '0 auto 32px' }}>
            <span className="roman">III.</span>
            <span className="sec-meta">{t('about.openSource.meta')}</span>
            <span className="page-count">003 / 004</span>
          </div>
          <div className="reveal" ref={addReveal()} style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {[
                {
                  name: t('about.openSource.deepseek.name'),
                  desc: t('about.openSource.deepseek.desc'),
                  link: 'https://github.com/GavinCnod/deepseek-api-usage-analysis',
                },
                {
                  name: t('about.openSource.agnes.name'),
                  desc: t('about.openSource.agnes.desc'),
                  link: 'https://github.com/GavinCnod/agnes-api-usage-analysis',
                },
              ].map((tool, i) => (
                <div key={i} style={{ background: 'var(--az-paper)', border: '1px solid var(--az-rule)', borderRadius: 'var(--radius-card)', padding: '32px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <h4 style={{ fontFamily: 'var(--az-font-display)', fontSize: '16px', fontWeight: 700, color: 'var(--az-ink)', margin: '0 0 8px' }}>{tool.name}</h4>
                      <p style={{ fontFamily: 'var(--az-font-body)', fontSize: '14px', color: 'var(--az-ink-soft)', lineHeight: 1.7, margin: 0 }}>{tool.desc}</p>
                    </div>
                    <a
                      href={tool.link}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        fontFamily: 'var(--az-font-display)',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: 'var(--az-accent)',
                        textDecoration: 'none',
                        borderBottom: '1px solid var(--az-accent)',
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                      }}
                    >
                      GitHub →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── ABOUT MINDROSE ── */}
      <section style={{ padding: 'var(--az-section-y) 0', background: 'var(--az-paper-dark)' }}>
        <div className="az-container">
          <div className="sec-rule reveal" ref={addReveal()} style={{ maxWidth: '800px', margin: '0 auto 32px' }}>
            <span className="roman">IV.</span>
            <span className="sec-meta">About · MindRose Studio</span>
            <span className="page-count">004 / 004</span>
          </div>
          <div className="reveal" ref={addReveal()} style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ background: 'var(--az-paper)', border: '1px solid var(--az-rule)', borderRadius: 'var(--radius-card)', padding: '40px' }}>
              <h3 style={{ fontFamily: 'var(--az-font-display)', fontSize: '20px', fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--az-ink)', margin: '0 0 20px' }}>
                {t('about.mindrose.title')}
              </h3>
              <p style={{ fontFamily: 'var(--az-font-body)', fontSize: '14px', color: 'var(--az-ink-soft)', lineHeight: 1.8, margin: '0 0 24px' }}>
                {t('about.mindrose.desc')}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '32px' }}>
                <a href="mailto:hello@mindrose.xyz" style={{ fontFamily: 'var(--az-font-display)', fontSize: '13px', color: 'var(--az-ink-muted)', textDecoration: 'underline dotted', textUnderlineOffset: '3px' }}>hello@mindrose.xyz</a>
                <a href="https://mindrose.xyz" target="_blank" rel="noreferrer" style={{ fontFamily: 'var(--az-font-display)', fontSize: '13px', color: 'var(--az-ink-muted)', textDecoration: 'underline dotted', textUnderlineOffset: '3px' }}>mindrose.xyz</a>
                <a href="https://github.com/GavinCnod" target="_blank" rel="noreferrer" style={{ fontFamily: 'var(--az-font-display)', fontSize: '13px', color: 'var(--az-ink-muted)', textDecoration: 'underline dotted', textUnderlineOffset: '3px' }}>GitHub</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: 'var(--az-tight-section) 0 0', textAlign: 'center' }}>
        <div className="az-container" style={{ paddingBottom: '80px' }}>
          <Link href="/experience" className="az-btn-primary reveal">
            {t('landing.cta')}
            <span className="arrow">{`›`}</span>
          </Link>
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
              MailMind v0.1.1 · Hackathon Edition · MMXXVI
            </span>
            <span className="az-footer-credit">
              <a href="https://mindrose.xyz" target="_blank" rel="noreferrer" style={{ color: 'var(--az-ink-muted)', textDecoration: 'underline dotted', textUnderlineOffset: '3px' }}>by Gavin Chen from Mindrose Team</a> · MIT License
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
