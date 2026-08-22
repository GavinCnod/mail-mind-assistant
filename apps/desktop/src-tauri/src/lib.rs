//! MailMind Desktop - Rust Backend
//!
//! Core business logic for email sync, storage, and AI analysis.

pub mod mail;
pub mod db;
pub mod secrets;
pub mod llm;
pub mod commands;

use std::path::PathBuf;
use rusqlite::Connection;
use crate::db::{init_db, run_migrations};

/// Application state shared across all Tauri commands
#[derive(Clone)]
pub struct AppState {
    /// Database connection (initialized in main)
    pub db: std::sync::Arc<std::sync::Mutex<Option<Connection>>>,
    /// Data directory for storing SQLite database
    pub data_dir: PathBuf,
}

impl Default for AppState {
    fn default() -> Self {
        Self {
            db: std::sync::Arc::new(std::sync::Mutex::new(None)),
            data_dir: secrets::get_data_dir(),
        }
    }
}

/// Initialize the database connection and run migrations
pub fn init_app_state(state: &mut AppState) -> Result<(), String> {
    let conn = init_db(&state.data_dir)
        .map_err(|e| format!("Failed to initialize database: {}", e))?;
    
    let migrations_path = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("migrations");
    
    run_migrations(&conn, &migrations_path)
        .map_err(|e| format!("Migration failed: {}", e))?;
    
    *state.db.lock().unwrap() = Some(conn);
    Ok(())
}