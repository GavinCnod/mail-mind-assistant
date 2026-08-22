# MailMind Architecture

## System Overview

MailMind follows a **shared domain core + thin host** architecture pattern. The Web and Desktop applications share domain models, validation schemas, UI components, and test fixtures while maintaining independent implementations for email I/O and persistence.

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
│  (Next.js)      │       │   (Tauri 2)     │
└────────┬────────┘       └────────┬────────┘
         │                         │
         │    ┌────────────────────┘
         │    │
         │    ▼
         │ ┌──────────────────────────────────────┐
         │ │        Shared Packages               │
         │ │                                      │
         │ │  ┌────────────┐  ┌────────────────┐  │
         │ │  │ contracts/ │  │    i18n/       │  │
         │ │  │  (Zod      │  │  (zh-CN, en)   │  │
         │ │  │   schemas) │  │                │  │
         │ │  └────────────┘  └────────────────┘  │
         │ │                                      │
         │ │  ┌────────────┐  ┌────────────────┐  │
         │ │  │    ui/     │  │  fixtures/     │  │
         │ │  │  (React    │  │  (.eml test    │  │
         │ │  │   comps)   │  │   samples)     │  │
         │ │  └────────────┘  └────────────────┘  │
         │ └──────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                     External Services                           │
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────┐    │
│  │  Email      │    │   AI Model  │    │   Local DB      │    │
│  │  Server     │    │   API       │    │   (SQLite)      │    │
│  │  (IMAP/TLS) │    │             │    │                 │    │
│  └─────────────┘    └─────────────┘    └─────────────────┘    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Architecture Decisions

### 1. pnpm Monorepo

**Decision:** Use pnpm workspaces with workspace: protocol for all internal packages.

**Rationale:**
- Eliminates code duplication between Web and Desktop
- Ensures type consistency through shared contracts
- Enables atomic updates across packages
- Simple build tooling (no Turborepo/Nx needed for hackathon timeline)

### 2. Shared Domain Core

**Decision:** Extract shared concerns into focused packages rather than duplicating logic.

**Package Boundaries:**

| Package | Responsibility | Dependency Rules |
|---------|---------------|------------------|
| `contracts` | Type definitions, Zod schemas, DTOs | Pure TypeScript only |
| `i18n` | Translations, locale utilities | No framework dependencies |
| `ui` | Presentational React components | Depends on contracts + i18n |
| `fixtures` | Test email samples | None |

### 3. Host-Specific Implementation

**Decision:** Web and Desktop implement email I/O independently using platform-appropriate libraries.

**Rationale:**
- Node.js has rich IMAP libraries (`imapflow`)
- Rust has excellent async ecosystem (`async-imap`)
- Sharing mail I/O code would add complexity without benefit
- Different security models for each platform

### 4. Stateless Web API

**Decision:** Use one-shot streaming API instead of persistent sessions.

**Benefits:**
- Simplified server architecture (no session management)
- Natural fit for zero-persistence requirement
- Better fault tolerance (single request lifecycle)
- Easier horizontal scaling

### 5. Local-First Desktop

**Decision:** Store all data locally in SQLite on the user's device.

**Benefits:**
- Complete user control over data
- Works offline
- No server costs
- Privacy-preserving by design

## Component Diagram

```
Web App (Next.js)
├── Pages
│   ├── Landing Page          → Marketing content
│   ├── Experience Page       → Main triage interface
│   └── Privacy Page          → Legal information
│
├── API Routes
│   ├── POST /api/demo/analyze  → One-shot email analysis
│   ├── POST /api/demo/digest   → Half-day briefing
│   └── POST /api/demo/dispose  → Session cleanup
│
├── Server Libraries
│   ├── imap-client.ts          → IMAP connection handler
│   ├── mime-parser.ts          → Email parsing
│   ├── sanitize-html.ts        → Content sanitization
│   ├── ip-guard.ts             → SSRF protection
│   └── llm-adapter.ts          → AI provider client
│
└── Client Components
    ├── ConsentGate             → Permission collection
    ├── ConnectionForm          → Email server config
    └── ThemeToggle             → UI customization

Desktop App (Tauri 2)
├── Frontend (React + Vite)
│   └── Reuses packages/ui components
│
└── Backend (Rust Commands)
    ├── mail/                   → Email protocol handlers
    ├── db/                     → Database operations
    ├── llm/                    → AI integration
    ├── secrets/                → Credential management
    └── commands/               → Tauri command handlers
```

## Security Architecture

### Defense in Depth

```
Layer 1: Consent Gate          → Explicit user authorization
Layer 2: Input Validation      → Schema validation on all inputs
Layer 3: Protocol Enforcement  → TLS-only connections
Layer 4: Host Validation       → SSRF prevention
Layer 5: Content Isolation     → Prompt injection defense
Layer 6: Output Validation     → Schema enforcement on AI responses
Layer 7: Data Minimization     → Limited retention policies
Layer 8: Cleanup Guarantees    → Verified disposal paths
```

### Data Flow Security

| Data Type | Web Storage | Desktop Storage | Logging |
|-----------|-------------|-----------------|---------|
| Email password | Memory only | Keychain/Memory | Never |
| API key | Memory only | Keychain/Memory | Never |
| Email content | Memory only | SQLite (5d/500 limit) | Never |
| AI insights | Memory only | SQLite | Status only |
| Consent record | — | SQLite | Yes (metadata only) |

## Error Handling Strategy

### Cascading Failure Model

```
Email Parse Error → Skip email, continue with others
LLM Error → Retry once, then show fallback content
Schema Validation Error → Request retry from user
Network Timeout → Exponential backoff, then error
Credential Error → Clear error message, no retry
```

### Graceful Degradation

1. **Primary:** Real IMAP + LLM analysis
2. **Fallback 1:** Fixture mode with sample data
3. **Fallback 2:** Deterministic rule-based summaries
4. **Fallback 3:** Empty state with clear messaging

## Deployment Architecture

### Web Deployment

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   CDN / Static  │     │   API Server    │     │   Database      │
│   Hosting       │────▶│   (Node.js)     │────▶│   (Optional)    │
│                 │     │                 │     │                 │
│  - Landing      │     │  - Route        │     │  - Session      │
│  - Experience   │     │    Handlers     │     │    Storage      │
│  - Privacy      │     │  - IMAP         │     │                 │
│                 │     │  - LLM Proxy    │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### Desktop Deployment

```
┌─────────────────────────────────────────────────────────────┐
│                    User's Device                            │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │   Tauri App  │    │   SQLite     │    │  OS Keychain │  │
│  │   (Rust)     │───▶│   Database   │    │  (P1)        │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│         │                                                   │
│         ▼                                                   │
│  ┌──────────────┐    ┌──────────────┐                      │
│  │   IMAP/      │    │   AI Model   │                      │
│  │   POP3       │    │   API        │                      │
│  └──────────────┘    └──────────────┘                      │
└─────────────────────────────────────────────────────────────┘
```

## Future Evolution

### Phase 2 (Post-MVP)
- OAuth integration
- Attachment OCR
- Semantic search with embeddings
- Calendar integration

### Phase 3 (Advanced)
- On-device ML models (offline mode)
- Cross-platform sync (opt-in)
- Plugin system for custom integrations

---

*This document is living. Update when architectural decisions change.*
