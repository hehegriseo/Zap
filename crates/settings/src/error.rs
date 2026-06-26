//! Error types for the settings crate.

/// Errors that can occur during settings operations.
#[derive(Debug, thiserror::Error)]
pub enum SettingsError {
    /// I/O error reading or writing config.
    #[error("I/O error: {0}")]
    Io(#[from] std::io::Error),

    /// Config file is malformed.
    #[error("Config error: {0}")]
    Serialization(#[from] serde_json::Error),

    /// Config file not found.
    #[error("Config not found: {0}")]
    NotFound(String),

    /// Config is corrupted or has an incompatible version.
    #[error("Config corrupted: {0}")]
    Corrupted(String),

    /// Migration to a new config version failed.
    #[error("Migration failed: {0}")]
    MigrationFailed(String),
}

/// Result type alias for settings operations.
pub type SettingsResult<T> = Result<T, SettingsError>;
