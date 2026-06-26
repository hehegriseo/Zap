//! Error types for the logging crate.

/// Errors that can occur during logging initialization.
#[derive(Debug, thiserror::Error)]
pub enum LoggingError {
    /// Failed to create log directory.
    #[error("Failed to create log directory: {0}")]
    DirectoryCreation(#[from] std::io::Error),

    /// Log directory path is invalid.
    #[error("Invalid log path: {0}")]
    InvalidPath(String),
}

/// Result type alias for logging operations.
pub type LoggingResult<T> = Result<T, LoggingError>;
