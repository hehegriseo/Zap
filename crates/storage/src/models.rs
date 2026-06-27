//! Database models and row mapping types.

/// A row from the `collections` table.
#[derive(Debug, Clone)]
pub struct CollectionRow {
    /// UUID as string.
    pub id: String,
    /// Display name.
    pub name: String,
    /// Filesystem path.
    pub path: String,
    /// Creation timestamp.
    pub created_at: String,
}

/// A row from the `sounds` table.
#[derive(Debug, Clone)]
pub struct SoundRow {
    /// UUID as string.
    pub id: String,
    /// Display name.
    pub name: String,
    /// Filesystem path.
    pub path: String,
    /// Parent collection UUID.
    pub collection_id: String,
    /// Duration in milliseconds.
    pub duration_ms: i64,
    /// Audio format string (e.g. "mp3", "wav").
    pub format: String,
    /// Sample rate in Hz.
    pub sample_rate: i64,
    /// Channel count.
    pub channels: i64,
    /// Whether the sound is a favorite.
    pub is_favorite: bool,
    /// Volume multiplier (0.0..1.0).
    pub volume: f64,
    /// Whether the audio has been normalized.
    pub normalized: bool,
    /// Comma-separated tags.
    pub tags: String,
    /// Creation timestamp.
    pub created_at: String,
}

/// A row from the `hotkey_bindings` table.
#[derive(Debug, Clone)]
pub struct HotkeyBindingRow {
    /// UUID as string.
    pub id: String,
    /// Sound UUID this binding triggers.
    pub sound_id: String,
    /// Key binding string (e.g. "F1", "Ctrl+Shift+1").
    pub key_binding: String,
    /// Creation timestamp.
    pub created_at: String,
}

/// A row from the `schema_migrations` table.
#[derive(Debug)]
pub struct MigrationRow {
    /// Migration version number.
    pub version: u32,
    /// When the migration was applied.
    pub applied_at: String,
}
