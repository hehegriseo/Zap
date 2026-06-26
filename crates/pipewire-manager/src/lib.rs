//! `PipeWire` lifecycle management.
//!
//! Manages `PipeWire` connections, creates virtual devices,
//! and monitors the audio graph. Wraps `pipewire-rs` with a safe API.

pub mod context;
pub mod devices;
pub mod error;
pub mod links;
pub mod monitor;
pub mod nodes;
pub mod stream;

pub use error::PipeWireError;
