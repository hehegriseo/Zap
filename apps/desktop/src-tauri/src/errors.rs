//! Tauri-specific error types for IPC serialization.

use serde::{Deserialize, Serialize};

/// Error type returned from Tauri commands to the frontend.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CommandError {
    /// Human-readable error message.
    pub message: String,
    /// Optional error code for programmatic handling.
    pub code: Option<String>,
}

impl std::fmt::Display for CommandError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.message)
    }
}

impl std::error::Error for CommandError {}

impl From<zap_shared::errors::ZapError> for CommandError {
    fn from(err: zap_shared::errors::ZapError) -> Self {
        Self {
            message: err.to_string(),
            code: None,
        }
    }
}

impl From<String> for CommandError {
    fn from(message: String) -> Self {
        Self {
            message,
            code: None,
        }
    }
}
