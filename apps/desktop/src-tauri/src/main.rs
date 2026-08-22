use mailmind_lib::{AppState, init_app_state};

fn main() {
    let mut app_state = AppState::default();
    
    // Initialize database
    if let Err(e) = init_app_state(&mut app_state) {
        eprintln!("Failed to initialize database: {}", e);
        // Continue without DB for demo purposes
    }
    
    tauri::Builder::default()
        .plugin(tauri_plugin_sql::init())
        .manage(app_state)
        .invoke_handler(tauri::generate_handler![
            // Authentication & Connection
            crate::commands::auth::test_connection,
            
            // Email Sync
            crate::commands::email::sync_emails,
            crate::commands::email::query_feed,
            crate::commands::email::get_insight,
            
            // Triage
            crate::commands::triage::set_triage_state,
            
            // Digest
            crate::commands::digest::generate_digest,
            
            // Data Management
            crate::commands::data::clear_all_data,
            crate::commands::data::purge_old_data,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}