export interface Sound {
  id: string;
  name: string;
  file: string;
  duration: string;
  hotkey: string | null;
  favorite: boolean;
  color: string;
  category: string;
  tags: string[];
  volume: number;
}

export interface SoundData {
  id: string;
  name: string;
  path: string;
  collection_id: string;
  duration_ms: number;
  format: string;
  sample_rate: number;
  channels: number;
  is_favorite: boolean;
  volume: number;
  tags: string[];
}

export interface CollectionData {
  id: string;
  name: string;
  path: string;
}

export interface HotkeyData {
  id: string;
  sound_id: string;
  key_binding: string;
}

export interface ImportResult {
  collection_id: string;
  imported: number;
  skipped: number;
}

export type ViewMode = "grid" | "list";
export type SortBy = "name" | "duration" | "hotkey" | "category";
export type SortOrder = "asc" | "desc";
export type FilterView = "all" | "voice" | "music" | "favorites";
