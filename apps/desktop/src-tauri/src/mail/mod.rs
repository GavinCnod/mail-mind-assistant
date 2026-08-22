//! Email protocol handlers (IMAP/POP3)

pub mod imap;
pub mod pop3;
pub mod parser;

pub use imap::ImapClient;
pub use pop3::Pop3Client;
pub use parser::parse_email;

use serde::{Deserialize, Serialize};

/// Connection configuration (password not stored persistently)
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct ConnectionConfig {
    pub protocol: Protocol,
    pub host: String,
    pub port: i32,
    pub encryption: EncryptionMethod,
    pub username: String,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub enum Protocol {
    #[serde(rename = "imap")]
    Imap,
    #[serde(rename = "pop3")]
    Pop3,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub enum EncryptionMethod {
    #[serde(rename = "ssl")]
    Ssl,
    #[serde(rename = "starttls")]
    StartTls,
}

/// Parsed email data for storage
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct ParsedEmail {
    pub remote_key: String,
    pub subject: String,
    pub from_name: String,
    pub from_email: String,
    pub received_at: String, // ISO 8601
    pub body_plain: String,
    pub body_html: Option<String>,
    pub has_attachments: bool,
    pub attachment_count: i32,
}

/// IMAP mailbox info
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct MailboxInfo {
    pub name: String,
    pub message_count: i64,
}
