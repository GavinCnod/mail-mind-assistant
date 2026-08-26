'use client';

import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useLocale, ThemeToggle, LocaleToggle, Feed, ConsentGate } from '@mailmind/ui';
import type { EmailCardViewModel } from '@mailmind/contracts';

/** Check if running in Tauri environment */
function isTauri(): boolean {
  return typeof window !== 'undefined' && (window as any).__TAURI_INTERNALS__ !== undefined;
}

function App() {
  const { t } = useLocale();
  const [hasConsented, setHasConsented] = useState(false);
  const [cards, setCards] = useState<EmailCardViewModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (hasConsented) {
      void syncEmails();
    }
  }, [hasConsented]);

  const handleConsent = () => {
    setHasConsented(true);
  };

  const syncEmails = async () => {
    if (!isTauri()) {
      console.log('[MailMind Desktop] Running in browser mode - fixtures only');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await invoke<any>('query_feed', {
        accountId: 'demo',
        limit: 10,
        offset: 0,
      });

      const mappedCards: EmailCardViewModel[] = (result.emails || []).map((e: any) => ({
        senderName: e.from_name || 'Unknown',
        senderDomain: '',
        receivedAt: e.received_at || new Date().toISOString(),
        hasAttachments: false,
        subject: e.subject || t('desktop.noSubject'),
        schemaVersion: '1.1',
        outputLocale: 'zh-CN' as const,
        oneLineSummary: e.subject || '',
        category: 'other' as any,
        priority: 'P3' as any,
        requiresAction: false,
        suggestedActions: [],
        keyFacts: [],
        deadline: null,
        riskFlags: [],
        confidence: 0.5,
        needsHumanReview: false,
      }));

      setCards(mappedCards);
    } catch (err) {
      console.error('[MailMind Desktop] Sync error:', err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const clearData = async () => {
    if (isTauri()) {
      try {
        await invoke('clear_all_data');
        setCards([]);
      } catch (err) {
        console.error('[MailMind Desktop] Clear error:', err);
      }
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--canvas)' }}>
      {/* Top Navigation */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '64px',
        background: 'var(--surface)',
        boxShadow: 'var(--shadow-nav)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 var(--space-4)',
        zIndex: 100,
      }}>
        <div style={{ fontSize: '2.4rem', fontWeight: 700, color: 'var(--color-primary)' }}>
          {t('desktop.title')}
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <ThemeToggle />
          <LocaleToggle />
        </div>
      </nav>

      <main style={{ paddingTop: '80px', padding: '0 var(--space-4) var(--space-6)' }}>
        {!hasConsented ? (
          <ConsentGate onConsent={handleConsent} />
        ) : (
          <>
            {/* Header with actions */}
            <div style={{ marginBottom: 'var(--space-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h1 style={{ fontSize: '2.4rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {t('email.feed.title') || '收件箱'}
                </h1>
                <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-1)' }}>
                  {t('email.feed.subtitle') || '本地存储 · 隐私优先 · 只读分析'}
                </p>
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <button
                  onClick={syncEmails}
                  disabled={loading}
                  style={{
                    padding: 'var(--space-2) var(--space-4)',
                    background: 'var(--color-primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 'var(--radius-full)',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontWeight: 600,
                  }}
                >
                  {loading ? t('desktop.syncing') : t('desktop.syncEmails')}
                </button>
                <button
                  onClick={clearData}
                  style={{
                    padding: 'var(--space-2) var(--space-4)',
                    background: 'transparent',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-full)',
                    cursor: 'pointer',
                  }}
                >
                  🗑️ {t('desktop.clearData')}
                </button>
              </div>
            </div>

            {/* Error display */}
            {error && (
              <div style={{
                padding: 'var(--space-3)',
                background: 'var(--color-danger-bg)',
                border: '1px solid var(--color-danger)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--color-danger)',
                marginBottom: 'var(--space-4)',
              }}>
                ⚠️ {error}
              </div>
            )}

            {/* Feed */}
            <Feed
              cards={cards}
              loading={loading}
              emptyMessage={cards.length === 0 && !loading ? t('desktop.emptyMessage') : ''}
            />

            {/* Info footer */}
            <footer style={{ marginTop: 'var(--space-8)', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '1.4rem' }}>
              <p>{t('desktop.footer')}</p>
              <p style={{ marginTop: 'var(--space-1)' }}>{t('desktop.footerDetail')}</p>
            </footer>
          </>
        )}
      </main>
    </div>
  );
}

export default App;