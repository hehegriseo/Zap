//! Tauri command handlers.
//!
//! Each command is a thin adapter that bridges IPC calls
//! to the underlying crate APIs. Commands should not contain
//! business logic — delegate to workspace crates instead.

/// Ping command for health checks / IPC verification.
///
/// Returns "Pong from Rust" to confirm the full communication path works.
#[tauri::command]
pub fn ping() -> String {
    "Pong from Rust".to_string()
}

/// Returns the application version.
#[tauri::command]
pub fn get_app_version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}
