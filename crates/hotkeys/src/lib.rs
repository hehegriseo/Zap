//! Global hotkey system.
//!
//! Multiple backends (XDG portal, X11, evdev) with conflict detection
//! and key binding persistence.

pub mod backend;
pub mod bindings;
pub mod conflict;
pub mod error;
pub mod evdev;
pub mod manager;
pub mod x11;
pub mod xdg_portal;

pub use error::HotkeyError;
