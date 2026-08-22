import { useState } from 'react';
import { useLocale, ThemeToggle, LocaleToggle, Feed, ConsentGate } from '@mailmind/ui';
import type { EmailCardViewModel } from '@mailmind/contracts';

function App() {
  const { t } = useLocale();
  const [hasConsented, setHasConsented] = useState(false);
  const [cards, setCards] = useState<EmailCardViewModel[]>([]);

  const handleConsent = () => {
    setHasConsented(true);
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
          MailMind Desktop
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
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <h1 style={{ fontSize: '2.4rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {t('email.feed.title') || 'Daftar Email'}
              </h1>
              <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-1)' }}>
                {t('email.feed.subtitle') || 'Kelola dan triase email Anda'}
              </p>
            </div>
            <Feed 
              cards={cards} 
              loading={false}
              emptyMessage={t('feed.empty') || 'Belum ada email. Hubungkan akun email Anda.'}
            />
          </>
        )}
      </main>
    </div>
  );
}

export default App;
