//! `SQLite` database connection management.

use std::path::Path;
use std::sync::Arc;

use parking_lot::Mutex;
use rusqlite::Connection;
use tracing::info;

use crate::error::{StorageError, StorageResult};
use crate::migrations;

/// Manages the `SQLite` database connection and lifecycle.
///
/// Uses a `Mutex` internally so the `Database` is `Send + Sync`,
/// allowing it to be shared across Tauri's managed state.
pub struct Database {
    /// The underlying `SQLite` connection, wrapped for thread safety.
    connection: Arc<Mutex<Connection>>,
}

impl Database {
    /// Opens (or creates) a database at the given path and runs migrations.
    ///
    /// # Errors
    ///
    /// Returns `StorageError` if the database cannot be opened or migrated.
    pub fn open(path: &Path) -> StorageResult<Self> {
        info!("Opening database at {}", path.display());

        // Ensure parent directory exists
        if let Some(parent) = path.parent() {
            std::fs::create_dir_all(parent)?;
        }

        let connection = Connection::open(path)?;

        // Enable WAL mode for better concurrent performance
        connection.execute_batch("PRAGMA journal_mode=WAL;")?;
        connection.execute_batch("PRAGMA foreign_keys=ON;")?;

        let connection = Arc::new(Mutex::new(connection));
        migrations::run_migrations(&connection)?;

        info!("Database initialized successfully");
        Ok(Self { connection })
    }

    /// Returns a clone of the shared connection handle.
    #[must_use]
    pub fn connection(&self) -> Arc<Mutex<Connection>> {
        Arc::clone(&self.connection)
    }

    /// Closes the database connection.
    ///
    /// # Errors
    ///
    /// Returns `StorageError` if the connection cannot be closed.
    pub fn close(self) -> StorageResult<()> {
        let conn = Arc::try_unwrap(self.connection)
            .map_err(|_| {
                StorageError::Migration("Could not unwrap database connection".to_string())
            })?
            .into_inner();
        conn.close().map_err(|e| StorageError::Sqlite(e.1))?;
        info!("Database closed");
        Ok(())
    }
}
