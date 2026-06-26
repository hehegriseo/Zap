//! Virtual microphone abstraction.
//!
//! Supports `PipeWire` native and `PulseAudio` fallback for virtual mic creation.
//! Handles mixing soundboard audio with real microphone input.

pub mod error;
pub mod mixer;
pub mod pipewire;
pub mod provider;
pub mod pulseaudio;

pub use error::VirtualMicError;
