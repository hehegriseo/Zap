import { create } from "zustand";
import type { Sound, SoundData, CollectionData, ImportResult } from "@/lib/types";
import * as tauri from "@/lib/tauri";

const padColors = [
  "bg-[#e05a33]", "bg-[#c44dba]", "bg-[#4a8fe7]", "bg-[#2ea043]",
  "bg-[#d9822b]", "bg-[#6e56cf]", "bg-[#e5484d]", "bg-[#00a6fb]",
  "bg-[#f5a623]", "bg-[#8b5cf6]", "bg-[#06b6d4]", "bg-[#d946ef]",
  "bg-[#ef4444]", "bg-[#10b981]", "bg-[#3b82f6]", "bg-[#f97316]",
  "bg-[#84cc16]", "bg-[#ec4899]", "bg-[#a855f7]", "bg-[#14b8a6]",
];

function formatDuration(ms: number): string {
  if (ms <= 0) return "--:--";
  const totalSeconds = Math.floor(ms / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function assignColor(index: number): string {
  return padColors[index % padColors.length] ?? "bg-[#e05a33]";
}

/** Maps a backend SoundData to the frontend Sound type. */
function fromSoundData(data: SoundData, index: number): Sound {
  return {
    id: data.id,
    name: data.name,
    file: data.path,
    duration: formatDuration(data.duration_ms),
    hotkey: null,
    favorite: data.is_favorite,
    color: assignColor(index),
    category: data.format === "voice" ? "voice" : "music",
    tags: data.tags,
    volume: Math.round(data.volume * 100),
  };
}

interface LibraryState {
  sounds: Sound[];
  audioRefs: Map<string, HTMLAudioElement>;
  collections: CollectionData[];
  loaded: boolean;
  loadSounds: () => Promise<void>;
  importFolder: (path: string) => Promise<ImportResult>;
  setSounds: (updater: Sound[] | ((prev: Sound[]) => Sound[])) => void;
  addSound: (file: File) => string;
  addSounds: (files: FileList) => void;
  removeSound: (id: string) => void;
  removeSounds: (ids: string[]) => void;
  updateSound: (id: string, updates: Partial<Sound>) => void;
  toggleFavorite: (id: string) => Promise<void>;
  renameSound: (id: string, name: string) => Promise<void>;
  assignHotkey: (id: string, hotkey: string) => Promise<void>;
  removeHotkey: (id: string) => Promise<void>;
  duplicateSound: (id: string) => string | null;
  getAudio: (id: string) => HTMLAudioElement | undefined;
  loadDurations: () => void;
}

export const useLibraryStore = create<LibraryState>((set, get) => ({
  sounds: [],
  audioRefs: new Map(),
  collections: [],
  loaded: false,

  loadSounds: async () => {
    try {
      const [soundDataList, hotkeys, collections] = await Promise.all([
        tauri.listSounds(),
        tauri.listHotkeys(),
        tauri.listCollections(),
      ]);

      const hotkeyMap = new Map<string, string>();
      for (const hk of hotkeys) {
        hotkeyMap.set(hk.sound_id, hk.key_binding);
      }

      const sounds = soundDataList.map((data, i) => {
        const sound = fromSoundData(data, i);
        sound.hotkey = hotkeyMap.get(data.id) ?? null;
        return sound;
      });

      set({ sounds, collections, loaded: true });
    } catch (err) {
      console.error("Failed to load sounds from backend:", err);
      set({ loaded: true });
    }
  },

  importFolder: async (path: string) => {
    const result = await tauri.importFolder(path);
    await get().loadSounds();
    return result;
  },

  setSounds: (updater) =>
    set((state) => ({
      sounds: typeof updater === "function" ? updater(state.sounds) : updater,
    })),

  addSound: (file: File) => {
    const state = get();
    const id = crypto.randomUUID();
    const objectUrl = URL.createObjectURL(file);
    const audio = new Audio(objectUrl);
    const newAudioRefs = new Map(state.audioRefs);
    newAudioRefs.set(id, audio);

    const sound: Sound = {
      id,
      name: file.name.replace(/\.[^/.]+$/, "").replace(/_/g, " ").trim(),
      file: objectUrl,
      duration: "--:--",
      hotkey: null,
      favorite: false,
      color: assignColor(state.sounds.length),
      category: file.name.includes("voice") ? "voice" : "music",
      tags: [],
      volume: 80,
    };

    audio.addEventListener("loadedmetadata", () => {
      set((prev) => ({
        sounds: prev.sounds.map((s) =>
          s.id === id
            ? { ...s, duration: formatDuration(audio.duration * 1000) }
            : s,
        ),
      }));
    });

    set({
      sounds: [...state.sounds, sound],
      audioRefs: newAudioRefs,
    });
    return id;
  },

  addSounds: (files: FileList) => {
    const state = get();
    const newSounds: Sound[] = [];
    const newAudioRefs = new Map(state.audioRefs);

    Array.from(files).forEach((file) => {
      const id = crypto.randomUUID();
      const objectUrl = URL.createObjectURL(file);
      const audio = new Audio(objectUrl);
      newAudioRefs.set(id, audio);

      const sound: Sound = {
        id,
        name: file.name.replace(/\.[^/.]+$/, "").replace(/_/g, " ").trim(),
        file: objectUrl,
        duration: "--:--",
        hotkey: null,
        favorite: false,
        color: assignColor(state.sounds.length + newSounds.length),
        category: file.name.includes("voice") ? "voice" : "music",
        tags: [],
        volume: 80,
      };

      audio.addEventListener("loadedmetadata", () => {
        set((prev) => ({
          sounds: prev.sounds.map((s) =>
            s.id === id
              ? { ...s, duration: formatDuration(audio.duration * 1000) }
              : s,
          ),
        }));
      });

      newSounds.push(sound);
    });

    set((prev) => ({
      sounds: [...prev.sounds, ...newSounds],
      audioRefs: newAudioRefs,
    }));
  },

  removeSound: (id: string) => {
    const state = get();
    const audio = state.audioRefs.get(id);
    if (audio) {
      audio.pause();
      audio.src = "";
    }
    const newAudioRefs = new Map(state.audioRefs);
    newAudioRefs.delete(id);
    set({ sounds: state.sounds.filter((s) => s.id !== id), audioRefs: newAudioRefs });
    tauri.deleteSound(id).catch((err) =>
      console.error("Failed to delete sound from backend:", err),
    );
  },

  removeSounds: (ids: string[]) => {
    const state = get();
    const newAudioRefs = new Map(state.audioRefs);
    const idSet = new Set(ids);
    ids.forEach((id) => {
      const audio = newAudioRefs.get(id);
      if (audio) {
        audio.pause();
        audio.src = "";
      }
      newAudioRefs.delete(id);
      tauri.deleteSound(id).catch((err) =>
        console.error("Failed to delete sound from backend:", err),
      );
    });
    set({ sounds: state.sounds.filter((s) => !idSet.has(s.id)), audioRefs: newAudioRefs });
  },

  updateSound: (id, updates) =>
    set((state) => ({
      sounds: state.sounds.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    })),

  toggleFavorite: async (id: string) => {
    const newFav = await tauri.toggleFavorite(id);
    set((state) => ({
      sounds: state.sounds.map((s) =>
        s.id === id ? { ...s, favorite: newFav } : s,
      ),
    }));
  },

  renameSound: async (id: string, name: string) => {
    if (!name.trim()) return;
    await tauri.renameSound(id, name.trim());
    set((state) => ({
      sounds: state.sounds.map((s) =>
        s.id === id ? { ...s, name: name.trim() } : s,
      ),
    }));
  },

  assignHotkey: async (id: string, hotkey: string) => {
    await tauri.assignHotkey(id, hotkey);
    set((state) => ({
      sounds: state.sounds.map((s) => (s.id === id ? { ...s, hotkey } : s)),
    }));
  },

  removeHotkey: async (id: string) => {
    await tauri.removeHotkey(id);
    set((state) => ({
      sounds: state.sounds.map((s) => (s.id === id ? { ...s, hotkey: null } : s)),
    }));
  },

  duplicateSound: (id) => {
    const state = get();
    const sound = state.sounds.find((s) => s.id === id);
    if (!sound) return null;
    const newId = crypto.randomUUID();
    const audio = new Audio(sound.file);
    const newAudioRefs = new Map(state.audioRefs);
    newAudioRefs.set(newId, audio);
    const newSound = {
      ...sound,
      id: newId,
      name: `${sound.name} (copy)`,
      hotkey: null,
      favorite: false,
    };
    set({
      sounds: [...state.sounds, newSound],
      audioRefs: newAudioRefs,
    });
    return newId;
  },

  getAudio: (id) => get().audioRefs.get(id),

  loadDurations: () => {
    const state = get();
    state.sounds.forEach((s) => {
      const audio = state.audioRefs.get(s.id);
      if (!audio) {
        const newAudio = new Audio(s.file);
        newAudio.addEventListener("loadedmetadata", () => {
          set((prev) => ({
            sounds: prev.sounds.map((p) =>
              p.id === s.id
                ? { ...p, duration: formatDuration(newAudio.duration * 1000) }
                : p,
            ),
          }));
        });
        const newAudioRefs = new Map(get().audioRefs);
        newAudioRefs.set(s.id, newAudio);
        set({ audioRefs: newAudioRefs });
      }
    });
  },
}));
