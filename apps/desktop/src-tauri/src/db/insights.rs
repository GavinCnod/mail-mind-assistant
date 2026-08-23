//! Insight storage operations

use rusqlite::{Connection, Result};
use rusqlite::OptionalExtension;

/// Store an email insight
pub fn store_insight(
    conn: &Connection,
    email_id: &str,
    analysis_json: &str,
    schema_version: &str,
) -> Result<String> {
    let insight_id = format!("insight_{}", email_id);
    
    conn.execute(
        "INSERT OR REPLACE INTO email_insights (id, email_id, schema_version, analysis_json, status, analyzed_at)
         VALUES (:id, :email_id, :schema_version, :analysis_json, 'completed', datetime('now'))",
        rusqlite::params![
            insight_id,
            email_id,
            schema_version,
            analysis_json,
        ],
    )?;
    
    Ok(insight_id)
}

/// Get insight for an email
pub fn get_insight(conn: &Connection, email_id: &str) -> Result<Option<(String, String, String)>> {
    let mut stmt = conn.prepare(
        "SELECT id, schema_version, analysis_json FROM email_insights WHERE email_id = :email_id"
    )?;
    
    stmt.query_row(rusqlite::params![email_id], |row| {
        Ok((
            row.get(0)?,
            row.get(1)?,
            row.get(2)?,
        ))
    }).optional()
}

/// Get all insights for an account
pub fn list_insights(conn: &Connection, account_id: &str) -> Result<Vec<(String, String, String, String)>> {
    let mut stmt = conn.prepare(
        "SELECT ei.id, ei.schema_version, ei.analysis_json, e.received_at
         FROM email_insights ei
         JOIN emails e ON ei.email_id = e.id
         WHERE e.account_id = :account_id
         ORDER BY e.received_at DESC"
    )?;
    
    let rows = stmt.query_map(rusqlite::params![account_id], |row| {
        Ok((
            row.get(0)?,
            row.get(1)?,
            row.get(2)?,
            row.get(3)?,
        ))
    })?;
    
    let mut insights = Vec::new();
    for row in rows {
        insights.push(row?);
    }
    
    Ok(insights)
}
