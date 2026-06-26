//! Database models and row mapping types.

/// Represents a row from the `schema_migrations` table.
#[derive(Debug)]
pub struct MigrationRow {
    /// Migration version number.
    pub version: u32,
    /// When the migration was applied.
    pub applied_at: String,
}
