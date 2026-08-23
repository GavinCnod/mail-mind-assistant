use mailmind_lib::{AppState, init_app_state, commands};

fn main() {
    let mut app_state = AppState::default();
    
    // Initialize database
    if let Err(e) = init_app_state(&mut app_state) {
        eprintln!("Failed to initialize database: {}", e);
        // Continue without DB for demo purposes
    }
    
    tauri::Builder::default()
        .plugin(tauri_plugin_sql::Builder::new().build())
        .manage(app_state)
        .invoke_handler(tauri::generate_handler![
            // Authentication & Connection
            commands::auth::test_connection,
            
            // Email Sync
            commands::email::sync_emails,
            commands::email::query_feed,
            commands::email::get_insight,
            
            // Triage
            commands::triage::set_triage_state,
            
            // Digest
            commands::digest::generate_digest,
            
            // Data Management
            commands::data::clear_all_data,
            commands::data::purge_old_data,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
