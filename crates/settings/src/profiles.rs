//! Profile management.
//!
//! Profiles store per-context configurations (gaming, streaming, work).
//! Each profile holds its own config, hotkey bindings, and collection references.
//! Profiles are persisted in the settings JSON file under a `profiles` key.

use std::collections::HashMap;

use serde::{Deserialize, Serialize};
use tracing::{debug, info};

use crate::config::Config;
use crate::error::{SettingsError, SettingsResult};
use crate::io::SettingsIo;

/// A named profile containing a snapshot of application configuration.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Profile {
    /// Display name.
    pub name: String,
    /// Configuration snapshot for this profile.
    pub config: Config,
}

/// Manages named profiles stored in the settings file.
pub struct ProfileManager<'a> {
    /// Reference to the settings I/O handler.
    io: &'a SettingsIo,
}

impl<'a> ProfileManager<'a> {
    /// Creates a new profile manager.
    #[must_use]
    pub fn new(io: &'a SettingsIo) -> Self {
        Self { io }
    }

    /// Loads all profiles from disk.
    #[allow(clippy::unnecessary_wraps)]
    fn load_profiles(&self) -> SettingsResult<HashMap<String, Profile>> {
        let profiles_json = std::fs::read_to_string(self.io.profiles_path())
            .unwrap_or_default();
        if profiles_json.is_empty() {
            return Ok(HashMap::new());
        }
        let profiles: HashMap<String, Profile> =
            serde_json::from_str(&profiles_json).unwrap_or_default();
        Ok(profiles)
    }

    /// Saves all profiles to disk.
    fn save_profiles(&self, profiles: &HashMap<String, Profile>) -> SettingsResult<()> {
        let json = serde_json::to_string_pretty(profiles)?;
        std::fs::write(self.io.profiles_path(), json)?;
        Ok(())
    }

    /// Lists all profile names.
    ///
    /// # Errors
    ///
    /// Returns `SettingsError` on I/O failure.
    pub fn list_profiles(&self) -> SettingsResult<Vec<String>> {
        let profiles = self.load_profiles()?;
        let mut names: Vec<String> = profiles.keys().cloned().collect();
        names.sort();
        Ok(names)
    }

    /// Creates a new profile with default config.
    ///
    /// # Errors
    ///
    /// Returns `SettingsError` if the profile name already exists.
    pub fn create_profile(&mut self, name: &str) -> SettingsResult<Profile> {
        let mut profiles = self.load_profiles()?;
        if profiles.contains_key(name) {
            return Err(SettingsError::Corrupted(format!(
                "Profile '{name}' already exists"
            )));
        }

        let profile = Profile {
            name: name.to_string(),
            config: Config::default(),
        };
        profiles.insert(name.to_string(), profile.clone());
        self.save_profiles(&profiles)?;
        info!("Created profile: {name}");
        Ok(profile)
    }

    /// Deletes a profile by name. Cannot delete the "default" profile.
    ///
    /// # Errors
    ///
    /// Returns `SettingsError` if the profile doesn't exist or is protected.
    pub fn delete_profile(&mut self, name: &str) -> SettingsResult<()> {
        if name == "default" {
            return Err(SettingsError::Corrupted(
                "Cannot delete the default profile".into(),
            ));
        }

        let mut profiles = self.load_profiles()?;
        profiles
            .remove(name)
            .ok_or_else(|| SettingsError::NotFound(format!("Profile '{name}' not found")))?;
        self.save_profiles(&profiles)?;
        debug!("Deleted profile: {name}");
        Ok(())
    }

    /// Loads a specific profile by name.
    ///
    /// # Errors
    ///
    /// Returns `SettingsError` if the profile doesn't exist.
    pub fn get_profile(&self, name: &str) -> SettingsResult<Profile> {
        let profiles = self.load_profiles()?;
        profiles
            .get(name)
            .cloned()
            .ok_or_else(|| SettingsError::NotFound(format!("Profile '{name}' not found")))
    }

    /// Saves config changes to a specific profile.
    ///
    /// # Errors
    ///
    /// Returns `SettingsError` if the profile doesn't exist.
    pub fn save_profile(&mut self, name: &str, config: &Config) -> SettingsResult<()> {
        let mut profiles = self.load_profiles()?;
        let profile = profiles
            .get_mut(name)
            .ok_or_else(|| SettingsError::NotFound(format!("Profile '{name}' not found")))?;
        profile.config = config.clone();
        self.save_profiles(&profiles)?;
        debug!("Saved profile: {name}");
        Ok(())
    }
}
