import type { Metadata } from 'next';
import { ThemeProvider } from '@mailmind/ui';
import { LocaleProvider } from '@mailmind/ui';
import './globals.css';

export const metadata: Metadata = {
  title: 'MailMind - Read-only AI Inbox Triage',
  description: 'Your Read-only AI Inbox Triage - Understand, Judge, Act without Send, Modify, or Retain',
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
