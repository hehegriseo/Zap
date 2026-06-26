//! Configuration file I/O.

use std::path::{Path, PathBuf};

use tracing::{debug, info};

use crate::config::Config;
use crate::error::SettingsResult;

/// Handles reading and writing the configuration file.
pub struct SettingsIo {
    /// Path to the configuration file.
    path: PathBuf,
}

impl SettingsIo {
    /// Creates a new `SettingsIo` for the given config file path.
    #[must_use]
    pub fn new(path: &Path) -> Self {
        Self {
            path: path.to_path_buf(),
        }
    }

    /// Loads the configuration from disk, or returns defaults if missing.
    ///
    /// # Errors
    ///
    /// Returns `SettingsError` if the file exists but is malformed.
    pub fn load(&self) -> SettingsResult<Config> {
        if !self.path.exists() {
            debug!("No config file found, using defaults");
            return Ok(Config::default());
        }

        info!("Loading config from {}", self.path.display());
        let content = std::fs::read_to_string(&self.path)?;
        let config: Config = serde_json::from_str(&content)?;
        Ok(config)
    }

    /// Saves the configuration to disk.
    ///
    /// # Errors
    ///
    /// Returns `SettingsError` if the file cannot be written.
    pub fn save(&self, config: &Config) -> SettingsResult<()> {
        if let Some(parent) = self.path.parent() {
            std::fs::create_dir_all(parent)?;
        }

        info!("Saving config to {}", self.path.display());
        let content = serde_json::to_string_pretty(config)?;
        std::fs::write(&self.path, content)?;
        Ok(())
    }

    /// Returns the path to the configuration file.
    #[must_use]
    pub fn path(&self) -> &Path {
        &self.path
    }
}
