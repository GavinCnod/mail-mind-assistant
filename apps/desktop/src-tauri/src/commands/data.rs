//! Data management commands (clear, purge)

use tauri::State;
use crate::AppState;

/// Clear all local data (accounts, emails, insights, triage states)
#[tauri::command]
pub fn clear_all_data(state: State<'_, AppState>) -> Result<(), String> {
    // TODO: Truncate all tables in SQLite
    Ok(())
}

/// Purge data older than retention limit (5 days / 500 emails per account)
#[tauri::command]
pub fn purge_old_data(state: State<'_, AppState>) -> Result<i64, String> {
    // TODO: Delete old records from database
    // Returns number of deleted records
    Ok(0)
}
