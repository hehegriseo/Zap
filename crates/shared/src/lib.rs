//! Shared types, events, commands, and error definitions for Zap.
//!
//! This crate provides the foundational types that are shared across
//! all workspace crates and the Tauri application layer.

pub mod commands;
pub mod errors;
pub mod events;
pub mod types;
pub mod utils;

#[cfg(test)]
mod tests {
    use super::types::{AudioFormat, SoundId};
    use super::utils::is_supported_audio_file;
    use std::path::Path;

    #[test]
    fn test_sound_id_creation() {
        let id1 = SoundId::new();
        let id2 = SoundId::new();
        assert_ne!(id1, id2);
    }

    #[test]
    fn test_sound_id_display() {
        let id = SoundId::new();
        let display = format!("{id}");
        assert!(!display.is_empty());
    }

    #[test]
    fn test_audio_format_display() {
        assert_eq!(format!("{}", AudioFormat::Mp3), "MP3");
        assert_eq!(format!("{}", AudioFormat::Flac), "FLAC");
    }

    #[test]
    fn test_supported_audio_files() {
        assert!(is_supported_audio_file(Path::new("test.mp3")));
        assert!(is_supported_audio_file(Path::new("test.wav")));
        assert!(is_supported_audio_file(Path::new("test.flac")));
        assert!(is_supported_audio_file(Path::new("test.ogg")));
        assert!(is_supported_audio_file(Path::new("test.opus")));
        assert!(is_supported_audio_file(Path::new("TEST.MP3")));
    }

    #[test]
    fn test_unsupported_audio_files() {
        assert!(!is_supported_audio_file(Path::new("image.png")));
        assert!(!is_supported_audio_file(Path::new("doc.pdf")));
        assert!(!is_supported_audio_file(Path::new("noext")));
    }
}
