//! Repository pattern for data access.

use crate::database::Database;

/// Generic repository providing data access operations.
///
/// Wraps a `Database` reference for query execution.
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
}
