//! Database module for SQLite storage

use rusqlite::{Connection, Result};
use std::path::PathBuf;
use std::fs;

pub mod accounts;
pub mod emails;
pub mod insights;

/// Initialize or open the SQLite database
pub fn init_db(data_dir: &PathBuf) -> Result<Connection> {
    // Create data directory if it doesn't exist
    fs::create_dir_all(data_dir)?;
    
    let db_path = data_dir.join("mailmind.db");
    let conn = Connection::open(db_path)?;
    
    // Enable WAL mode for better concurrency
    conn.execute("PRAGMA journal_mode=WAL", [])?;
    conn.execute("PRAGMA synchronous=NORMAL", [])?;
    
    Ok(conn)
}

/// Run migrations from SQL files
pub fn run_migrations(conn: &Connection, migrations_dir: &PathBuf) -> Result<()> {
    if !migrations_dir.exists() {
        return Ok(());
    }
    
    let mut stmt = conn.prepare(
        "CREATE TABLE IF NOT EXISTS schema_migrations (
            version TEXT PRIMARY KEY,
            applied_at TEXT NOT NULL DEFAULT (datetime('now'))
        )"
    )?;
    
    // Get already applied migrations
    let versions: Vec<String> = conn.query_map(
        "SELECT version FROM schema_migrations ORDER BY version",
        [],
        |row| row.get(0),
    )?.filter_map(|r| r.ok()).collect();
    
    // Find migration files
    for entry in fs::read_dir(migrations_dir)? {
        let entry = entry?;
        let path = entry.path();
        
        if path.is_file() && path.extension().map(|e| e == "sql").unwrap_or(false) {
            let filename = path.file_name()
                .and_then(|n| n.to_str())
                .unwrap_or("");
            
            // Extract version from filename (e.g., "001_initial_schema.sql" -> "001")
            let version = filename.split('_').next()
                .filter(|v| v.chars().all(|c| c.is_ascii_digit()))
                .unwrap_or("");
            
            if !version.is_empty() && !versions.contains(&version.to_string()) {
                let sql = fs::read_to_string(&path)?;
                conn.execute_batch(&sql)?;
                stmt.insert([version])?;
            }
        }
    }
    
    Ok(())
}
