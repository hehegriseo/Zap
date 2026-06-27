//! Managed state types for the Tauri application.

use std::sync::Arc;

use tauri::Manager;
use tracing::info;
use zap_settings::SettingsIo;
use zap_storage::Database;

use crate::errors::CommandError;

/// Application state managed by Tauri.
pub struct AppState {
    /// Database connection.
    pub database: Arc<Database>,
    /// Settings I/O handler.
    pub settings_io: Arc<SettingsIo>,
}

/// Initializes application state and stores it with Tauri.
pub fn init_state(app: &tauri::AppHandle) -> Result<(), CommandError> {
    let db_path = zap_shared::utils::database_file();
    let database = Database::open(&db_path).map_err(|e| CommandError {
        message: e.to_string(),
        code: Some("DB_INIT_FAILED".into()),
    })?;

    let config_path = zap_shared::utils::config_file();
    let settings_io = SettingsIo::new(&config_path);

    // Load settings to verify they're valid; use defaults if missing
    let config = settings_io.load().map_err(|e| CommandError {
        message: e.to_string(),
        code: Some("SETTINGS_LOAD_FAILED".into()),
    })?;

    // Save to ensure file exists with current schema
    settings_io.save(&config).map_err(|e| CommandError {
        message: e.to_string(),
        code: Some("SETTINGS_SAVE_FAILED".into()),
    })?;

    let state = AppState {
        database: Arc::new(database),
        settings_io: Arc::new(settings_io),
    };

    app.manage(state);
    info!("Application state initialized");
    Ok(())
}
