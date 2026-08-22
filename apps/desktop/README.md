# MailMind Desktop App

Desktop application for MailMind using Tauri 2 + Rust backend.

## Features

- Local SQLite storage for emails and insights
- IMAP/POP3 email synchronization
- AI-powered email triage (OpenAI-compatible)
- Prompt injection defense
- Data retention policy (5 days / 500 emails max)
- OS keychain integration for secure credential storage

## Prerequisites

- Rust toolchain (1.70+)
- Node.js 22+
- pnpm 10+
- Tauri CLI (installed automatically)

## Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev:desktop

# Build for production
pnpm build:desktop
```

## Architecture

```
src-tauri/
├── src/
│   ├── main.rs           # Entry point
│   ├── lib.rs            # Library exports
│   ├── commands/         # Tauri command handlers
│   │   ├── auth.rs       # Connection testing
│   │   ├── email.rs      # Email sync/query
│   │   ├── triage.rs     # Triage state management
│   │   ├── digest.rs     # Digest generation
│   │   └── data.rs       # Data cleanup
│   ├── mail/             # Email protocol handlers
│   │   ├── imap.rs       # IMAP client
│   │   ├── pop3.rs       # POP3 client
│   │   └── parser.rs     # MIME parsing
│   ├── db/               # Database operations
│   │   ├── mod.rs        # DB initialization
│   │   ├── accounts.rs   # Account CRUD
│   │   ├── emails.rs     # Email storage
│   │   └── insights.rs   # Insight storage
│   ├── secrets/          # Credential management
│   └── llm/              # LLM adapter
├── migrations/           # SQL migration files
└── tauri.conf.json       # Tauri configuration
```

## Security

- Passwords never stored in database
- API keys passed per-request only
- TLS required for all connections
- Read-only email access enforced
- Parameterized SQL queries (no injection)
