//! Error types for the storage crate.

/// Errors that can occur during storage operations.
#[derive(Debug, thiserror::Error)]
pub enum StorageError {
    /// `SQLite` error.
    #[error("SQLite error: {0}")]
    Sqlite(#[from] rusqlite::Error),

    /// I/O error.
    #[error("I/O error: {0}")]
    Io(#[from] std::io::Error),

    /// Database path is invalid.
    #[error("Invalid database path: {0}")]
    InvalidPath(String),

    /// Migration failed.
    #[error("Migration error: {0}")]
    Migration(String),
}

/// Result type alias for storage operations.
pub type StorageResult<T> = Result<T, StorageError>;
