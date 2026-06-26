//! Utility functions shared across the application.

use std::path::{Path, PathBuf};

/// Returns the application's configuration directory.
///
/// On Linux this is typically `~/.config/zap/`.
#[must_use]
pub fn config_dir() -> PathBuf {
    dirs::config_dir()
        .unwrap_or_else(|| PathBuf::from("."))
        .join("zap")
}

/// Returns the application's data directory.
///
/// On Linux this is typically `~/.local/share/zap/`.
#[must_use]
pub fn data_dir() -> PathBuf {
    dirs::data_dir()
        .unwrap_or_else(|| PathBuf::from("."))
        .join("zap")
}

/// Returns the application's log directory.
///
/// On Linux this is typically `~/.local/share/zap/logs/`.
#[must_use]
pub fn log_dir() -> PathBuf {
    data_dir().join("logs")
}

/// Returns the path to the application configuration file.
#[must_use]
pub fn config_file() -> PathBuf {
    config_dir().join("config.json")
}

/// Returns the path to the `SQLite` database file.
#[must_use]
pub fn database_file() -> PathBuf {
    data_dir().join("zap.db")
}

/// Checks whether a file extension corresponds to a supported audio format.
#[must_use]
pub fn is_supported_audio_file(path: &Path) -> bool {
    path.extension()
        .and_then(|ext| ext.to_str())
        .is_some_and(|ext| {
            matches!(
                ext.to_lowercase().as_str(),
                "mp3" | "wav" | "flac" | "ogg" | "opus" | "m4a" | "aac" | "aiff"
            )
        })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_is_supported_audio_file() {
        assert!(is_supported_audio_file(Path::new("sound.mp3")));
        assert!(is_supported_audio_file(Path::new("sound.FLAC")));
        assert!(is_supported_audio_file(Path::new("track.ogg")));
        assert!(!is_supported_audio_file(Path::new("image.png")));
        assert!(!is_supported_audio_file(Path::new("noext")));
    }
}
