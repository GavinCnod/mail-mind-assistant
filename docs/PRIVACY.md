# Privacy Policy - MailMind

**Last Updated:** August 2026
**Version:** 1.0

## 1. Introduction

MailMind ("we", "our", "us") is committed to protecting your privacy. This Privacy Policy explains how we handle your data when you use our email triage application.

**Important:** MailMind is a **read-only** application. We never send, delete, move, mark, or modify any of your emails.

## 2. Data We Collect

### Web Experience Mode
- **Email credentials**: Stored only in browser memory during your session. Cleared immediately when you end the experience.
- **Email content**: Processed temporarily in memory only. Never stored on our servers.
- **AI analysis results**: Kept only in your browser memory. Deleted when you close the page or end the session.
- **UI preferences**: Theme (light/dark) and language (zh-CN/en) stored in first-party cookies for display purposes only.

### Desktop Mode
- **Email credentials**: May be stored in your operating system's secure credential store (Keychain/Credential Manager). Not saved in the application database.
- **Email content**: Stored locally on your device in SQLite database.
- **Retention limit**: Maximum 500 emails, kept for no more than 5 days.
- **AI analysis results**: Stored locally alongside email content.
- **UI preferences**: Stored in local SQLite preferences table.

## 3. Data We Don't Collect

- We do NOT collect or store your email password or API key in any persistent storage
- We do NOT log email subjects, body content, or sender information in any analytics
- We do NOT sell or share your data with third parties
- We do NOT track your browsing behavior
- We do NOT maintain any server-side session after you complete or cancel an experience

## 4. How We Use Your Data

Your data is used solely for:
1. **Email triage**: Analyzing your emails to provide summaries and action suggestions
2. **Local processing**: Running AI analysis on your device (Desktop mode) or in-browser (Web mode)
3. **Display**: Showing structured summaries, categories, priorities, and action recommendations

## 5. Third-Party Services

### Email Providers
When you connect your email account, you authenticate directly with your email provider (Gmail, Outlook, Yahoo, etc.). MailMind never stores your credentials permanently. The connection uses encrypted channels (TLS/STARTTLS) only.

### AI Model Provider
Your emails are sent to an AI model provider (e.g., OpenAI) for analysis. This is necessary to generate summaries and suggestions. You configure which provider to use, and their privacy policies apply to the data they receive.

## 6. Security Measures

- **Encryption**: All connections use TLS/STARTTLS encryption. No insecure (plaintext) connections are allowed.
- **Read-only access**: Our application uses only read-only email protocols. No write commands are executed.
- **Data minimization**: We only access the minimum data needed (subject, sender, preview text).
- **Local storage**: Desktop mode stores all data locally on your device. Nothing is uploaded to external servers except AI model requests.
- **Secure credential handling**: Passwords are never written to logs, databases, or browser storage.

## 7. Your Rights

- **Right to access**: You can view all data stored in the Desktop application at any time
- **Right to deletion**: You can permanently delete all your data instantly using the "Clear All Data" feature
- **Right to portability**: Export your data at any time
- **Right to object**: You can disconnect your email account at any time

## 8. Data Retention

- **Web mode**: Zero retention. All data is cleared when you end the session or close the browser.
- **Desktop mode**: Up to 500 emails retained for a maximum of 5 days. Older emails are automatically purged.
- **Consent records**: Kept indefinitely for audit purposes (does not include email content).

## 9. Children's Privacy

MailMind is not intended for use by children under 13. We do not knowingly collect data from children.

## 10. Changes to This Policy

We may update this policy occasionally. We will notify you of significant changes through the application.

## 11. Contact

For privacy concerns, contact us at: privacy@mailmind.app

---

*This privacy policy is part of the MailMind open-source project. By using MailMind, you agree to the terms described herein.*
