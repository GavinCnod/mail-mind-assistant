# MailMind v0.3.1

> Your Read-only AI Inbox Triage · AgnesCode Build Challenge 2026

* [中文版 README](README_CN.md) | [Agent 行为规范](AGENTS.md) | [Security Policy](docs/SECURITY.md)

MailMind helps busy professionals quickly understand and prioritize their email without the risk of accidental sends, deletions, or modifications.

## Problem & Purpose

Email is the most vulnerable interface between users and AI agents. Every automated tool that touches your inbox risks sending unwanted messages, deleting important threads, or leaking sensitive data — because most systems are built with write access by default.

MailMind flips this assumption. It is a **read-only** AI triage assistant that never sends, deletes, moves, or marks mail. It reads, summarizes, categorizes, and recommends — then stops.

This project was built for the **AgnesCode Build Challenge** to demonstrate what trustworthy AI agent design looks like when privacy and safety are architectural constraints, not afterthoughts.

### Why now?

- Professionals receive hundreds of emails weekly; automated triage saves hours
- Growing distrust of AI tools that have broad file/mail access
- Email remains the primary professional communication channel, yet few tools treat its data with read-only discipline

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

```env
DEMO_LLM_BASE_URL=https://api.openai.com/v1
DEMO_LLM_API_KEY=<your-api-key>
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

## Supported Email Protocols

MailMind supports two standard email retrieval protocols, both operating over encrypted TLS connections:

**IMAP (Internet Message Access Protocol)**
- Full mailbox synchronization: reads, searches, and fetches messages without modifying the server copy
- Supports folder navigation, message flags, and partial fetches for better performance on large mailboxes
- Ideal for multi-device access where the user wants to keep emails synchronized across clients
- Recommended for most use cases due to its rich feature set and efficient querying capabilities

**POP3 (Post Office Protocol version 3)**
- Downloads messages from the server to the local device, typically removing them from the server afterward
- Simpler protocol with lower overhead; well-suited for single-device workflows
- Supports retriable fetch operations and UIDL (Unique Identifier) for message tracking
- Useful when users prefer local-first storage with minimal server interaction

Both protocols enforce TLS encryption by default (ports 993 for IMAP, 995 for POP3). MailMind uses read-only commands exclusively — it never sends STORE, APPEND, COPY, EXPUNGE, or DELE operations that could alter mailbox state.

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

## Features

### Web App (`apps/web/`)

| # | Feature | Status |
|---|---------|--------|
| 1 | Landing page with editorial dark-academic design | ✅ Complete |
| 2 | Email triage experience (IMAP/TLS connection) | ✅ Complete |
| 3 | AI-powered streaming email analysis & summary | ✅ Complete |
| 4 | ConsentGate — privacy-first account auth flow | ✅ Complete |
| 5 | Dark / Light theme with Atelier Zero aesthetic | ✅ Complete |
| 6 | Bilingual support (简体中文 / English) via i18n package | ✅ Complete |
| 7 | Privacy policy & about pages | ✅ Complete |
| 8 | API routes: `/api/demo/analyze`, `/api/demo/digest`, `/api/demo/dispose` | ✅ Complete |
| 9 | BFF proxy for AI model calls (OpenAI-compatible) | ✅ Complete |

### Desktop App (`apps/desktop/`)

| # | Feature | Status |
|---|---------|--------|
| 1 | Tauri 2 shell with Rust backend | ✅ Complete |
| 2 | SQLite local-first storage (accounts, emails, insights) | ✅ Complete |
| 3 | IMAP email sync via Tauri commands (`query_feed`, `clear_all_data`) | ✅ Complete |
| 4 | Reusable React UI shared with Web (`packages/ui/`) | ✅ Complete |
| 5 | Dark / Light theme + bilingual toggle | ✅ Complete |
| 6 | POP3 protocol support | 🚧 In progress |
| 7 | macOS Keychain / Windows Credential Manager integration | 🔲 Planned |
| 8 | Build & test (desktop-specific) | ⚠️ Pending final verification |

> ⚠️ The desktop build and packaging steps are pending final verification. All source code is present and functional; the remaining work involves final packaging and verification of the Tauri binary.

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

## Hackathon Submission

| Field | Value |
|-------|-------|
| **Project** | MailMind v0.3.1 |
| **Track** | AI in Product |
| **Model** | Agnes 2.5 Flash (via AgnesCode) |
| **Build dates** | AgnesCode Build Challenge 2026, Aug 20–26 |
| **Live demo** | [mail-mind-assistant-web.vercel.app](https://mail-mind-assistant-web.vercel.app/) |
| **Demo video** | [YouTube unlisted](https://youtu.be/bCos3H7ASMw) |
| **Diagnostics** | AgnesCode diagnostic files available from all sessions |

This project was built entirely with **AgnesCode**, using **Agnes 2.5 Flash** as the underlying model throughout every session.

### How AgnesCode was used

- **Architecture design:** iterative refinement of the read-only safety contract, shared packages structure, and threat model
- **Code generation:** full implementation of IMAP email sync, BFF API routes, Zod schemas, React UI components, and Tauri Rust backend
- **Security audit:** `verify-no-write-mail-commands.mjs` script and AGENTS.md security contract were generated and refined through AgnesCode sessions
- **Documentation:** README, SECURITY.md, PRD documents created and maintained via AgnesCode multi-session workflow

## Contributing

Contributions are welcome! Please read our security policy and submit a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built for the AgnesCode Build Challenge 2026
- Inspired by the need for trustworthy AI email tools
- Security design influenced by OWASP guidelines

---

**Disclaimer:** MailMind uses app-specific passwords exclusively and never stores credentials on disk. All email data is processed locally or in memory only. The project is designed to be fully read-only at the protocol level; known limitations include an incomplete desktop binary build (source code is complete and functional — packaging is pending final verification). Always use app-specific passwords over main credentials.
