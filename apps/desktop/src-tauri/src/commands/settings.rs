//! Tauri commands for application settings.

use tauri::State;
use zap_settings::Config;

use crate::errors::CommandError;
use crate::state::AppState;

/// Returns the current application settings.
#[tauri::command]
pub fn get_settings(state: State<'_, AppState>) -> Result<Config, CommandError> {
    let config = state.settings_io.load()?;
    Ok(config)
}

/// Saves application settings.
#[tauri::command]
pub fn save_settings(state: State<'_, AppState>, config: Config) -> Result<(), CommandError> {
    state.settings_io.save(&config)?;
    Ok(())
}
