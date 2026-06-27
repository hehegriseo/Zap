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
import type {
  SoundData,
  CollectionData,
  HotkeyData,
  ImportResult,
} from "./types";

/** Pings the Rust backend and returns the response. */
export async function ping(): Promise<string> {
  return invoke<string>("ping");
}

/** Returns the application version from the Rust backend. */
export async function getAppVersion(): Promise<string> {
  return invoke<string>("get_app_version");
}

/** Represents an available audio output application/sink. */
export interface OutputApp {
  id: string;
  name: string;
  description: string;
  is_default: boolean;
}

/** Lists available audio output applications from the system. */
export async function listOutputApps(): Promise<OutputApp[]> {
  return invoke<OutputApp[]>("list_output_apps");
}

// --- Library commands ---

/** Lists all sound collections from the database. */
export async function listCollections(): Promise<CollectionData[]> {
  return invoke<CollectionData[]>("list_collections");
}

/** Imports a folder of audio files into the library. */
export async function importFolder(path: string): Promise<ImportResult> {
  return invoke<ImportResult>("import_folder", { path });
}

/** Lists all sounds across all collections. */
export async function listSounds(): Promise<SoundData[]> {
  return invoke<SoundData[]>("list_sounds");
}

/** Renames a sound. */
export async function renameSound(id: string, name: string): Promise<void> {
  return invoke<void>("rename_sound", { id, name });
}

/** Toggles favorite status. Returns the new value. */
export async function toggleFavorite(id: string): Promise<boolean> {
  return invoke<boolean>("toggle_favorite", { id });
}

/** Sets the volume for a sound. */
export async function setSoundVolume(
  id: string,
  volume: number,
): Promise<void> {
  return invoke<void>("set_sound_volume", { id, volume });
}

/** Deletes a sound by ID. */
export async function deleteSound(id: string): Promise<void> {
  return invoke<void>("delete_sound", { id });
}

/** Assigns a hotkey to a sound. */
export async function assignHotkey(
  soundId: string,
  keyBinding: string,
): Promise<void> {
  return invoke<void>("assign_hotkey", { soundId, keyBinding });
}

/** Removes the hotkey binding for a sound. */
export async function removeHotkey(soundId: string): Promise<void> {
  return invoke<void>("remove_hotkey", { soundId });
}

/** Lists all hotkey bindings. */
export async function listHotkeys(): Promise<HotkeyData[]> {
  return invoke<HotkeyData[]>("list_hotkeys");
}

// --- Settings commands ---

export interface ZapConfig {
  audio: {
    output_device: string | null;
    sample_rate: number;
    buffer_size: number;
  };
  hotkeys: {
    enabled: boolean;
    pass_through: boolean;
  };
  ui: {
    theme: string;
    window_width: number;
    window_height: number;
    always_on_top: boolean;
    grid_columns: number;
  };
  virtual_mic: {
    enabled: boolean;
    device_name: string;
  };
  startup: {
    launch_minimized: boolean;
    check_for_updates: boolean;
  };
}

/** Gets the current application settings. */
export async function getSettings(): Promise<ZapConfig> {
  return invoke<ZapConfig>("get_settings");
}

/** Saves the application settings. */
export async function saveSettings(config: ZapConfig): Promise<void> {
  return invoke<void>("save_settings", { config });
}
