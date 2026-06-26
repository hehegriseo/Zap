//! Newtype identifiers and common value types used across Zap.

use std::fmt;
use std::path::PathBuf;
use std::time::Duration;

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

/// Unique identifier for a sound entry.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct SoundId(pub uuid::Uuid);

impl SoundId {
    /// Creates a new random `SoundId`.
    #[must_use]
    pub fn new() -> Self {
        Self(uuid::Uuid::new_v4())
    }
}

impl Default for SoundId {
    fn default() -> Self {
        Self::new()
    }
}

impl fmt::Display for SoundId {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.0)
    }
}

/// Unique identifier for a sound collection (folder/group).
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct CollectionId(pub uuid::Uuid);

impl CollectionId {
    /// Creates a new random `CollectionId`.
    #[must_use]
    pub fn new() -> Self {
        Self(uuid::Uuid::new_v4())
    }
}

impl Default for CollectionId {
    fn default() -> Self {
        Self::new()
    }
}

impl fmt::Display for CollectionId {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.0)
    }
}

/// Unique identifier for a hotkey binding.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct HotkeyId(pub uuid::Uuid);

impl HotkeyId {
    /// Creates a new random `HotkeyId`.
    #[must_use]
    pub fn new() -> Self {
        Self(uuid::Uuid::new_v4())
    }
}

impl Default for HotkeyId {
    fn default() -> Self {
        Self::new()
    }
}

impl fmt::Display for HotkeyId {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.0)
    }
}

/// Unique identifier for a tag.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct TagId(pub uuid::Uuid);

impl TagId {
    /// Creates a new random `TagId`.
    #[must_use]
    pub fn new() -> Self {
        Self(uuid::Uuid::new_v4())
    }
}

impl Default for TagId {
    fn default() -> Self {
        Self::new()
    }
}

/// Supported audio file formats.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum AudioFormat {
    /// MPEG Audio Layer III
    Mp3,
    /// Waveform Audio File Format
    Wav,
    /// Free Lossless Audio Codec
    Flac,
    /// Ogg Vorbis
    Ogg,
    /// Opus audio codec
    Opus,
    /// MPEG-4 Audio (AAC)
    Aac,
    /// Audio Interchange File Format
    Aiff,
}

impl fmt::Display for AudioFormat {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let label = match self {
            Self::Mp3 => "MP3",
            Self::Wav => "WAV",
            Self::Flac => "FLAC",
            Self::Ogg => "OGG",
            Self::Opus => "OPUS",
            Self::Aac => "AAC",
            Self::Aiff => "AIFF",
        };
        write!(f, "{label}")
    }
}

/// Represents decoded audio data stored in memory.
#[derive(Debug, Clone)]
pub struct DecodedAudio {
    /// Interleaved PCM samples (f32, range -1.0..1.0).
    pub samples: Vec<f32>,
    /// Sample rate in Hz.
    pub sample_rate: u32,
    /// Number of audio channels.
    pub channels: u16,
    /// Total duration of the audio.
    pub duration: Duration,
    /// Original audio format.
    pub format: AudioFormat,
}

/// Metadata extracted from an audio file.
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct AudioMetadata {
    /// Title tag.
    pub title: Option<String>,
    /// Artist tag.
    pub artist: Option<String>,
    /// Album tag.
    pub album: Option<String>,
    /// Genre tag.
    pub genre: Option<String>,
    /// Year tag.
    pub year: Option<u32>,
}

/// Represents an audio device detected on the system.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AudioDevice {
    /// Device identifier.
    pub id: String,
    /// Human-readable name.
    pub name: String,
    /// Device description.
    pub description: String,
    /// Number of channels.
    pub channels: u16,
    /// Supported sample rates.
    pub sample_rates: Vec<u32>,
    /// Whether this is an input (microphone) or output (speaker) device.
    pub is_input: bool,
}

/// A sound entry representing a single sound in the library.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SoundEntry {
    /// Unique identifier.
    pub id: SoundId,
    /// Display name.
    pub name: String,
    /// File path on disk.
    pub path: PathBuf,
    /// Collection this sound belongs to.
    pub collection_id: CollectionId,
    /// Audio duration.
    pub duration: Duration,
    /// Audio format.
    pub format: AudioFormat,
    /// Sample rate.
    pub sample_rate: u32,
    /// Channel count.
    pub channels: u16,
    /// Tags associated with this sound.
    pub tags: Vec<String>,
    /// Whether this sound is a user favorite.
    pub is_favorite: bool,
    /// Per-sound volume multiplier (0.0..1.0).
    pub volume: f32,
    /// Whether the audio has been LUFS-normalized.
    pub normalized: bool,
    /// Pre-computed waveform peaks for visualization.
    pub waveform_peaks: Option<Vec<f32>>,
    /// When this entry was created.
    pub created_at: DateTime<Utc>,
}

/// Options controlling how a sound is played.
#[derive(Debug, Clone, Default)]
pub struct PlayOptions {
    /// Volume override (0.0..1.0). `None` uses the sound's default.
    pub volume: Option<f32>,
    /// Duration of fade-in at playback start.
    pub fade_in: Option<Duration>,
    /// Duration of fade-out before playback stops.
    pub fade_out: Option<Duration>,
    /// Whether to loop the sound.
    pub loop_playback: bool,
    /// Output device name override.
    pub output_device: Option<String>,
}
