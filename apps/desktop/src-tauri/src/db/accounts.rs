//! Account management operations

use rusqlite::{Connection, Result};

/// Store or update an account configuration
pub fn upsert_account(
    conn: &Connection,
    id: &str,
    display_name: &str,
    protocol: &str,
    host: &str,
    port: i32,
    username_masked: &str,
) -> Result<()> {
    conn.execute(
        "INSERT OR REPLACE INTO accounts (id, display_name, protocol, host, port, username_masked, created_at)
         VALUES (:id, :display_name, :protocol, :host, :port, :username_masked, COALESCE((SELECT created_at FROM accounts WHERE id = :id), datetime('now')))",
        rusqlite::params![
            id,
            display_name,
            protocol,
            host,
            port,
            username_masked,
        ],
    )?;
    
    Ok(())
}

/// Get all accounts
pub fn list_accounts(conn: &Connection) -> Result<Vec<(String, String, String, String, String)>> {
    let mut stmt = conn.prepare(
        "SELECT id, display_name, protocol, host, username_masked
         FROM accounts ORDER BY created_at DESC"
    )?;
    
    let rows = stmt.query_map([], |row| {
        Ok((
            row.get(0)?,
            row.get(1)?,
            row.get(2)?,
            row.get(3)?,
            row.get(4)?,
        ))
    })?;
    
    let mut accounts = Vec::new();
    for row in rows {
        accounts.push(row?);
    }
    
    Ok(accounts)
}

/// Delete an account and all its emails
pub fn delete_account(conn: &Connection, id: &str) -> Result<usize> {
    // First delete related emails
    let email_count = conn.execute(
        "DELETE FROM emails WHERE account_id = :id",
        rusqlite::params![id],
    )?;
    
    // Then delete the account
    let account_count = conn.execute(
        "DELETE FROM accounts WHERE id = :id",
        rusqlite::params![id],
    )?;
    
    Ok(email_count + account_count)
}
