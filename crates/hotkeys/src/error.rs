//! Error types for the hotkey crate.

/// Errors that can occur during hotkey operations.
#[derive(Debug, thiserror::Error)]
pub enum HotkeyError {
    /// Registration failed.
    #[error("Registration failed: {0}")]
    RegistrationFailed(String),

    /// A hotkey conflict was detected.
    #[error("Conflict detected: {0}")]
    ConflictDetected(String),

    /// No backend is available.
    #[error("Backend unavailable: {0}")]
    BackendUnavailable(String),
}

/// Result type alias for hotkey operations.
pub type HotkeyResult<T> = Result<T, HotkeyError>;
