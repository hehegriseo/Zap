//! Error types for the audio engine.

/// Errors that can occur during audio operations.
#[derive(Debug, thiserror::Error)]
pub enum AudioEngineError {
    /// Unsupported audio format.
    #[error("Unsupported format: {0}")]
    UnsupportedFormat(String),

    /// Decoding failed.
    #[error("Decode failed: {0}")]
    DecodeFailed(String),

    /// Playback failed.
    #[error("Playback failed: {0}")]
    PlaybackFailed(String),

    /// Requested device was not found.
    #[error("Device not found: {0}")]
    DeviceNotFound(String),

    /// I/O error.
    #[error("I/O error: {0}")]
    Io(#[from] std::io::Error),
}

/// Result type alias for audio engine operations.
pub type AudioEngineResult<T> = Result<T, AudioEngineError>;
