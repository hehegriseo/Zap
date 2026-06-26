//! Error types for the sound library.

/// Errors that can occur during library operations.
#[derive(Debug, thiserror::Error)]
pub enum SoundLibraryError {
    /// Sound file not found.
    #[error("File not found: {0}")]
    FileNotFound(String),

    /// Library scan failed.
    #[error("Scan failed: {0}")]
    ScanFailed(String),

    /// Metadata extraction failed.
    #[error("Metadata extraction failed: {0}")]
    MetadataExtractionFailed(String),
}

/// Result type alias for library operations.
pub type SoundLibraryResult<T> = Result<T, SoundLibraryError>;
