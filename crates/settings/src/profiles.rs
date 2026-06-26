//! Profile management (placeholder for Sprint 0).

use crate::config::Config;

/// Loads the default profile configuration.
#[must_use]
pub fn default_profile_config() -> Config {
    Config::default()
}
