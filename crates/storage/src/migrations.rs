//! Database schema migrations.
//!
//! Each migration is a function that upgrades the schema from version N-1 to N.
//! Migrations run in order and are recorded in `schema_migrations`.

use std::sync::Arc;

use parking_lot::Mutex;
use rusqlite::Connection;
use tracing::info;

use crate::error::{StorageError, StorageResult};

/// Runs all pending database migrations.
///
/// # Errors
///
/// Returns `StorageError` if a migration fails.
pub fn run_migrations(connection: &Arc<Mutex<Connection>>) -> StorageResult<()> {
    info!("Running database migrations");

    let conn = connection.lock();
    conn.execute_batch(
        "CREATE TABLE IF NOT EXISTS schema_migrations (
            version INTEGER PRIMARY KEY,
            applied_at TEXT NOT NULL DEFAULT (datetime('now'))
        );",
    )?;

    let current_version: u32 = conn
        .query_row(
            "SELECT COALESCE(MAX(version), 0) FROM schema_migrations",
            [],
            |row| row.get(0),
        )
        .map_err(StorageError::Sqlite)?;

    info!("Current schema version: {current_version}");

    if current_version < 1 {
        migrate_v1(&conn)?;
    }

    info!("All migrations applied successfully");
    Ok(())
}

/// Schema v1: collections, sounds, and `hotkey_bindings` tables.
fn migrate_v1(conn: &Connection) -> StorageResult<()> {
    info!("Applying migration v1");

    conn.execute_batch(
        "
        CREATE TABLE collections (
            id          TEXT PRIMARY KEY,
            name        TEXT NOT NULL,
            path        TEXT NOT NULL UNIQUE,
            created_at  TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE sounds (
            id              TEXT PRIMARY KEY,
            name            TEXT NOT NULL,
            path            TEXT NOT NULL UNIQUE,
            collection_id   TEXT NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
            duration_ms     INTEGER NOT NULL DEFAULT 0,
            format          TEXT NOT NULL,
            sample_rate     INTEGER NOT NULL DEFAULT 48000,
            channels        INTEGER NOT NULL DEFAULT 2,
            is_favorite     INTEGER NOT NULL DEFAULT 0,
            volume          REAL NOT NULL DEFAULT 1.0,
            normalized      INTEGER NOT NULL DEFAULT 0,
            waveform_peaks  TEXT,
            tags            TEXT NOT NULL DEFAULT '',
            created_at      TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE INDEX idx_sounds_collection ON sounds(collection_id);
        CREATE INDEX idx_sounds_favorite ON sounds(is_favorite);

        CREATE TABLE hotkey_bindings (
            id          TEXT PRIMARY KEY,
            sound_id    TEXT NOT NULL REFERENCES sounds(id) ON DELETE CASCADE,
            key_binding TEXT NOT NULL,
            created_at  TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE UNIQUE INDEX idx_hotkey_sound ON hotkey_bindings(sound_id);
        CREATE UNIQUE INDEX idx_hotkey_key ON hotkey_bindings(key_binding);
        ",
    )?;

    conn.execute_batch("INSERT INTO schema_migrations (version) VALUES (1);")?;
    info!("Migration v1 applied");
    Ok(())
}
