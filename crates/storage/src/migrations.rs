//! Database schema migrations.

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

    // Future migrations go here:
    // if current_version < 1 { migrate_v1(&conn)?; }

    info!("All migrations applied successfully");
    Ok(())
}
