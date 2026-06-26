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
    #[allow(dead_code)]
    pub database: Arc<Database>,
    /// Settings I/O handler.
    #[allow(dead_code)]
    pub settings_io: Arc<SettingsIo>,
}

/// Initializes application state and stores it with Tauri.
pub fn init_state(app: &tauri::AppHandle) -> Result<(), CommandError> {
    let db_path = zap_shared::utils::database_file();
    let database = Database::open(&db_path).map_err(|e| CommandError {
        message: e.to_string(),
        code: Some("DB_INIT_FAILED".to_string()),
    })?;

    let config_path = zap_shared::utils::config_file();
    let settings_io = SettingsIo::new(&config_path);

    let state = AppState {
        database: Arc::new(database),
        settings_io: Arc::new(settings_io),
    };

    app.manage(state);
    info!("Application state initialized");
    Ok(())
}
