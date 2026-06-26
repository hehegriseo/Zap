//! Zap Desktop Application - Tauri entry point.

#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    zap_desktop_lib::run();
}
