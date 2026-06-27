//! Tauri commands for sound library management.
//!
//! Each command is a thin adapter that bridges IPC calls
//! to the storage repository. Commands should not contain
//! business logic — delegate to workspace crates instead.

use std::path::Path;

use serde::{Deserialize, Serialize};
use tauri::State;
use tracing::info;
use zap_shared::utils::is_supported_audio_file;
use zap_storage::Repository;

use crate::errors::CommandError;
use crate::state::AppState;

/// A sound entry returned to the frontend.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SoundData {
    pub id: String,
    pub name: String,
    pub path: String,
    pub collection_id: String,
    pub duration_ms: i64,
    pub format: String,
    pub sample_rate: i64,
    pub channels: i64,
    pub is_favorite: bool,
    pub volume: f64,
    pub tags: Vec<String>,
}

impl SoundData {
    fn from_row(row: &zap_storage::models::SoundRow) -> Self {
        let tags = if row.tags.is_empty() {
            Vec::new()
        } else {
            row.tags.split(',').map(str::to_string).collect()
        };
        Self {
            id: row.id.clone(),
            name: row.name.clone(),
            path: row.path.clone(),
            collection_id: row.collection_id.clone(),
            duration_ms: row.duration_ms,
            format: row.format.clone(),
            sample_rate: row.sample_rate,
            channels: row.channels,
            is_favorite: row.is_favorite,
            volume: row.volume,
            tags,
        }
    }
}

/// A collection entry returned to the frontend.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CollectionData {
    pub id: String,
    pub name: String,
    pub path: String,
}

/// A hotkey binding returned to the frontend.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HotkeyData {
    pub id: String,
    pub sound_id: String,
    pub key_binding: String,
}

/// Lists all collections.
#[tauri::command]
pub fn list_collections(state: State<'_, AppState>) -> Result<Vec<CollectionData>, CommandError> {
    let repo = Repository::new(&state.database);
    let rows = repo.list_collections()?;
    Ok(rows
        .into_iter()
        .map(|r| CollectionData {
            id: r.id,
            name: r.name,
            path: r.path,
        })
        .collect())
}

/// Imports a folder of audio files into the library.
///
/// Scans the directory for supported audio files and inserts them
/// into the database. Skips files that already exist (by path).
#[tauri::command]
pub fn import_folder(
    state: State<'_, AppState>,
    path: String,
) -> Result<ImportResult, CommandError> {
    let folder_path = Path::new(&path);
    if !folder_path.is_dir() {
        return Err(CommandError {
            message: format!("Not a directory: {path}"),
            code: Some("NOT_A_DIRECTORY".into()),
        });
    }

    let folder_name = folder_path
        .file_name()
        .map_or_else(|| path.clone(), |n| n.to_string_lossy().into_owned());

    let repo = Repository::new(&state.database);

    // Check if collection already exists for this path
    let collection = if let Some(c) = repo.get_collection_by_path(&path)? {
        c
    } else {
        let id = uuid::Uuid::new_v4().to_string();
        repo.insert_collection(&id, &folder_name, &path)?
    };

    let mut imported = 0u32;
    let mut skipped = 0u32;

    let entries = std::fs::read_dir(folder_path)?;
    for entry in entries.flatten() {
        let entry_path = entry.path();
        if !entry_path.is_file() {
            continue;
        }
        if !is_supported_audio_file(&entry_path) {
            continue;
        }

        let file_path_str = entry_path.to_string_lossy().to_string();

        // Skip if already imported
        if repo.get_sound_by_path(&file_path_str)?.is_some() {
            skipped += 1;
            continue;
        }

        let file_name = entry_path
            .file_stem()
            .map_or_else(|| "Unknown".into(), |n| n.to_string_lossy().into_owned());

        let format = entry_path
            .extension()
            .and_then(|e| e.to_str())
            .unwrap_or("mp3")
            .to_lowercase();

        let id = uuid::Uuid::new_v4().to_string();
        repo.insert_sound(
            &id,
            &file_name,
            &file_path_str,
            &collection.id,
            0, // duration unknown until decoded (Phase 2)
            &format,
            48000, // default, updated on decode
            2,     // default, updated on decode
        )?;
        imported += 1;
    }

    info!(
        "Imported {imported} sounds, skipped {skipped} duplicates from {path}"
    );

    Ok(ImportResult {
        collection_id: collection.id,
        imported,
        skipped,
    })
}

/// Result of a folder import operation.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ImportResult {
    pub collection_id: String,
    pub imported: u32,
    pub skipped: u32,
}

/// Lists all sounds across all collections.
#[tauri::command]
pub fn list_sounds(state: State<'_, AppState>) -> Result<Vec<SoundData>, CommandError> {
    let repo = Repository::new(&state.database);
    let rows = repo.list_all_sounds()?;
    Ok(rows.iter().map(SoundData::from_row).collect())
}

/// Renames a sound.
#[tauri::command]
pub fn rename_sound(
    state: State<'_, AppState>,
    id: String,
    name: String,
) -> Result<(), CommandError> {
    let repo = Repository::new(&state.database);
    repo.rename_sound(&id, &name)?;
    Ok(())
}

/// Toggles the favorite status of a sound. Returns the new value.
#[tauri::command]
pub fn toggle_favorite(state: State<'_, AppState>, id: String) -> Result<bool, CommandError> {
    let repo = Repository::new(&state.database);
    let new_val = repo.toggle_favorite(&id)?;
    Ok(new_val)
}

/// Sets the volume for a sound.
#[tauri::command]
pub fn set_sound_volume(
    state: State<'_, AppState>,
    id: String,
    volume: f64,
) -> Result<(), CommandError> {
    let repo = Repository::new(&state.database);
    repo.set_volume(&id, volume)?;
    Ok(())
}

/// Deletes a sound by ID.
#[tauri::command]
pub fn delete_sound(state: State<'_, AppState>, id: String) -> Result<(), CommandError> {
    let repo = Repository::new(&state.database);
    repo.delete_sound(&id)?;
    Ok(())
}

/// Assigns a hotkey to a sound. Removes any existing binding for that key.
#[tauri::command]
pub fn assign_hotkey(
    state: State<'_, AppState>,
    sound_id: String,
    key_binding: String,
) -> Result<(), CommandError> {
    let repo = Repository::new(&state.database);

    // Remove existing binding for this sound
    repo.delete_hotkey_binding(&sound_id)?;

    // Remove any other sound using this key
    let all_bindings = repo.list_hotkey_bindings()?;
    for binding in &all_bindings {
        if binding.key_binding == key_binding {
            repo.delete_hotkey_binding(&binding.sound_id)?;
        }
    }

    let id = uuid::Uuid::new_v4().to_string();
    repo.insert_hotkey_binding(&id, &sound_id, &key_binding)?;
    Ok(())
}

/// Removes the hotkey binding for a sound.
#[tauri::command]
pub fn remove_hotkey(state: State<'_, AppState>, sound_id: String) -> Result<(), CommandError> {
    let repo = Repository::new(&state.database);
    repo.delete_hotkey_binding(&sound_id)?;
    Ok(())
}

/// Lists all hotkey bindings.
#[tauri::command]
pub fn list_hotkeys(state: State<'_, AppState>) -> Result<Vec<HotkeyData>, CommandError> {
    let repo = Repository::new(&state.database);
    let rows = repo.list_hotkey_bindings()?;
    Ok(rows
        .into_iter()
        .map(|r| HotkeyData {
            id: r.id,
            sound_id: r.sound_id,
            key_binding: r.key_binding,
        })
        .collect())
}
