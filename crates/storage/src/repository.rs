//! Repository pattern for data access.
//!
//! All queries go through the repository. The repository holds a reference
//! to the database and provides typed methods for each operation.

use rusqlite::params;

use crate::database::Database;
use crate::error::{StorageError, StorageResult};
use crate::models::{CollectionRow, HotkeyBindingRow, SoundRow};

/// Provides typed data access operations.
pub struct Repository<'a> {
    /// Reference to the database connection.
    db: &'a Database,
}

impl<'a> Repository<'a> {
    /// Creates a new repository bound to the given database.
    #[must_use]
    pub fn new(db: &'a Database) -> Self {
        Self { db }
    }

    /// Returns a reference to the underlying database.
    #[must_use]
    pub fn database(&self) -> &Database {
        self.db
    }

    // ── Collections ────────────────────────────────────────────────

    /// Inserts a new collection. Returns the row on success.
    ///
    /// # Errors
    ///
    /// Returns `StorageError` on database failure.
    pub fn insert_collection(
        &self,
        id: &str,
        name: &str,
        path: &str,
    ) -> StorageResult<CollectionRow> {
        let conn = self.db.connection();
        let conn = conn.lock();
        conn.execute(
            "INSERT INTO collections (id, name, path) VALUES (?1, ?2, ?3)",
            params![id, name, path],
        )?;
        drop(conn);

        self.get_collection(id)?
            .ok_or_else(|| StorageError::Migration("Failed to retrieve inserted collection".into()))
    }

    /// Returns all collections, ordered by name.
    ///
    /// # Errors
    ///
    /// Returns `StorageError` on database failure.
    pub fn list_collections(&self) -> StorageResult<Vec<CollectionRow>> {
        let conn = self.db.connection();
        let conn = conn.lock();
        let mut stmt = conn.prepare(
            "SELECT id, name, path, created_at FROM collections ORDER BY name",
        )?;

        let rows = stmt
            .query_map([], |row| {
                Ok(CollectionRow {
                    id: row.get(0)?,
                    name: row.get(1)?,
                    path: row.get(2)?,
                    created_at: row.get(3)?,
                })
            })?
            .collect::<Result<Vec<_>, _>>()?;

        Ok(rows)
    }

    /// Returns a single collection by ID.
    ///
    /// # Errors
    ///
    /// Returns `StorageError` on database failure.
    pub fn get_collection(&self, id: &str) -> StorageResult<Option<CollectionRow>> {
        let conn = self.db.connection();
        let conn = conn.lock();
        let mut stmt = conn.prepare(
            "SELECT id, name, path, created_at FROM collections WHERE id = ?1",
        )?;

        let mut rows = stmt.query_map(params![id], |row| {
            Ok(CollectionRow {
                id: row.get(0)?,
                name: row.get(1)?,
                path: row.get(2)?,
                created_at: row.get(3)?,
            })
        })?;

        Ok(rows.next().transpose()?)
    }

    /// Returns a collection by its filesystem path.
    ///
    /// # Errors
    ///
    /// Returns `StorageError` on database failure.
    pub fn get_collection_by_path(&self, path: &str) -> StorageResult<Option<CollectionRow>> {
        let conn = self.db.connection();
        let conn = conn.lock();
        let mut stmt = conn.prepare(
            "SELECT id, name, path, created_at FROM collections WHERE path = ?1",
        )?;

        let mut rows = stmt.query_map(params![path], |row| {
            Ok(CollectionRow {
                id: row.get(0)?,
                name: row.get(1)?,
                path: row.get(2)?,
                created_at: row.get(3)?,
            })
        })?;

        Ok(rows.next().transpose()?)
    }

    /// Deletes a collection and all its sounds (via CASCADE).
    ///
    /// # Errors
    ///
    /// Returns `StorageError` on database failure.
    pub fn delete_collection(&self, id: &str) -> StorageResult<()> {
        let conn = self.db.connection();
        let conn = conn.lock();
        conn.execute("DELETE FROM collections WHERE id = ?1", params![id])?;
        Ok(())
    }

    // ── Sounds ─────────────────────────────────────────────────────

    /// Inserts a new sound.
    ///
    /// # Errors
    ///
    /// Returns `StorageError` on database failure.
    #[allow(clippy::too_many_arguments)]
    pub fn insert_sound(
        &self,
        id: &str,
        name: &str,
        path: &str,
        collection_id: &str,
        duration_ms: i64,
        format: &str,
        sample_rate: i64,
        channels: i64,
    ) -> StorageResult<()> {
        let conn = self.db.connection();
        let conn = conn.lock();
        conn.execute(
            "INSERT OR IGNORE INTO sounds
             (id, name, path, collection_id, duration_ms, format, sample_rate, channels)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
            params![id, name, path, collection_id, duration_ms, format, sample_rate, channels],
        )?;
        Ok(())
    }

    /// Returns all sounds for a given collection.
    ///
    /// # Errors
    ///
    /// Returns `StorageError` on database failure.
    pub fn list_sounds(&self, collection_id: &str) -> StorageResult<Vec<SoundRow>> {
        let conn = self.db.connection();
        let conn = conn.lock();
        let mut stmt = conn.prepare(
            "SELECT id, name, path, collection_id, duration_ms, format,
                    sample_rate, channels, is_favorite, volume, normalized,
                    tags, created_at
             FROM sounds
             WHERE collection_id = ?1
             ORDER BY name",
        )?;

        let rows = stmt
            .query_map(params![collection_id], |row| {
                Ok(SoundRow {
                    id: row.get(0)?,
                    name: row.get(1)?,
                    path: row.get(2)?,
                    collection_id: row.get(3)?,
                    duration_ms: row.get(4)?,
                    format: row.get(5)?,
                    sample_rate: row.get(6)?,
                    channels: row.get(7)?,
                    is_favorite: row.get::<_, i64>(8)? != 0,
                    volume: row.get(9)?,
                    normalized: row.get::<_, i64>(10)? != 0,
                    tags: row.get(11)?,
                    created_at: row.get(12)?,
                })
            })?
            .collect::<Result<Vec<_>, _>>()?;

        Ok(rows)
    }

    /// Returns all sounds across all collections.
    ///
    /// # Errors
    ///
    /// Returns `StorageError` on database failure.
    pub fn list_all_sounds(&self) -> StorageResult<Vec<SoundRow>> {
        let conn = self.db.connection();
        let conn = conn.lock();
        let mut stmt = conn.prepare(
            "SELECT id, name, path, collection_id, duration_ms, format,
                    sample_rate, channels, is_favorite, volume, normalized,
                    tags, created_at
             FROM sounds
             ORDER BY name",
        )?;

        let rows = stmt
            .query_map([], |row| {
                Ok(SoundRow {
                    id: row.get(0)?,
                    name: row.get(1)?,
                    path: row.get(2)?,
                    collection_id: row.get(3)?,
                    duration_ms: row.get(4)?,
                    format: row.get(5)?,
                    sample_rate: row.get(6)?,
                    channels: row.get(7)?,
                    is_favorite: row.get::<_, i64>(8)? != 0,
                    volume: row.get(9)?,
                    normalized: row.get::<_, i64>(10)? != 0,
                    tags: row.get(11)?,
                    created_at: row.get(12)?,
                })
            })?
            .collect::<Result<Vec<_>, _>>()?;

        Ok(rows)
    }

    /// Returns a single sound by ID.
    ///
    /// # Errors
    ///
    /// Returns `StorageError` on database failure.
    pub fn get_sound(&self, id: &str) -> StorageResult<Option<SoundRow>> {
        let conn = self.db.connection();
        let conn = conn.lock();
        let mut stmt = conn.prepare(
            "SELECT id, name, path, collection_id, duration_ms, format,
                    sample_rate, channels, is_favorite, volume, normalized,
                    tags, created_at
             FROM sounds WHERE id = ?1",
        )?;

        let mut rows = stmt.query_map(params![id], |row| {
            Ok(SoundRow {
                id: row.get(0)?,
                name: row.get(1)?,
                path: row.get(2)?,
                collection_id: row.get(3)?,
                duration_ms: row.get(4)?,
                format: row.get(5)?,
                sample_rate: row.get(6)?,
                channels: row.get(7)?,
                is_favorite: row.get::<_, i64>(8)? != 0,
                volume: row.get(9)?,
                normalized: row.get::<_, i64>(10)? != 0,
                tags: row.get(11)?,
                created_at: row.get(12)?,
            })
        })?;

        Ok(rows.next().transpose()?)
    }

    /// Renames a sound.
    ///
    /// # Errors
    ///
    /// Returns `StorageError` on database failure.
    pub fn rename_sound(&self, id: &str, new_name: &str) -> StorageResult<()> {
        let conn = self.db.connection();
        let conn = conn.lock();
        conn.execute(
            "UPDATE sounds SET name = ?1 WHERE id = ?2",
            params![new_name, id],
        )?;
        Ok(())
    }

    /// Toggles the favorite status of a sound. Returns the new value.
    ///
    /// # Errors
    ///
    /// Returns `StorageError` on database failure.
    pub fn toggle_favorite(&self, id: &str) -> StorageResult<bool> {
        let conn = self.db.connection();
        let conn = conn.lock();
        conn.execute(
            "UPDATE sounds SET is_favorite = NOT is_favorite WHERE id = ?1",
            params![id],
        )?;
        let new_val: bool = conn
            .query_row(
                "SELECT is_favorite FROM sounds WHERE id = ?1",
                params![id],
                |row| row.get::<_, i64>(0),
            )
            .map(|v| v != 0)?;
        Ok(new_val)
    }

    /// Sets the volume for a sound.
    ///
    /// # Errors
    ///
    /// Returns `StorageError` on database failure.
    pub fn set_volume(&self, id: &str, volume: f64) -> StorageResult<()> {
        let conn = self.db.connection();
        let conn = conn.lock();
        conn.execute(
            "UPDATE sounds SET volume = ?1 WHERE id = ?2",
            params![volume, id],
        )?;
        Ok(())
    }

    /// Deletes a sound by ID.
    ///
    /// # Errors
    ///
    /// Returns `StorageError` on database failure.
    pub fn delete_sound(&self, id: &str) -> StorageResult<()> {
        let conn = self.db.connection();
        let conn = conn.lock();
        conn.execute("DELETE FROM sounds WHERE id = ?1", params![id])?;
        Ok(())
    }

    /// Returns sounds that match a file path (for dedup on import).
    ///
    /// # Errors
    ///
    /// Returns `StorageError` on database failure.
    pub fn get_sound_by_path(&self, path: &str) -> StorageResult<Option<SoundRow>> {
        let conn = self.db.connection();
        let conn = conn.lock();
        let mut stmt = conn.prepare(
            "SELECT id, name, path, collection_id, duration_ms, format,
                    sample_rate, channels, is_favorite, volume, normalized,
                    tags, created_at
             FROM sounds WHERE path = ?1",
        )?;

        let mut rows = stmt.query_map(params![path], |row| {
            Ok(SoundRow {
                id: row.get(0)?,
                name: row.get(1)?,
                path: row.get(2)?,
                collection_id: row.get(3)?,
                duration_ms: row.get(4)?,
                format: row.get(5)?,
                sample_rate: row.get(6)?,
                channels: row.get(7)?,
                is_favorite: row.get::<_, i64>(8)? != 0,
                volume: row.get(9)?,
                normalized: row.get::<_, i64>(10)? != 0,
                tags: row.get(11)?,
                created_at: row.get(12)?,
            })
        })?;

        Ok(rows.next().transpose()?)
    }

    // ── Hotkey Bindings ────────────────────────────────────────────

    /// Inserts a hotkey binding.
    ///
    /// # Errors
    ///
    /// Returns `StorageError` on database failure.
    pub fn insert_hotkey_binding(
        &self,
        id: &str,
        sound_id: &str,
        key_binding: &str,
    ) -> StorageResult<()> {
        let conn = self.db.connection();
        let conn = conn.lock();
        conn.execute(
            "INSERT INTO hotkey_bindings (id, sound_id, key_binding) VALUES (?1, ?2, ?3)",
            params![id, sound_id, key_binding],
        )?;
        Ok(())
    }

    /// Returns all hotkey bindings.
    ///
    /// # Errors
    ///
    /// Returns `StorageError` on database failure.
    pub fn list_hotkey_bindings(&self) -> StorageResult<Vec<HotkeyBindingRow>> {
        let conn = self.db.connection();
        let conn = conn.lock();
        let mut stmt = conn.prepare(
            "SELECT id, sound_id, key_binding, created_at FROM hotkey_bindings ORDER BY created_at",
        )?;

        let rows = stmt
            .query_map([], |row| {
                Ok(HotkeyBindingRow {
                    id: row.get(0)?,
                    sound_id: row.get(1)?,
                    key_binding: row.get(2)?,
                    created_at: row.get(3)?,
                })
            })?
            .collect::<Result<Vec<_>, _>>()?;

        Ok(rows)
    }

    /// Returns the hotkey binding for a specific sound, if any.
    ///
    /// # Errors
    ///
    /// Returns `StorageError` on database failure.
    pub fn get_hotkey_for_sound(
        &self,
        sound_id: &str,
    ) -> StorageResult<Option<HotkeyBindingRow>> {
        let conn = self.db.connection();
        let conn = conn.lock();
        let mut stmt = conn.prepare(
            "SELECT id, sound_id, key_binding, created_at
             FROM hotkey_bindings WHERE sound_id = ?1",
        )?;

        let mut rows = stmt.query_map(params![sound_id], |row| {
            Ok(HotkeyBindingRow {
                id: row.get(0)?,
                sound_id: row.get(1)?,
                key_binding: row.get(2)?,
                created_at: row.get(3)?,
            })
        })?;

        Ok(rows.next().transpose()?)
    }

    /// Deletes the hotkey binding for a sound.
    ///
    /// # Errors
    ///
    /// Returns `StorageError` on database failure.
    pub fn delete_hotkey_binding(&self, sound_id: &str) -> StorageResult<()> {
        let conn = self.db.connection();
        let conn = conn.lock();
        conn.execute(
            "DELETE FROM hotkey_bindings WHERE sound_id = ?1",
            params![sound_id],
        )?;
        Ok(())
    }
}
