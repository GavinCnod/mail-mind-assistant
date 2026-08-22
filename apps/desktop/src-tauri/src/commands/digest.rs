//! Digest generation commands

use serde::{Deserialize, Serialize};
use tauri::State;
use crate::AppState;

#[derive(Deserialize)]
pub struct GenerateDigestRequest {
    pub account_id: String,
    pub window_start: String,
    pub window_end: String,
}

#[derive(Serialize)]
pub struct DigestReport {
    pub headline: String,
    pub top_priorities: Vec<String>,
    pub recommended_actions: Vec<String>,
    pub risks_and_blockers: Vec<String>,
}

/// Generate half-day digest report
#[tauri::command]
pub fn generate_digest(
    state: State<'_, AppState>,
    request: GenerateDigestRequest,
) -> Result<DigestReport, String> {
    // TODO: Aggregate insights from database and generate digest
    Ok(DigestReport {
        headline: "Half-Day Briefing".to_string(),
        top_priorities: vec![],
        recommended_actions: vec![],
        risks_and_blockers: vec![],
    })
}
