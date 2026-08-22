'use client';

import Link from 'next/link';
import { useLocale, ThemeToggle, LocaleToggle } from '@mailmind/ui';

export default function LandingPage() {
  const { t } = useLocale();

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
          MailMind
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <ThemeToggle />
          <LocaleToggle />
        </div>
      </nav>

      {/* Hero Section */}
      <main style={{ paddingTop: '64px' }}>
        <section style={{
          padding: 'var(--space-9) var(--space-4)',
          maxWidth: '1200px',
          margin: '0 auto',
          textAlign: 'center',
        }}>
          <h1 style={{
            fontSize: '4.8rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            lineHeight: '1.2',
            marginBottom: 'var(--space-4)',
          }}>
            {t('landing.title')}
          </h1>
          <p style={{
            fontSize: '2.4rem',
            color: 'var(--color-primary)',
            fontWeight: 500,
            marginBottom: 'var(--space-3)',
          }}>
            {t('landing.subtitle')}
          </p>
          <p style={{
            fontSize: '1.8rem',
            color: 'var(--text-secondary)',
            lineHeight: '1.6',
            maxWidth: '700px',
            margin: '0 auto var(--space-6)',
          }}>
            {t('landing.tagline')}
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-3)' }}>
            <Link href="/experience">
              <button style={{
                background: 'var(--color-primary-accent)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-button)',
                padding: 'var(--space-2) var(--space-5)',
                fontSize: '1.6rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'transform 0.2s ease',
              }}>
                {t('landing.cta')}
              </button>
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section style={{
          padding: 'var(--space-8) var(--space-4)',
          background: 'var(--surface)',
        }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{
              fontSize: '2.4rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              textAlign: 'center',
              marginBottom: 'var(--space-6)',
            }}>
              核心特性
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 'var(--space-4)',
            }}>
                  {[
                { icon: '🔒', title: '只读访问', desc: '不发送、不删除、不修改任何邮件' },
                { icon: '🛡️', title: '隐私优先', desc: '密码不落盘，邮件不过夜' },
                { icon: '🤖', title: 'AI 分诊', desc: '结构化摘要与行动建议' },
                { icon: '💻', title: '本地优先', desc: 'Desktop 端持续使用' },
              ].map((feature, idx) => (
                <div key={idx} style={{
                  background: 'var(--canvas)',
                  borderRadius: 'var(--radius-card)',
                  padding: 'var(--space-4)',
                  boxShadow: 'var(--shadow-card)',
                  border: '1px solid var(--border-subtle)',
                }}>
                  <div style={{ fontSize: '3.2rem', marginBottom: 'var(--space-2)' }}>{feature.icon}</div>
                  <h3 style={{ fontSize: '1.8rem', fontWeight: 600, marginBottom: 'var(--space-1)' }}>
                    {feature.title}
                  </h3>
                  <p style={{ fontSize: '1.4rem', color: 'var(--text-secondary)' }}>
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section style={{ padding: 'var(--space-8) var(--space-4)' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{
              fontSize: '2.4rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              textAlign: 'center',
              marginBottom: 'var(--space-6)',
            }}>
              工作流程
            </h2>
            <ol style={{
              counterReset: 'step',
              listStyle: 'none',
              padding: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-4)',
            }}>
              {['协议授权', '加密连接', 'AI 分析', '阅读摘要'].map((step, idx) => (
                <li key={idx} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-3)',
                  padding: 'var(--space-3) var(--space-4)',
                  background: 'var(--surface)',
                  borderRadius: 'var(--radius-card)',
                  boxShadow: 'var(--shadow-card)',
                  border: '1px solid var(--border-subtle)',
                }}>
                  <span style={{
                    minWidth: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'var(--color-primary-accent)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 600,
                    fontSize: '1.6rem',
                  }}>
                    {idx + 1}
                  </span>
                  <span style={{ fontSize: '1.8rem', fontWeight: 500 }}>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={{
        padding: 'var(--space-5) var(--space-4)',
        background: 'var(--color-primary-house)',
        color: 'var(--text-white)',
        textAlign: 'center',
      }}>
        <p style={{ fontSize: '1.4rem', opacity: 0.8 }}>
          MailMind v0.1 - Hackathon Edition
        </p>
        <p style={{ fontSize: '1.2rem', opacity: 0.6, marginTop: 'var(--space-1)' }}>
          开源项目 · Apache-2.0 许可证
        </p>
      </footer>
    </div>
  );
}
