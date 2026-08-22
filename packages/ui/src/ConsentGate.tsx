'use client';

import React, { useState } from 'react';
import { useLocale } from './providers/LocaleProvider';

export interface ConsentGateProps {
  onConsent: () => void;
}

export function ConsentGate({ onConsent }: ConsentGateProps) {
  const { t } = useLocale();
  const [agreed, setAgreed] = useState({
    userAgreement: false,
    privacyPolicy: false,
    mailProcessingAuth: false,
  });

  const allChecked = Object.values(agreed).every(Boolean);

  return (
    <div style={{
      maxWidth: '600px',
      margin: '0 auto',
      padding: 'var(--space-6)',
    }}>
      <h1 style={{
        fontSize: '2.4rem',
        fontWeight: 600,
        color: 'var(--text-primary)',
        marginBottom: 'var(--space-3)',
      }}>
        {t('consent.title')}
      </h1>

      <p style={{
        fontSize: '1.6rem',
        color: 'var(--text-secondary)',
        lineHeight: '1.6',
        marginBottom: 'var(--space-5)',
      }}>
        {t('consent.description')}
      </p>

      <div style={{
        background: 'var(--surface)',
        borderRadius: 'var(--radius-card)',
        padding: 'var(--space-4)',
        boxShadow: 'var(--shadow-card)',
        border: '1px solid var(--border-subtle)',
        marginBottom: 'var(--space-5)',
      }}>
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)', marginBottom: 'var(--space-3)', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={agreed.userAgreement}
            onChange={(e) => setAgreed(p => ({ ...p, userAgreement: e.target.checked }))}
            style={{ marginTop: '0.2rem' }}
          />
          <span style={{ fontSize: '1.5rem', color: 'var(--text-primary)' }}>
            {t('consent.checkboxes.userAgreement')}
          </span>
        </label>

        <label style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)', marginBottom: 'var(--space-3)', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={agreed.privacyPolicy}
            onChange={(e) => setAgreed(p => ({ ...p, privacyPolicy: e.target.checked }))}
            style={{ marginTop: '0.2rem' }}
          />
          <span style={{ fontSize: '1.5rem', color: 'var(--text-primary)' }}>
            {t('consent.checkboxes.privacyPolicy')}
          </span>
        </label>

        <label style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={agreed.mailProcessingAuth}
            onChange={(e) => setAgreed(p => ({ ...p, mailProcessingAuth: e.target.checked }))}
            style={{ marginTop: '0.2rem' }}
          />
          <span style={{ fontSize: '1.5rem', color: 'var(--text-primary)' }}>
            {t('consent.checkboxes.mailProcessingAuth')}
          </span>
        </label>
      </div>

      <p style={{
        fontSize: '1.4rem',
        color: 'var(--text-secondary)',
        fontStyle: 'italic',
        marginBottom: 'var(--space-4)',
      }}>
        {t('consent.notice')}
      </p>

      <button
        onClick={onConsent}
        disabled={!allChecked}
        style={{
          width: '100%',
          padding: 'var(--space-2) var(--space-4)',
          fontSize: '1.6rem',
          fontWeight: 600,
          borderRadius: 'var(--radius-button)',
          border: 'none',
          cursor: allChecked ? 'pointer' : 'not-allowed',
          background: allChecked ? 'var(--color-primary-accent)' : 'var(--color-text-secondary)',
          color: 'white',
          transition: 'all 0.2s ease',
        }}
      >
        {allChecked ? t('consent.connect') : t('consent.connecting')}
      </button>
    </div>
  );
}
