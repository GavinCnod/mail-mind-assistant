//! Triage state management commands

use serde::Deserialize;
use tauri::State;
use crate::AppState;

#[derive(Deserialize)]
pub struct SetTriageRequest {
    pub email_id: String,
    pub state: String, // 'processed', 'later', 'ignored'
}

/// Update triage state for an email
#[tauri::command]
pub fn set_triage_state(
    _state: State<'_, AppState>,
    _request: SetTriageRequest,
) -> Result<(), String> {
    // TODO: Update local_triage table in SQLite
    Ok(())
}
