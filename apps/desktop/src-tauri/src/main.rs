//! MailMind Desktop Entry Point
//!
//! This is the main entry point for the Tauri desktop application.

use mailmind_lib::{AppState, register_commands};

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_sql::init())
        .manage(AppState::default())
        .invoke_handler(tauri::generate_handler![
            // Add commands here as they are implemented
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
