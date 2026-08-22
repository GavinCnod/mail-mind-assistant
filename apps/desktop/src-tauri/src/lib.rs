//! MailMind Desktop - Rust Backend
//!
//! This module contains the core business logic for the desktop application.

/// Application state shared across all Tauri commands
#[derive(Clone)]
pub struct AppState {
    // Will hold database connection and other shared state
}

impl Default for AppState {
    fn default() -> Self {
        Self {}
    }
}

/// Test command to verify the Tauri setup
#[tauri::command]
async fn test_connection() -> Result<String, String> {
    Ok("Connection test successful".to_string())
}

/// Register all Tauri commands
pub fn register_commands() -> Vec<tauri::CommandItem> {
    vec![test_connection()]
}
