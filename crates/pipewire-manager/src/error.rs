//! Error types for the `PipeWire` manager.

/// Errors that can occur during `PipeWire` operations.
#[derive(Debug, thiserror::Error)]
pub enum PipeWireError {
    /// Failed to connect to `PipeWire` daemon.
    #[error("Connection failed: {0}")]
    ConnectionFailed(String),

    /// Failed to create a virtual node.
    #[error("Node creation failed: {0}")]
    NodeCreationFailed(String),

    /// Failed to link ports.
    #[error("Link failed: {0}")]
    LinkFailed(String),

    /// `PipeWire` daemon is not running.
    #[error("PipeWire daemon not running")]
    DaemonNotRunning,
}

/// Result type alias for `PipeWire` operations.
pub type PipeWireResult<T> = Result<T, PipeWireError>;
