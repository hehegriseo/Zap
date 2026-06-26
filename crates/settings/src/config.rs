//! Application configuration model.

use serde::{Deserialize, Serialize};

/// Root application configuration.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Config {
    /// Config schema version.
    pub version: u32,
    /// Active profile name.
    pub active_profile: String,
    /// Audio subsystem settings.
    pub audio: AudioConfig,
    /// Hotkey subsystem settings.
    pub hotkeys: HotkeyConfig,
    /// UI settings.
    pub ui: UiConfig,
    /// Virtual microphone settings.
    pub virtual_mic: VirtualMicConfig,
    /// Startup behavior settings.
    pub startup: StartupConfig,
}

impl Default for Config {
    fn default() -> Self {
        Self {
            version: 1,
            active_profile: "default".to_string(),
            audio: AudioConfig::default(),
            hotkeys: HotkeyConfig::default(),
            ui: UiConfig::default(),
            virtual_mic: VirtualMicConfig::default(),
            startup: StartupConfig::default(),
        }
    }
}

/// Audio subsystem configuration.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AudioConfig {
    /// Default output device name.
    pub default_output_device: Option<String>,
    /// Master volume (0.0..1.0).
    pub master_volume: f32,
    /// Whether LUFS normalization is enabled.
    pub normalize_enabled: bool,
    /// Target loudness in LUFS.
    pub target_lufs: f32,
    /// Sample rate in Hz.
    pub sample_rate: u32,
    /// Buffer size in frames.
    pub buffer_size: u32,
}

impl Default for AudioConfig {
    fn default() -> Self {
        Self {
            default_output_device: None,
            master_volume: 0.8,
            normalize_enabled: true,
            target_lufs: -14.0,
            sample_rate: 48000,
            buffer_size: 256,
        }
    }
}

/// Hotkey subsystem configuration.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HotkeyConfig {
    /// Whether hotkeys are enabled.
    pub enabled: bool,
    /// Backend selection: "auto", "xdg", "x11", or "evdev".
    pub backend: String,
}

impl Default for HotkeyConfig {
    fn default() -> Self {
        Self {
            enabled: true,
            backend: "auto".to_string(),
        }
    }
}

/// UI configuration.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UiConfig {
    /// Theme: "dark", "light", or "system".
    pub theme: String,
    /// Language code.
    pub language: String,
    /// Whether the sidebar is collapsed.
    pub sidebar_collapsed: bool,
}

impl Default for UiConfig {
    fn default() -> Self {
        Self {
            theme: "dark".to_string(),
            language: "en".to_string(),
            sidebar_collapsed: false,
        }
    }
}

/// Virtual microphone configuration.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VirtualMicConfig {
    /// Whether virtual microphone is enabled.
    pub enabled: bool,
    /// Display name of the virtual microphone.
    pub name: String,
    /// Whether to clean up virtual devices on exit.
    pub cleanup_on_exit: bool,
    /// Whether to auto-create virtual devices on startup.
    pub auto_create: bool,
}

impl Default for VirtualMicConfig {
    fn default() -> Self {
        Self {
            enabled: true,
            name: "Zap Virtual Microphone".to_string(),
            cleanup_on_exit: false,
            auto_create: true,
        }
    }
}

/// Startup behavior configuration.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[allow(clippy::struct_excessive_bools)]
pub struct StartupConfig {
    /// Whether to launch on system boot.
    pub launch_on_boot: bool,
    /// Whether to minimize to system tray.
    pub minimize_to_tray: bool,
    /// Whether to start the virtual mic on launch.
    pub start_virtual_mic: bool,
    /// Whether to restore the last active profile.
    pub restore_last_profile: bool,
}

impl Default for StartupConfig {
    fn default() -> Self {
        Self {
            launch_on_boot: false,
            minimize_to_tray: true,
            start_virtual_mic: true,
            restore_last_profile: true,
        }
    }
}
