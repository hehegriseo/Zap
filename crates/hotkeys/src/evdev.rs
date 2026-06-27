//! evdev backend for global hotkey capture.
//!
//! Uses the Linux evdev interface for direct input device access.
//! This backend works without X11 or Wayland but requires
//! appropriate permissions to read input devices.
