//! Email storage operations

use super::init_db;
use crate::mail::ParsedEmail;
use rusqlite::{Connection, Result};
use std::path::PathBuf;

/// Store an email in the database
pub fn store_email(conn: &Connection, account_id: &str, email: &ParsedEmail) -> Result<String> {
    let email_id = format!("email_{}_{}", account_id, email.remote_key);
    
    conn.execute(
        "INSERT OR REPLACE INTO emails (id, account_id, remote_key, subject, from_name, from_email, received_at, body_plain, has_attachments, attachment_count)
         VALUES (:id, :account_id, :remote_key, :subject, :from_name, :from_email, :received_at, :body_plain, :has_attachments, :attachment_count)",
        rusqlite::params![
            email_id,
            account_id,
            &email.remote_key,
            &email.subject,
            &email.from_name,
            &email.from_email,
            email.received_at.to_rfc3339(),
            &email.body_plain,
            email.has_attachments,
            email.attachment_count,
        ],
    )?;
    
    Ok(email_id)
}

/// Query recent emails for an account
pub fn query_emails(
    conn: &Connection,
    account_id: &str,
    limit: i64,
    offset: i64,
) -> Result<Vec<(String, String, String, String, String)>> {
    let mut stmt = conn.prepare(
        "SELECT id, subject, from_name, received_at, body_plain
         FROM emails
         WHERE account_id = :account_id
         ORDER BY received_at DESC
         LIMIT :limit OFFSET :offset"
    )?;
    
    let rows = stmt.query_map(rusqlite::params![account_id, limit, offset], |row| {
        Ok((
            row.get(0)?,
            row.get(1)?,
            row.get(2)?,
            row.get(3)?,
            row.get(4)?,
        ))
    })?;
    
    let mut emails = Vec::new();
    for row in rows {
        emails.push(row?);
    }
    
    Ok(emails)
}

/// Get total email count for an account
pub fn count_emails(conn: &Connection, account_id: &str) -> Result<i64> {
    let mut stmt = conn.prepare(
        "SELECT COUNT(*) FROM emails WHERE account_id = :account_id"
    )?;
    
    stmt.query_row(rusqlite::params![account_id], |row| row.get(0))
}

/// Delete emails older than retention period
pub fn purge_old_emails(conn: &Connection, before_date: &str) -> Result<i64> {
    let mut stmt = conn.prepare(
        "DELETE FROM emails WHERE received_at < :before_date"
    )?;
    
    let deleted = stmt.execute(rusqlite::params![before_date])?;
    Ok(deleted as i64)
}
