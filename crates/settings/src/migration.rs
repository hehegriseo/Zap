//! Config version migration (placeholder for Sprint 0).

/// Migrates a config from one version to the next.
///
/// Currently a no-op since we only have version 1.
#[must_use]
pub fn migrate_config_version(_from: u32, _to: u32) -> bool {
    false
}
