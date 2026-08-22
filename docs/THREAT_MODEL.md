# Threat Model - MailMind

**Document Version:** 1.0
**Classification:** Internal
**Last Updated:** August 2026

## 1. System Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   User Device   │────▶│   MailMind App  │────▶│  Email Server   │
│                 │     │  (Web/Desktop)  │     │  (IMAP/POP3)    │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │   AI Provider   │
                        │ (OpenAI Compat) │
                        └─────────────────┘
```

## 2. Assets to Protect

| Asset | Sensitivity | Current Protection |
|-------|-------------|-------------------|
| Email passwords | Critical | Memory-only (Web), Keychain (Desktop) |
| LLM API keys | High | Memory-only, never logged |
| Email content | High | Encrypted in transit, limited retention |
| AI analysis results | Medium | Local storage with auto-purge |
| User preferences | Low | First-party cookies / local DB |

## 3. Trust Boundaries

### Boundary 1: User Input → Application
- **Risk**: Malformed input causing crashes or unexpected behavior
- **Mitigation**: Input validation on all fields; Zod schema validation

### Boundary 2: Application → Email Server
- **Risk**: Credential interception, MITM attacks
- **Mitigation**: TLS required; certificate validation; no plaintext option

### Boundary 3: Application → AI Provider
- **Risk**: Data exposure to third party, prompt injection
- **Mitigation**: Content isolation; schema validation; rate limiting

### Boundary 4: Application → Local Storage
- **Risk**: Data leakage through logs, crashes, or forensic analysis
- **Mitigation**: No secrets in logs; encrypted storage (planned P2); auto-purge

## 4. Data Flow Analysis

### Web Flow
```
User provides credentials → Browser → HTTPS → Next.js Server
    → IMAP over TLS → Email Server
    → Sanitized content → AI Provider API
    → SSE stream → Browser display
    → Dispose session → Clear memory
```

**Attack Vectors:**
- ❌ SSRF via malicious host input → Blocked by IP validation
- ❌ Credential theft via logs → Impossible (no logging)
- ❌ Session hijacking → Impossible (no server sessions)

### Desktop Flow
```
User provides credentials → Tauri Command (Rust)
    → IMAP over TLS → Email Server
    → Sanitized content → AI Provider API (optional)
    → SQLite (local) ← Display in UI
```

**Attack Vectors:**
- ❌ Database exfiltration → Requires physical device access
- ❌ Credential theft → Keychain protection (P1)
- ❌ Privilege escalation → Tauri sandboxing

## 5. DREAD Assessment

| Component | Damage | Reproducibility | Exploitability | Affected Users | Detectability | Risk Score |
|-----------|--------|-----------------|----------------|----------------|---------------|------------|
| Email connection | High | Medium | Easy | All | Medium | **High** |
| AI API call | Medium | Low | Medium | All | Low | **Medium** |
| Local storage | Medium | Low | Hard | Desktop users | Medium | **Low** |
| Consent gate | Low | N/A | N/A | All | High | **None** |

## 6. Mitigation Strategies

### Already Implemented
1. ✅ Read-only email access (no STORE/DELETE/APPEND)
2. ✅ TLS-only connections (no plaintext)
3. ✅ Prompt injection detection
4. ✅ Schema validation on all AI outputs
5. ✅ Automatic data purge (5 days / 500 emails)
6. ✅ No credential logging
7. ✅ Host validation (blocks private IPs)

### Planned (Post-Hackathon)
1. 🔄 SQLite database encryption (AES-256)
2. 🔄 Biometric authentication for sensitive operations
3. 🔄 Secure enclave for credential storage
4. 🔄 Memory sanitization after operations

## 7. Attack Scenarios

### Scenario 1: Prompt Injection
**Attacker:** Malicious email sender
**Goal:** Manipulate AI analysis or extract data
**Feasibility:** Medium (detected but not fully prevented)
**Impact:** Low (no write actions possible)
**Mitigation:** Content isolation, schema enforcement

### Scenario 2: Credential Harvesting
**Attacker:** Network observer
**Goal:** Capture email password
**Feasibility:** Low (TLS required)
**Impact:** High
**Mitigation:** TLS mandatory, app-specific passwords recommended

### Scenario 3: Data Exfiltration
**Attacker:** Malicious AI provider
**Goal:** Access email content
**Feasibility:** Medium (depends on provider)
**Impact:** Medium
**Mitigation:** User controls provider choice; can use local models (future)

## 8. Open Issues

| ID | Issue | Priority | Status |
|----|-------|----------|--------|
| TBD-1 | No automated regression tests for security | Medium | Open |
| TBD-2 | Memory disclosure in crashes | Low | Open |
| TBD-3 | Keychain implementation inconsistency across platforms | Medium | P1 |

---

*This threat model should be reviewed and updated with each major release.*
