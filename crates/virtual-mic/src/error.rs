//! Error types for the virtual microphone crate.

/// Errors that can occur during virtual mic operations.
#[derive(Debug, thiserror::Error)]
pub enum VirtualMicError {
    /// `PipeWire` provider failed.
    #[error("PipeWire error: {0}")]
    PipeWire(String),

    /// `PulseAudio` provider failed.
    #[error("PulseAudio error: {0}")]
    PulseAudio(String),

    /// No provider is available.
    #[error("No virtual mic provider available")]
    NoProvider,

    /// The virtual mic is already active.
    #[error("Virtual mic already active")]
    AlreadyActive,
}

/// Result type alias for virtual mic operations.
pub type VirtualMicResult<T> = Result<T, VirtualMicError>;
