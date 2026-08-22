# MailMind

> Your Read-only AI Inbox Triage

* [中文版 README](README_CN.md) | [Agent 行为规范](AGENTS.md) | [Security Policy](docs/SECURITY.md)

MailMind helps busy professionals quickly understand and prioritize their email without the risk of accidental sends, deletions, or modifications.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         User                                     │
└─────────────────────┬───────────────────────────────────────────┘
                      │
         ┌────────────┴────────────┐
         │                         │
         ▼                         ▼
┌─────────────────┐       ┌─────────────────┐
│   Web App       │       │   Desktop App   │
│  (Next.js 15)   │       │   (Tauri 2)     │
└────────┬────────┘       └────────┬────────┘
         │                         │
         └────────────┬────────────┘
                      │
         ┌────────────┴────────────┐
         │    Shared Packages      │
         │                         │
         │  ┌──────────────────┐   │
         │  │ contracts/       │   │
         │  │ (Zod schemas)    │   │
         │  └──────────────────┘   │
         │  ┌──────────────────┐   │
         │  │ i18n/            │   │
         │  │ (zh-CN, en)      │   │
         │  └──────────────────┘   │
         │  ┌──────────────────┐   │
         │  │ ui/              │   │
         │  │ (React comps)    │   │
         │  └──────────────────┘   │
         └─────────────────────────┘
                      │
         ┌────────────┴────────────┐
         │    External Services    │
         │                         │
         │  ┌──────────────────┐   │
         │  │ Email Server     │   │
         │  │ (IMAP/TLS)       │   │
         │  └──────────────────┘   │
         │  ┌──────────────────┐   │
         │  │ AI Model API     │   │
         │  │ (OpenAI compat)  │   │
         │  └──────────────────┘   │
         │  ┌──────────────────┐   │
         │  │ SQLite (Desktop) │   │
         │  └──────────────────┘   │
         └─────────────────────────┘
```

## Quick Start (Fixture Mode)

For development and demo purposes, MailMind can run with pre-loaded sample emails:

```bash
# Clone the repository
git clone https://github.com/GavinCnod/mail-mind-assistant.git
cd mail-mind-assistant

# Install dependencies
pnpm install

# Start the web app
pnpm dev:web

# Or start the desktop app
pnpm dev:desktop
```

## Real Email Setup

**⚠️ Important:** Use an **app-specific password**, never your main email password.

### Prerequisites
- Node.js 22+
- pnpm 10+
- An email account with IMAP enabled
- An OpenAI-compatible API key

### Configuration

Copy the example environment file and fill in your values:

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
DEMO_LLM_BASE_URL=https://api.openai.com/v1
DEMO_LLM_API_KEY=sk-your-api-key
DEMO_LLM_MODEL=gpt-4o-mini
```

### Running with Real Emails

```bash
# Web app
pnpm dev:web
# Navigate to http://localhost:3000

# Desktop app
pnpm dev:desktop
```

### Supported Email Providers

| Provider | IMAP Host | Port | Notes |
|----------|-----------|------|-------|
| Gmail | imap.gmail.com | 993 | App password required |
| Outlook | outlook.office365.com | 993 | App password required |
| QQ邮箱 | imap.qq.com | 993 | Enable SMTP/IMAP first |
| 163邮箱 | imap.163.com | 993 | Authorization code required |
| Yahoo | imap.mail.yahoo.com | 993 | App password required |

## Safety Guarantees

MailMind makes these promises:

1. **Read-only access** - We never execute any email write commands (STORE, APPEND, COPY, EXPUNGE, DELETE, DELE)
2. **No credential storage** - Passwords exist only in memory during session
3. **No logging of sensitive data** - API keys and passwords never appear in logs
4. **Encryption required** - Only TLS/STARTTLS connections are permitted
5. **Prompt injection defense** - Email content is treated as untrusted data, isolated with XML tags
6. **Data retention limit** - Maximum 5 days / 500 emails (Desktop mode)

## Testing

```bash
# Run all checks
pnpm check

# Type checking
pnpm typecheck

# Security scan
pnpm test:security

# E2E tests
node scripts/e2e-test.mjs
```

## Project Structure

| Directory | Purpose |
|-----------|---------|
| `apps/web/` | Next.js web application with BFF |
| `apps/desktop/` | Tauri 2 desktop application |
| `packages/contracts/` | Shared type definitions and Zod schemas |
| `packages/i18n/` | Internationalization dictionaries |
| `packages/ui/` | Shared React UI components |
| `packages/fixtures/` | Test email samples (.eml files) |
| `docs/` | Documentation and design specs |
| `scripts/` | Build and verification scripts |

## Tech Stack

- **Frontend:** React 19, Next.js 15, Vite
- **Desktop:** Tauri 2, Rust
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Custom CSS tokens
- **Validation:** Zod
- **Database:** SQLite (bundled, local only)
- **Email:** IMAP/POP3 over TLS
- **AI:** OpenAI-compatible API

## Security

See [SECURITY.md](docs/SECURITY.md) for detailed security architecture, threat model, and safety guarantees.

Key security features:
- Zero persistent sessions (Web mode)
- Local-first storage (Desktop mode)
- Parameterized SQL queries
- Prompt injection detection
- Host validation (SSRF protection)

## Roadmap

### Post-Hackathon Features
- [ ] OAuth support (Gmail, Outlook)
- [ ] Attachment OCR
- [ ] Semantic search (Embeddings)
- [ ] Automatic reply drafts
- [ ] Calendar integration
- [ ] RAG-based email history search
- [ ] macOS Keychain / Windows Credential Manager (P1)
- [ ] Full POP3 implementation

## Contributing

Contributions are welcome! Please read our security policy and submit a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built for a hackathon challenge
- Inspired by the need for trustworthy AI email tools
- Security design influenced by OWASP guidelines

---

**Disclaimer:** This is a demonstration project. While we take security seriously, this application has not undergone a professional security audit. Use at your own risk and always prefer application-specific passwords over your main credentials.
