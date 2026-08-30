import type { Metadata } from 'next';
import { ThemeProvider } from '@mailmind/ui';
import { LocaleProvider } from '@mailmind/ui';
import './globals.css';

export const metadata: Metadata = {
  title: 'MailMind - Read-only AI Inbox Triage',
  description: '1st Place Winner of AgnesCode Build Challenge. Your Read-only AI Inbox Triage - Understand, Judge, Act without Send, Modify, or Retain',
  icons: {
    icon: '/favicon.png',
  },
  openGraph: {
    title: 'MailMind - Read-only AI Inbox Triage',
    description: '🏆 1st Place, AgnesCode Build Challenge. A read-only AI email triage assistant — understand, judge, act without send, modify, or retain.',
    images: [{ url: '/images/agnesChallengeAward.png' }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="light">
      <body>
        <ThemeProvider>
          <LocaleProvider>
            {children}
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
