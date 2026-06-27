//! Tauri command handlers.
//!
//! Each command is a thin adapter that bridges IPC calls
//! to the underlying crate APIs. Commands should not contain
//! business logic — delegate to workspace crates instead.

#[allow(clippy::needless_pass_by_value)]
pub mod library;
#[allow(clippy::needless_pass_by_value)]
pub mod settings;

use serde::{Deserialize, Serialize};

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

/// Represents an available audio output application/sink.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OutputApp {
    pub id: String,
    pub name: String,
    pub description: String,
    pub is_default: bool,
}

/// Lists available audio output applications using pactl.
/// Falls back to a default list if pactl is not available.
#[tauri::command]
pub async fn list_output_apps() -> Result<Vec<OutputApp>, String> {
    // Try pactl first (works with PulseAudio and PipeWire-PulseAudio)
    if let Ok(output) = std::process::Command::new("pactl")
        .args(["list", "sinks", "short"])
        .output()
    {
        if output.status.success() {
            let stdout = String::from_utf8_lossy(&output.stdout);
            let mut apps: Vec<OutputApp> = stdout
                .lines()
                .filter_map(|line| {
                    let parts: Vec<&str> = line.split('\t').collect();
                    if parts.len() >= 2 {
                        let id = parts[0].to_string();
                        let name = parts[1].to_string();
                        let description = if parts.len() >= 3 {
                            parts[2..].join(" ")
                        } else {
                            name.clone()
                        };
                        let is_default = name.contains("@DEFAULT_SINK@") || id == "@DEFAULT_SINK@";
                        Some(OutputApp {
                            id,
                            name: name.replace("@DEFAULT_SINK@", "Default"),
                            description,
                            is_default,
                        })
                    } else {
                        None
                    }
                })
                .collect();

            if let Some(first) = apps.first_mut() {
                first.is_default = true;
            }

            if !apps.is_empty() {
                return Ok(apps);
            }
        }
    }

    // Fallback: return a default output
    Ok(vec![OutputApp {
        id: "default".to_string(),
        name: "Default Output".to_string(),
        description: "System Default Audio Output".to_string(),
        is_default: true,
    }])
}
