//! `SQLite` persistence layer with migration support.
//!
//! Provides database connection management, schema migrations,
//! and the repository pattern for data access.

pub mod database;
pub mod error;
pub mod migrations;
pub mod models;
pub mod repository;

pub use database::Database;
pub use error::StorageError;
pub use repository::Repository;
