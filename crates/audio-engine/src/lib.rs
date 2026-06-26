//! Audio decoding, mixing, and playback engine.
//!
//! Decodes audio files with Symphonia, manages playback state,
//! handles multi-channel mixing, and LUFS normalization.
//! Independent of `PipeWire` and Tauri.

pub mod buffer;
pub mod decoder;
pub mod error;
pub mod mixer;
pub mod normalization;
pub mod player;

pub use error::AudioEngineError;
