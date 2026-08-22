//! Command handlers for Tauri IPC

pub mod auth;
pub mod email;
pub mod triage;
pub mod digest;
pub mod data;

// Re-export types
pub use auth::TestConnectionRequest;
pub use email::{SyncRequest, QueryFeedRequest};
