//! MIME email parser using mailparse

use super::ParsedEmail;
use mailparse::{parse_email, ParsedHeader};

/// Parse raw email bytes into structured data
pub fn parse_email(raw: &[u8]) -> Result<ParsedEmail, String> {
    let parsed = parse_email(raw)
        .map_err(|e| format!("Failed to parse email: {}", e))?;

    let headers = parsed.headers;
    
    let subject = headers.iter()
        .find(|h| h.key.eq_ignore_ascii_case("subject"))
        .map(|h| h.value.clone())
        .unwrap_or_default();

    let from = headers.iter()
        .find(|h| h.key.eq_ignore_ascii_case("from"))
        .map(|h| h.value.clone())
        .unwrap_or_default();

    let date = headers.iter()
        .find(|h| h.key.eq_ignore_ascii_case("date"))
        .and_then(|h| chrono::NaiveDateTime::parse_from_rfc2822(&h.value).ok())
        .map(|dt| dt.to_utc());

    Ok(ParsedEmail {
        remote_key: String::new(),
        subject,
        from_name: from.clone(),
        from_email: String::new(),
        received_at: date.unwrap_or_else(|| chrono::Utc::now()),
        body_plain: String::new(),
        body_html: None,
        has_attachments: false,
        attachment_count: 0,
    })
}
