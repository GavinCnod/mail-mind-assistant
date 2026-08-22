'use client';

import { useState, useCallback } from 'react';
import { ConsentGate } from '@mailmind/ui';
import { useLocale } from '@mailmind/ui';

export default function ExperiencePage() {
  const { t } = useLocale();
  const [hasConsented, setHasConsented] = useState(false);
  const [debug] = useState(false);

  const handleConsent = useCallback(() => {
    setHasConsented(true);
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--canvas)' }}>
      <ConsentGate onConsent={handleConsent} />

      {debug && hasConsented && (
        <div style={{ padding: 'var(--space-4)', textAlign: 'center' }}>
          <p>Consent received. Ready for connection form.</p>
        </div>
      )}
    </div>
  );
}
