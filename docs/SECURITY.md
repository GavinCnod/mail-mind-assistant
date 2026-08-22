# Security Policy - MailMind

**Version:** 1.0
**Last Updated:** August 2026

## 1. Security Architecture

MailMind is designed with a **security-first, least-privilege** approach. The application operates within strict boundaries to protect user data.

## 2. Threat Model

### 2.1 Threats We Address

| Threat | Control | Status |
|--------|---------|--------|
| Unauthorized email access | Explicit consent gate before any connection | ✅ Implemented |
| Plaintext credentials | TLS/STARTTLS required; no insecure options | ✅ Implemented |
| Credential leakage | Passwords never logged, never stored in DB | ✅ Implemented |
| Prompt injection | Emails treated as untrusted data, isolated from system prompts | ✅ Implemented |
| SSRF attacks | Host validation blocks private/loopback IPs | ✅ Implemented |
| XSS from HTML emails | HTML sanitized before display; no dangerouslySetInnerHTML | ✅ Implemented |
| Persistent session data | Web mode clears all data on session end | ✅ Implemented |
| Unauthorized mail modifications | Code review verifies no write commands are called | ✅ Verified |

### 2.2 Threats Not Addressed (Out of Scope)

| Threat | Reason |
|--------|--------|
| OAuth authentication | Not implemented in v0.1; requires app-specific password |
| Attachment OCR | Not implemented; attachments only show metadata |
| Full email history sync | Limited to 500 emails / 5 days |
| Automated responses | Feature not included; no compose/send capability |

## 3. Email Protocol Security

### IMAP Access
- Uses only read operations: `EXAMINE`, `FETCH`, `UID FETCH`
- Prohibited commands blocked: `STORE`, `APPEND`, `COPY`, `EXPUNGE`
- Connection requires TLS (port 993) or STARTTLS (port 143)
- No plain-text connections allowed

### POP3 Access (Compatibility)
- Uses only read operations: `LIST`, `TOP`, `RETR`
- Prohibited command blocked: `DELE`
- Connection requires TLS (port 995) or STARTTLS (port 110)
- No plain-text connections allowed

## 4. AI/LLM Security

### Prompt Isolation
Email content is separated from system instructions using XML delimiters:
```
<EMAIL_CONTENT>
{user_email_content}
</EMAIL_CONTENT>
```

### Output Validation
All AI responses are validated against strict JSON schemas before being displayed:
- `EmailInsight` schema ensures structured, predictable output
- Invalid schemas cause graceful failure, not execution errors

### Injection Defense
The application detects and flags common prompt injection patterns:
- "Ignore previous instructions"
- "You are now..."
- Direct requests to modify behavior
- Malicious URLs

## 5. Data Storage Security

### Web Mode (Zero Persistence)
- All data exists only in JavaScript memory during active session
- Closing browser tab or ending session clears all data
- No localStorage, IndexedDB, or cookies for sensitive data
- Only theme/locale preferences stored in first-party cookies

### Desktop Mode (Local Storage)
- SQLite database stored in user's application data directory
- Database file permissions follow OS defaults
- Passwords never written to database
- API keys stored in OS keychain (P1) or memory only (P0)
- Auto-purge enforces 5-day / 500-email retention limit

## 6. Network Security

### Outbound Connections
- Only connects to user-configured mail servers
- Only connects to user-configured AI providers
- Host validation prevents SSRF via loopback/private IPs
- Timeout limits prevent resource exhaustion

### Inbound Connections
- Web API validates Origin headers
- Request size limits prevent abuse
- Rate limiting per session

## 7. Credential Management

### What We NEVER Store
- Email passwords in plaintext
- API keys in database
- Full email content in logs
- Credentials in URL parameters or cookies

### What We DO Store
- Masked username (last 4 characters only)
- Connection metadata (host, port, protocol)
- Sync timestamps and status codes

## 8. Incident Response

### Reporting Vulnerabilities
If you discover a security vulnerability, please report it to: security@mailmind.app

### Response Timeline
- Acknowledgment: Within 48 hours
- Assessment: Within 1 week
- Fix: Within 30 days (or sooner for critical issues)

### Disclosure
We follow coordinated disclosure: we won't publish details until users have had time to update.

## 9. Known Limitations

1. **No audit logging**: Session activities are not logged for privacy reasons
2. **No 2FA**: Relies on app-specific passwords from providers
3. **Limited encryption at rest**: Desktop database not encrypted (by design for simplicity)

## 10. Recommendations for Users

- Use application-specific passwords, not your main email password
- Enable 2FA on your email provider account
- Review your email provider's activity logs regularly
- Use the "Clear All Data" feature when switching devices
- Keep the application updated for security patches

---

*This is a beta application. While we take security seriously, this is not a security product. Use common sense when connecting sensitive accounts.*
