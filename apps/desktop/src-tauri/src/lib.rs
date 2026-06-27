//! Tauri application builder, plugin registration, and state management.

#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod errors;
mod events;
mod state;

use tracing::info;

/// Runs the Tauri application.
///
/// # Panics
///
/// Panics if logging initialization or the Tauri application fails to start.
#[allow(clippy::missing_panics_doc)]
pub fn run() {
    zap_logging::init_logging().expect("Failed to initialize logging");
    info!("Starting Zap v{}", env!("CARGO_PKG_VERSION"));

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            let app_handle = app.handle().clone();
            state::init_state(&app_handle)?;
            info!("Application initialized successfully");
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // Health check
            commands::ping,
            commands::get_app_version,
            commands::list_output_apps,
            // Library management
            commands::library::list_collections,
            commands::library::import_folder,
            commands::library::list_sounds,
            commands::library::rename_sound,
            commands::library::toggle_favorite,
            commands::library::set_sound_volume,
            commands::library::delete_sound,
            commands::library::assign_hotkey,
            commands::library::remove_hotkey,
            commands::library::list_hotkeys,
            // Settings
            commands::settings::get_settings,
            commands::settings::save_settings,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
