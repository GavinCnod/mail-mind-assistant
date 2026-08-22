-- MailMind SQLite Schema v1.0

-- Accounts table
CREATE TABLE IF NOT EXISTS accounts (
    id TEXT PRIMARY KEY NOT NULL,
    display_name TEXT NOT NULL,
    protocol TEXT NOT NULL CHECK(protocol IN ('imap', 'pop3')),
    host TEXT NOT NULL,
    port INTEGER NOT NULL,
    username_masked TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    last_sync_at TEXT
);

-- Mailboxes table (IMAP only)
CREATE TABLE IF NOT EXISTS mailboxes (
    id TEXT PRIMARY KEY NOT NULL,
    account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    uid_validity INTEGER,
    last_uid INTEGER,
    UNIQUE(account_id, name)
);

-- Emails table
CREATE TABLE IF NOT EXISTS emails (
    id TEXT PRIMARY KEY NOT NULL,
    account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    remote_key TEXT NOT NULL,
    message_id_hash TEXT,
    from_json TEXT NOT NULL,
    subject TEXT,
    received_at TEXT NOT NULL,
    body_text TEXT,
    mime_size INTEGER,
    has_attachments INTEGER DEFAULT 0,
    UNIQUE(account_id, remote_key)
);

-- Email insights table
CREATE TABLE IF NOT EXISTS email_insights (
    id TEXT PRIMARY KEY NOT NULL,
    email_id TEXT NOT NULL REFERENCES emails(id) ON DELETE CASCADE,
    schema_version TEXT NOT NULL DEFAULT '1.1',
    analysis_json TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'completed', 'failed')),
    model_name TEXT,
    analyzed_at TEXT DEFAULT (datetime('now')),
    UNIQUE(email_id)
);

-- Digest reports table
CREATE TABLE IF NOT EXISTS digest_reports (
    id TEXT PRIMARY KEY NOT NULL,
    account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    window_start TEXT NOT NULL,
    window_end TEXT NOT NULL,
    report_json TEXT NOT NULL,
    generated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Local triage state table
CREATE TABLE IF NOT EXISTS local_triage (
    id TEXT PRIMARY KEY NOT NULL,
    email_id TEXT NOT NULL REFERENCES emails(id) ON DELETE CASCADE,
    state TEXT NOT NULL CHECK(state IN ('processed', 'later', 'ignored')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(email_id)
);

-- Consent audit table
CREATE TABLE IF NOT EXISTS consents (
    id TEXT PRIMARY KEY NOT NULL,
    policy_version TEXT NOT NULL,
    consented_at TEXT NOT NULL,
    scope TEXT NOT NULL
);

-- Sync runs log table
CREATE TABLE IF NOT EXISTS sync_runs (
    id TEXT PRIMARY KEY NOT NULL,
    account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    started_at TEXT NOT NULL,
    finished_at TEXT,
    status TEXT NOT NULL CHECK(status IN ('running', 'completed', 'failed')),
    count INTEGER DEFAULT 0,
    error_code TEXT
);

-- App preferences table (theme, locale only)
CREATE TABLE IF NOT EXISTS app_preferences (
    key TEXT PRIMARY KEY NOT NULL,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
