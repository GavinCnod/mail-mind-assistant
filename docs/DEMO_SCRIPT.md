# MailMind Demo Script

**Total Time:** ~5 minutes
**Version:** 0.1
**Date:** August 2026

## Preparation

Before the demo, ensure:
- [ ] Test email account has 8-10 sample emails ready
- [ ] AI API key is configured and working
- [ ] Both Web and Desktop apps are running
- [ ] Backup video recorded (for emergency)

---

## Part 1: Landing Page (30 seconds)

**Action:** Navigate to http://localhost:3000 or deployed URL

**Script:**
> "Welcome to MailMind. This is a read-only AI email triage tool. Unlike other AI email assistants, MailMind can NEVER send, delete, or modify your emails. It only reads and analyzes."

**Show:**
- Landing page with clear messaging
- Feature cards highlighting read-only, privacy, AI triage

---

## Part 2: Consent Gate (30 seconds)

**Action:** Click "Start Experience"

**Script:**
> "Before connecting any email, MailMind requires explicit consent. Three checkboxes must all be checked before you can proceed. This is non-negotiable."

**Show:**
- Three consent checkboxes
- Uncheck one to show the button stays disabled
- Check all three

---

## Part 3: Email Connection (60 seconds)

**Action:** Fill in connection form with test credentials

**Script:**
> "I'm connecting to a test email account. Notice: I must use an app-specific password, not my main password. The connection requires TLS encryption - there's no option for insecure connections."

**Show:**
- Connection form with IMAP settings
- Emphasize SSL/TLS selection
- Submit and show loading indicator

---

## Part 4: Streaming Analysis (90 seconds)

**Action:** Watch cards appear one by one

**Script:**
> "Here's where MailMind shines. Instead of waiting for everything to load, you see each email's analysis as it's processed. Let me highlight what you're seeing:"
> 
> 1. **Priority badges** - P0 means urgent, P3 means FYI only
> 2. **One-line summary** - The most important information compressed
> 3. **Suggested actions** - Specific next steps with deadlines when applicable
> 4. **Key facts** - Extracted details like quantities, dates, amounts
> 5. **Confidence score** - How sure the AI is about this analysis

**Point out specific cards:**
- Click on the logistics delay card
- Show the "Requires Action" flag
- Demonstrate the detail view with original email excerpt

---

## Part 5: Prompt Injection Demo (30 seconds)

**Action:** Open the injection attempt email

**Script:**
> "This email tried to manipulate the AI with prompt injection. Notice the warning: 'Detected text that may influence AI judgment.' MailMind treats all email content as untrusted data."

**Show:**
- Highlight the injection warning badge
- Show that no harmful action was taken

---

## Part 6: Half-Day Brief (45 seconds)

**Action:** Click "Generate Brief"

**Script:**
> "Now I can generate a half-day briefing. This doesn't just summarize individual emails - it synthesizes them into actionable insights for your morning or afternoon."

**Show:**
- Top priorities list
- Recommended actions with deadlines
- Risk alerts

---

## Part 7: End Experience (30 seconds)

**Action:** Click "End Experience"

**Script:**
> "When I'm done, I click 'End Experience'. Watch what happens: the connection closes, all temporary data is cleared. If I refresh the page now and try to access any email, it will fail - because nothing was saved."

**Show:**
- Empty state after disposal
- Confirm no cached data remains

---

## Part 8: Desktop Transition (45 seconds)

**Action:** Switch to Desktop application

**Script:**
> "For ongoing use, MailMind offers a desktop application. Here's what's different:"
> 
> 1. **Persistent storage** - Your emails and insights are saved locally
> 2. **Triage states** - Mark emails as processed, later, or ignored
> 3. **Data retention** - Only 5 days / 500 emails max
> 4. **Privacy** - Everything stays on your device

**Show:**
- Same email feed
- Triage buttons
- Settings panel showing data retention limits

---

## Part 9: Clear Data (30 seconds)

**Action:** Click "Clear All Data"

**Script:**
> "I can delete all my data anytime with one click. Let me demonstrate..."

**Show:**
- Confirmation dialog
- Empty database after clearing

---

## Emergency Fallback

If anything fails during the live demo, play the backup video:

> "As a backup, here's a recording of the full demo running smoothly:"

[Play backup video]

---

## Q&A Talking Points

**Q: Why doesn't this use OAuth?**
> "OAuth requires complex app registration and approval. For a hackathon MVP, app-specific passwords are sufficient and more accessible."

**Q: Can this work offline?**
> "Not yet. The AI analysis requires cloud processing. Future versions may support local models."

**Q: What happens if the AI gives wrong analysis?**
> "Each card shows a confidence score. Low-confidence results are flagged for human review."

**Q: How secure is my data?**
> "Passwords are never stored. Emails are only processed in memory or local storage. See our security documentation."
