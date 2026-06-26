//! Plugin system for extending Zap functionality.
//!
//! Supports dynamic loading, sandboxing, and an API surface
//! for audio effects, UI extensions, and integrations.

pub mod api;
pub mod error;
pub mod loader;
pub mod manager;
pub mod sandbox;

pub use error::PluginError;
