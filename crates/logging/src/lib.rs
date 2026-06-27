//! Structured logging with `tracing`.
//!
//! Provides subscriber setup, file logging with rotation,
//! and category-specific logging for audio, `PipeWire`, and hotkeys.

pub mod audio;
pub mod error;
pub mod file;
pub mod pipewire;
pub mod subscriber;

pub use error::LoggingError;
pub use subscriber::init_logging;
