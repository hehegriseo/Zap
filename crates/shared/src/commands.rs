//! Command definitions for cross-boundary communication.

use crate::types::{CollectionId, SoundId};

/// All commands that can be sent across the Zap system.
#[derive(Debug, Clone)]
pub enum Command {
    /// Play a sound with optional parameters.
    PlaySound {
        /// The sound to play.
        sound_id: SoundId,
    },
    /// Stop a specific playing sound.
    StopSound {
        /// The sound to stop.
        sound_id: SoundId,
    },
    /// Stop all currently playing sounds.
    StopAll,
    /// Scan a collection folder for audio files.
    ScanCollection {
        /// The collection to scan.
        collection_id: CollectionId,
    },
    /// Ping command for health checks / IPC verification.
    Ping,
}
