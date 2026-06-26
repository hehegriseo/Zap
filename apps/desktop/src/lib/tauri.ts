/**
 * Frontend IPC service layer.
 *
 * React components must NEVER invoke Tauri commands directly.
 * All IPC goes through this service layer, which provides:
 * - Type-safe wrappers around `invoke`
 * - Centralized error handling
 * - Easy mocking for tests
 */

import { invoke } from "@tauri-apps/api/core";

/** Pings the Rust backend and returns the response. */
export async function ping(): Promise<string> {
  return invoke<string>("ping");
}

/** Returns the application version from the Rust backend. */
export async function getAppVersion(): Promise<string> {
  return invoke<string>("get_app_version");
}
