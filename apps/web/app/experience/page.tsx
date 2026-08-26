'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useLocale, useTheme } from '@mailmind/ui';
import { ThemeToggle, LocaleToggle } from '@mailmind/ui';

/** Fixed-size form field to prevent re-creation on each render */
function FormField({ label, value, onChange, placeholder, type = 'text', hint }: any) {
  return (
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
}

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
  const [lastAnalysis, setLastAnalysis] = useState<any[]>([]);
  const step3Ref = useRef<HTMLDivElement>(null);

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
      console.log('[Experience] Sending connection test with:', { protocol, host, port, encryption, username });
      // Call the actual connection test API
      const res = await fetch('/api/connection/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          protocol,
          host,
          port: Number(port),
          encryption,
          username,
          password,
        }),
      });
      console.log('[Experience] Connection test response:', await res.clone().json());
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || 'Connection failed');
      setConnected(true);
      setError('');
      // Scroll to Step 3 after a brief delay so user sees the success message first
      setTimeout(() => {
        step3Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 600);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setConnecting(false);
    }
  };

  // ─── Analysis state ───
  const [insights, setInsights] = useState<any[]>([]);
  const [emails, setEmails] = useState<any[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [generating, setGenerating] = useState(false);

  // ─── Consent state ───
  const consent = {
    userAgreement: true,
    privacyPolicy: true,
    mailProcessingAuth: true,
  };

  // ─── LLM config from env (only non-sensitive fields) ───
  const llmConfig = {
    baseUrl: process.env.NEXT_PUBLIC_LLM_BASE_URL || 'https://apihub.agnes-ai.com/v1',
    model: process.env.NEXT_PUBLIC_LLM_MODEL || 'agnes-2.0-flash',
    // Note: apiKey is NOT sent to frontend for security reasons
    // Backend will use its own configured key
  };

  // ─── Analysis handlers ───
  const handleAnalyze = async () => {
    setAnalyzing(true);
    setError('');
    
    // Validate connection info before analyzing
    if (!host || !port || !username || !password) {
      setError('请先完成邮箱连接配置（Step 2）');
      setAnalyzing(false);
      return;
    }
    
    const requestBody = {
      consent,
      connection: { host, port: Number(port), username, protocol, encryption },
      password,
      llm: llmConfig,
      uiPreference: { locale: 'zh-CN' },
      maxEmails: 5,
    };
    
    try {
      const res = await fetch('/api/demo/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.message || `HTTP ${res.status}`);
      }
      
      // Parse SSE stream - simplified approach
      const textChunks: string[] = [];
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          textChunks.push(decoder.decode(value, { stream: true }));
        }
      }
      
      const fullText = textChunks.join('');
      console.log('[Analyze] Request body being sent:', JSON.stringify(requestBody, null, 2));
    console.log('[Analyze] Password in request:', !!requestBody.password);
    console.log('[Analyze] Full SSE response preview:', fullText.slice(0, 500));
      
      // Parse events from full text
      const events = fullText.split('\n\n').filter(s => s.trim());
      const collectedEmails: any[] = [];
      const collectedInsights: any[] = [];
      
      for (const eventBlock of events) {
        const lines = eventBlock.split('\n');
        let eventType = '';
        let dataStr = '';
        
        for (const line of lines) {
          if (line.startsWith('event:')) {
            eventType = line.slice(6).trim();
          } else if (line.startsWith('data:')) {
            dataStr = line.slice(5).trim();
          }
        }
        
        if (!dataStr) continue;
        
        try {
          const event = JSON.parse(dataStr);
          console.log('[Analyze] Parsed event type:', eventType || event.type, 'has card:', !!event.card);
          
          if (event.type === 'email' || eventType === 'email') {
            if (event.card) {
              collectedEmails.push(event.card);
              setEmails([...collectedEmails]); // Update display immediately
            }
          } else if (event.type === 'completed' || eventType === 'completed') {
            collectedInsights.push(...(event.insights || []));
            setInsights([...collectedInsights]);
          } else if (event.type === 'error' || eventType === 'error') {
            setError(event.safeMessage || event.message || 'Analysis error');
          }
        } catch (e) {
          console.error('[Analyze] Failed to parse event:', e, 'data:', dataStr);
        }
      }
      
      console.log('[Analyze] Total emails collected:', collectedEmails.length, 'insights:', collectedInsights.length);
      
      // 如果没有收集到任何邮件或洞察，显示明确提示
      if (collectedEmails.length === 0 && collectedInsights.length === 0) {
        setError('未找到可分析的邮件。请检查：1) 邮箱中是否有邮件 2) 邮件是否被标记为已删除');
      }
      
      // Fallback: if we got emails but no insights, use emails as insights
      if (collectedEmails.length > 0 && collectedInsights.length === 0) {
        console.log('[Analyze] Using emails as fallback insights');
        setInsights(collectedEmails.map(e => ({ ...e })));
      }
      
      setConnected(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDigest = async () => {
    if (insights.length === 0) {
      setError('请先分析邮件');
      return;
    }
    setGenerating(true);
    setError('');
    try {
      const res = await fetch('/api/demo/digest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consent,
          insights,
          uiPreference: { locale: 'zh-CN' },
        }),
      });
      if (!res.ok) throw new Error('Digest generation failed');
      const data = await res.json();
      setLastDigest(JSON.stringify(data, null, 2));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setGenerating(false);
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

  // ─── Force reveal elements visible when step changes ───
  useEffect(() => {
    if (!hasConsented) return;
    const timer = setTimeout(() => {
      document.querySelectorAll('.reveal:not(.visible)').forEach(el => {
        el.classList.add('visible');
      });
    }, 50);
    return () => clearTimeout(timer);
  }, [hasConsented, connected]);

  const addReveal = () => {
    const i = revealRefs.current.length;
    revealRefs.current.push(null);
    return (ref: HTMLDivElement | null) => { revealRefs.current[i] = ref; };
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--az-paper)', position: 'relative' }}>

      {/* ── Side Rails ── */}
      <div className="side-rail side-rail-left">MailMind v0.1 · Read-Only · EST. 2026</div>
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

                <style>{`
                  .consent-item:hover .consent-tooltip-text {
                    opacity: 1 !important;
                    visibility: visible !important;
                  }
                  .consent-item:hover .consent-info-icon {
                    background: var(--az-accent);
                    color: #1E3932;
                  }
                `}</style>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                  {[
                    { 
                      key: 'userAgreement', 
                      text: t('consent.checkboxes.userAgreement'),
                      tooltip: t('consent.tooltips.userAgreement')
                    },
                    { 
                      key: 'privacyPolicy', 
                      text: t('consent.checkboxes.privacyPolicy'),
                      tooltip: t('consent.tooltips.privacyPolicy')
                    },
                    { key: 'mailProcessingAuth', text: t('consent.checkboxes.mailProcessingAuth') },
                  ].map(({ key, text, tooltip }) => (
                    <div key={key} className="consent-item" style={{ position: 'relative' }}>
                      <label style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px',
                        cursor: 'pointer',
                        padding: '16px',
                        background: 'var(--az-paper-deep)',
                        borderRadius: '12px',
                        border: agreed[key as keyof typeof agreed] ? '1px solid var(--az-accent)' : '1px solid var(--az-rule)',
                        transition: 'border-color 0.18s ease',
                        position: 'relative',
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
                          flex: 1,
                        }}>{text}</span>
                        {tooltip && (
                          <>
                            <span
                              className="consent-info-icon"
                              style={{
                                flexShrink: 0,
                                width: '16px',
                                height: '16px',
                                borderRadius: '50%',
                                background: 'var(--az-rule-strong)',
                                color: 'var(--az-paper)',
                                fontSize: '10px',
                                fontWeight: 700,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'help',
                                letterSpacing: '0.02em',
                                transition: 'background 0.15s ease, color 0.15s ease',
                              }}
                            >
                              i
                            </span>
                            <span
                              className="consent-tooltip-text"
                              style={{
                                position: 'absolute',
                                bottom: 'calc(100% + 8px)',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                backgroundColor: 'var(--az-paper-deep)',
                                border: '1px solid var(--az-rule-strong)',
                                borderRadius: '8px',
                                padding: '8px 12px',
                                fontFamily: 'var(--az-font-body)',
                                fontSize: '11px',
                                color: 'var(--az-ink-muted)',
                                whiteSpace: 'normal',
                                maxWidth: '280px',
                                width: 'max-content',
                                lineHeight: 1.5,
                                zIndex: 100,
                                boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                                pointerEvents: 'none',
                                opacity: 0,
                                visibility: 'hidden',
                                transition: 'opacity 0.15s ease, visibility 0.15s ease',
                              }}
                            >
                              {tooltip}
                            </span>
                          </>
                        )}
                      </label>
                    </div>
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
                  {allChecked ? t('consent.confirmAuth') : t('consent.connect')}
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
                  <p style={{ color: 'var(--color-error)', fontSize: '12px', fontFamily: 'var(--az-font-mono)', marginBottom: '16px', padding: '12px', background: 'rgba(239,68,68,0.1)', borderRadius: '8px' }}>
                    ❌ {error}
                  </p>
                )}
                {connected && !error && (
                  <p style={{ color: 'var(--az-accent)', fontSize: '12px', fontFamily: 'var(--az-font-mono)', marginBottom: '16px', padding: '12px', background: 'rgba(34,197,94,0.1)', borderRadius: '8px', border: '1px solid rgba(34,197,94,0.3)' }}>
                    ✅ 连接成功！可以开始分析邮件了。
                  </p>
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
                  <div ref={(el) => { step3Ref.current = el; revealRefs.current.push(el); }} className="sec-rule reveal">
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
                      <button onClick={handleAnalyze} disabled={analyzing} style={{
                        padding: '12px 24px',
                        fontFamily: 'var(--az-font-display)',
                        fontSize: '14px',
                        fontWeight: 600,
                        background: 'var(--az-accent)',
                        color: '#1E3932',
                        border: 'none',
                        borderRadius: 'var(--radius-button)',
                        cursor: analyzing ? 'not-allowed' : 'pointer',
                        opacity: analyzing ? 0.7 : 1,
                      }}>
                        {analyzing ? t('experience.analyzing') : t('experience.analyzeEmails')}
                      </button>
                      <button onClick={handleDigest} disabled={generating || insights.length === 0} style={{
                        padding: '12px 24px',
                        fontFamily: 'var(--az-font-display)',
                        fontSize: '14px',
                        fontWeight: 600,
                        background: 'var(--az-paper-deep)',
                        color: 'var(--az-ink)',
                        border: '1px solid var(--az-rule-strong)',
                        borderRadius: 'var(--radius-button)',
                        cursor: generating || insights.length === 0 ? 'not-allowed' : 'pointer',
                        opacity: (generating || insights.length === 0) ? 0.7 : 1,
                      }}>
                        {generating ? t('experience.generating') : t('experience.generateBrief')}
                      </button>
                    </div>

                    {/* Analysis Results */}
                    {emails.length > 0 && (
                      <div style={{ marginTop: '24px' }}>
                        <h4 style={{ 
                          fontFamily: 'var(--az-font-display)',
                          fontSize: '16px',
                          fontWeight: 600,
                          color: 'var(--az-ink)',
                          margin: '0 0 12px'
                        }}>
                          {t('experience.analysisResult')} ({emails.length})
                        </h4>
                        <div style={{ 
                          maxHeight: '400px', 
                          overflowY: 'auto',
                          border: '1px solid var(--az-rule)',
                          borderRadius: '8px',
                          background: 'var(--az-paper-deep)'
                        }}>
                          {emails.map((email, idx) => (
                            <div key={idx} style={{
                              padding: '12px',
                              borderBottom: idx < emails.length - 1 ? '1px solid var(--az-rule)' : 'none'
                            }}>
                              <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between',
                                marginBottom: '4px'
                              }}>
                                <span style={{ 
                                  fontFamily: 'var(--az-font-mono)',
                                  fontSize: '12px',
                                  color: 'var(--az-ink-muted)'
                                }}>
                                  {email.senderName || email.from}
                                </span>
                                <span style={{
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  fontSize: '10px',
                                  fontWeight: 600,
                                  background: email.priority === 'P0' || email.priority === 'P1' 
                                    ? 'rgba(239, 68, 68, 0.1)' 
                                    : 'rgba(34, 197, 94, 0.1)',
                                  color: email.priority === 'P0' || email.priority === 'P1' ? '#dc2626' : '#16a34a'
                                }}>
                                  {email.priority}
                                </span>
                              </div>
                              <div style={{ 
                                fontFamily: 'var(--az-font-body)',
                                fontSize: '13px',
                                color: 'var(--az-ink)',
                                lineHeight: 1.5
                              }}>
                                {email.subject}
                              </div>
                              <div style={{ 
                                fontFamily: 'var(--az-font-body)',
                                fontSize: '12px',
                                color: 'var(--az-ink-muted)',
                                marginTop: '6px',
                                fontStyle: 'italic'
                              }}>
                                {email.oneLineSummary}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

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
              MailMind v0.1.1 · Hackathon Edition · MMXXVI
            </span>
            <span className="az-footer-credit">
              <a href="https://mindrose.xyz" target="_blank" rel="noreferrer" style={{ color: 'var(--az-ink-muted)', textDecoration: 'underline dotted', textUnderlineOffset: '3px' }}>by Gavin Chen from Mindrose Team</a> · MIT License
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
