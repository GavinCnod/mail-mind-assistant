//! POP3 client adapter (read-only)

use super::{ConnectionConfig, ParsedEmail};

/// POP3 client wrapper
pub struct Pop3Client {
    config: ConnectionConfig,
}

impl Pop3Client {
    pub fn new(config: ConnectionConfig) -> Self {
        Self { config }
    }

    /// Connect to POP3 server
    pub async fn connect(&self) -> Result<(), String> {
        // Demo implementation
        Ok(())
    }

    /// List messages
    pub async fn list_messages(&self, limit: usize) -> Result<Vec<ParsedEmail>, String> {
        Ok(vec![])
    }

    /// Fetch message by UID
    pub async fn fetch_message(&self, uid: &str) -> Result<ParsedEmail, String> {
        Err("POP3 fetch not implemented in demo".to_string())
    }
}
