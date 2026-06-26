//! Events that cross crate boundaries.

use serde::{Deserialize, Serialize};

use crate::types::{CollectionId, SoundId};

/// All events that can be emitted across the Zap system.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", content = "data")]
pub enum Event {
    /// A sound has started playing.
    SoundStarted {
        /// The sound that started.
        sound_id: SoundId,
    },
    /// A sound has finished playing.
    SoundStopped {
        /// The sound that stopped.
        sound_id: SoundId,
    },
    /// All sounds have been stopped.
    AllSoundsStopped,
    /// A new collection was added.
    CollectionAdded {
        /// The collection that was added.
        collection_id: CollectionId,
    },
    /// A collection was removed.
    CollectionRemoved {
        /// The collection that was removed.
        collection_id: CollectionId,
    },
    /// A library scan completed.
    LibraryScanComplete {
        /// Number of sounds found.
        count: usize,
    },
    /// An audio device was connected.
    DeviceConnected {
        /// Device identifier.
        device_id: String,
    },
    /// An audio device was disconnected.
    DeviceDisconnected {
        /// Device identifier.
        device_id: String,
    },
    /// Application configuration changed.
    ConfigChanged,
}
