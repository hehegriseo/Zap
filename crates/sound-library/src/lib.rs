//! Sound library management.
//!
//! Handles sound collections, metadata extraction, search,
//! tags, favorites, and waveform generation.

pub mod collection;
pub mod error;
pub mod favorites;
pub mod library;
pub mod metadata;
pub mod search;
pub mod tags;
pub mod waveform;

pub use error::SoundLibraryError;
