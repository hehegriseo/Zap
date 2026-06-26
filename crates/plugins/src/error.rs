//! Error types for the plugin crate.

/// Errors that can occur during plugin operations.
#[derive(Debug, thiserror::Error)]
pub enum PluginError {
    /// Plugin failed to load.
    #[error("Load failed: {0}")]
    LoadFailed(String),

    /// Required symbol not found in plugin.
    #[error("Symbol not found: {0}")]
    SymbolNotFound(String),

    /// Plugin execution failed.
    #[error("Execution failed: {0}")]
    ExecutionFailed(String),
}

/// Result type alias for plugin operations.
pub type PluginResult<T> = Result<T, PluginError>;
