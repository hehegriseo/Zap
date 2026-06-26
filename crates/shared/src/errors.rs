//! Unified error types shared across all crates.

/// The primary error type for the Zap application.
#[derive(Debug, thiserror::Error)]
pub enum ZapError {
    /// I/O operation failed.
    #[error("I/O error: {0}")]
    Io(#[from] std::io::Error),

    /// Serialization or deserialization failed.
    #[error("Serialization error: {0}")]
    Serialization(#[from] serde_json::Error),

    /// Database operation failed.
    #[error("Database error: {0}")]
    Database(String),

    /// Audio decode or playback failed.
    #[error("Audio error: {0}")]
    Audio(String),

    /// `PipeWire` operation failed.
    #[error("PipeWire error: {0}")]
    PipeWire(String),

    /// Hotkey registration or handling failed.
    #[error("Hotkey error: {0}")]
    Hotkey(String),

    /// Sound library operation failed.
    #[error("Library error: {0}")]
    Library(String),

    /// Configuration error.
    #[error("Settings error: {0}")]
    Settings(String),

    /// Plugin error.
    #[error("Plugin error: {0}")]
    Plugin(String),

    /// Resource not found.
    #[error("Not found: {0}")]
    NotFound(String),

    /// Validation failed.
    #[error("Validation error: {0}")]
    Validation(String),

    /// A feature is not yet implemented.
    #[error("Not implemented: {0}")]
    NotImplemented(String),
}

/// Result type alias for Zap operations.
pub type ZapResult<T> = Result<T, ZapError>;

/// Converts a `ZapError` into a serializable string for IPC.
impl From<ZapError> for String {
    fn from(err: ZapError) -> Self {
        err.to_string()
    }
}
