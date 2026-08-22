# MailMind

> Your Read-only AI Inbox Triage

* [中文版 README](README_CN.md) | [Agent 行为规范](AGENTS.md)

MailMind helps busy professionals quickly understand and prioritize their email without the risk of accidental sends, deletions, or modifications.

## Features

- ✉️ **Read-only access** - MailMind can never send, delete, or modify your emails
- 🤖 **AI-powered triage** - Smart summarization and prioritization
- 🔒 **Privacy-first** - Zero persistence in web mode, local-only in desktop mode
- 🌙 **Dark/Light themes** - Comfortable viewing in any environment
- 🌐 **Bilingual** - Support for Indonesian (Bahasa) and English
- ⚡ **Streaming analysis** - See results as they're processed

## Architecture

```
mailmind/
├── apps/
│   ├── web/              # Next.js web experience (BFF + streaming API)
│   └── desktop/          # Tauri 2 desktop app (SQLite + local storage)
├── packages/
│   ├── contracts/        # Shared Zod schemas and TypeScript types
│   ├── i18n/             # Internationalization (zh-CN, en)
│   ├── ui/               # Shared React components
│   ├── fixtures/         # Test email samples
│   └── tsconfig/         # Shared TypeScript configurations
└── docs/                 # Documentation
```

## Quick Start (Fixture Mode)

For development and demo purposes, MailMind can run with pre-loaded sample emails:

```bash
# Clone the repository
git clone https://github.com/yourusername/mailmind.git
cd mailmind

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

## Safety Guarantees

MailMind makes these promises:

1. **Read-only access** - We never execute any email write commands
2. **No credential storage** - Passwords exist only in memory
3. **No logging of sensitive data** - API keys and passwords never appear in logs
4. **Encryption required** - Only TLS/STARTTLS connections are permitted
5. **Prompt injection defense** - Email content is treated as untrusted data

## Testing

```bash
# Run all checks
pnpm check

# Run type checking
pnpm typecheck

# Run linting
pnpm lint

# Run security scan
pnpm test:security
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

## Tech Stack

- **Frontend:** React 19, Next.js 15, Vite
- **Desktop:** Tauri 2, Rust
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Custom CSS tokens
- **Validation:** Zod
- **Database:** SQLite (bundled, local only)
- **Email:** IMAP/POP3 over TLS
- **AI:** OpenAI-compatible API

## Roadmap

### Post-Hackathon Features
- [ ] OAuth support (Gmail, Outlook)
- [ ] Attachment OCR
- [ ] Semantic search
- [ ] Automatic reply drafts
- [ ] Calendar integration
- [ ] RAG-based email history search
- [ ] macOS Keychain / Windows Credential Manager (P1)
- [ ] POP3 full implementation

## Contributing

Contributions are welcome! Please read our contributing guidelines and submit a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built for a hackathon challenge
- Inspired by the need for trustworthy AI email tools
- Security design influenced by OWASP guidelines

---

**Disclaimer:** This is a demonstration project. While we take security seriously, this application has not undergone a professional security audit. Use at your own risk and always prefer application-specific passwords over your main credentials.
