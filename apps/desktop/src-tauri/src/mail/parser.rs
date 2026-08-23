//! MIME email parser using mailparse

use super::ParsedEmail;
use mailparse::{parse_mail, MailHeaderMap};

/// Parse raw email bytes into structured data
pub fn parse_email(raw: &[u8]) -> Result<ParsedEmail, String> {
    let parsed = parse_mail(raw)
        .map_err(|e| format!("Failed to parse email: {}", e))?;

    // Use public API to get header values
    let subject = parsed.get_headers().get_first_value("subject").unwrap_or_default();
    let from = parsed.get_headers().get_first_value("from").unwrap_or_default();

    // Use current time as fallback for date parsing
    let received_at = chrono::Utc::now().to_rfc3339();

    Ok(ParsedEmail {
        remote_key: String::new(),
        subject,
        from_name: from.clone(),
        from_email: String::new(),
        received_at,
        body_plain: String::new(),
        body_html: None,
        has_attachments: false,
        attachment_count: 0,
    })
}
