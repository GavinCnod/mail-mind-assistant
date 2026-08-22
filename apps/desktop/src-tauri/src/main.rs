use mailmind_lib::AppState;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_sql::init())
        .manage(AppState::default())
        .invoke_handler(tauri::generate_handler![
            // Commands will be registered here
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
