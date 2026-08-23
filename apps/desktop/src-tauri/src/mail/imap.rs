//! IMAP client adapter using async-imap

use super::{ConnectionConfig, ParsedEmail, MailboxInfo};

/// IMAP client wrapper (placeholder for demo)
pub struct ImapClient {
    config: ConnectionConfig,
}

impl ImapClient {
    pub fn new(config: ConnectionConfig) -> Self {
        Self { config }
    }

    /// Connect to IMAP server (placeholder - requires real network)
    pub async fn connect(&self) -> Result<(), String> {
        Err("IMAP client requires real network connection".to_string())
    }

    /// List mailboxes
    pub async fn list_mailboxes(&self) -> Result<Vec<MailboxInfo>, String> {
        Ok(vec![
            MailboxInfo {
                name: "INBOX".to_string(),
                message_count: 0,
            },
        ])
    }

    /// Fetch emails from mailbox
    pub async fn fetch_emails(
        &self,
        _mailbox: &str,
        _limit: usize,
    ) -> Result<Vec<ParsedEmail>, String> {
        // Demo implementation - returns empty
        Ok(vec![])
    }
}
