//! MailMind Desktop - Rust Backend
//!
//! Core business logic for email sync, storage, and AI analysis.

pub mod mail;
pub mod db;
pub mod secrets;
pub mod llm;
pub mod commands;

/// Application state shared across all Tauri commands
#[derive(Clone)]
pub struct AppState {
    /// Database connection pool (initialized lazily)
    pub db: std::sync::Arc<std::sync::Mutex<Option<rusqlite::Connection>>>,
}

impl Default for AppState {
    fn default() -> Self {
        Self {
            db: std::sync::Arc::new(std::sync::Mutex::new(None)),
        }
    }
}
