import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - MailMind',
  description: 'MailMind Privacy Policy',
};

export default function PrivacyPage() {
  return (
    <div style={{ padding: 'var(--space-6)', maxWidth: '800px', margin: '0 auto' }}>
      <h1>隐私说明</h1>
      <p>Web 端仅处理当次请求中的最近 5–10 封邮件，完成后自动清除所有内存数据。不存储密码、邮件正文或模型请求。</p>
      <p>Desktop 端在本机 SQLite 中保存最近 5 天、最多 500 封邮件及 AI 洞察，可随时清除。密码不落盘，使用系统安全凭证库（P1）。</p>
    </div>
  );
}
