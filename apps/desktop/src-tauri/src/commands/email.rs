//! Email sync and query commands

use serde::{Deserialize, Serialize};
use tauri::State;
use crate::AppState;
use chrono::{DateTime, Utc};

/// Request to sync emails from an account
#[derive(Deserialize)]
pub struct SyncRequest {
    pub account_id: String,
    pub password: String, // Only in memory, never persisted
    #[serde(default = "default_max_emails")]
    pub max_emails: i32,
}

fn default_max_emails() -> i32 {
    50
}

/// Response after syncing emails
#[derive(Serialize)]
pub struct SyncResponse {
    pub synced_count: i64,
    pub error: Option<String>,
}

/// Query feed of emails
#[derive(Deserialize)]
pub struct QueryFeedRequest {
    pub account_id: String,
    #[serde(default = "default_limit")]
    pub limit: i64,
    #[serde(default = "default_offset")]
    pub offset: i64,
}

fn default_limit() -> i64 {
    20
}

fn default_offset() -> i64 {
    0
}

#[derive(Serialize)]
pub struct EmailCard {
    pub id: String,
    pub subject: String,
    pub from_name: String,
    pub received_at: DateTime<Utc>,
    pub has_attachments: bool,
}

/// Sync emails from account (demo: returns placeholder)
#[tauri::command]
pub async fn sync_emails(
    state: State<'_, AppState>,
    request: SyncRequest,
) -> Result<SyncResponse, String> {
    // TODO: Implement real IMAP/POP3 sync
    // For now, return demo response
    
    Ok(SyncResponse {
        synced_count: 0,
        error: None,
    })
}

/// Query email feed with pagination
#[tauri::command]
pub fn query_feed(
    state: State<'_, AppState>,
    request: QueryFeedRequest,
) -> Result<serde_json::Value, String> {
    // TODO: Query SQLite database
    Ok(serde_json::json!({
        "emails": [],
        "total": 0,
        "limit": request.limit,
        "offset": request.offset
    }))
}

/// Get insight for a specific email
#[tauri::command]
pub fn get_insight(
    state: State<'_, AppState>,
    email_id: String,
) -> Result<Option<serde_json::Value>, String> {
    // TODO: Query insights from database
    Ok(None)
}
