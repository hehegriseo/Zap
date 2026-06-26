//! Configuration management with profiles and theme support.
//!
//! Handles loading, saving, and migrating application configuration.
//! Supports multiple profiles for different setups (gaming, streaming, work).

pub mod config;
pub mod error;
pub mod io;
pub mod migration;
pub mod profiles;
pub mod themes;

pub use config::{AudioConfig, Config, HotkeyConfig, StartupConfig, UiConfig, VirtualMicConfig};
pub use error::SettingsError;
pub use io::SettingsIo;
