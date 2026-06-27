import { create } from "zustand";
import * as tauri from "@/lib/tauri";

interface PlayerState {
  playingIds: Set<string>;
  progress: Record<string, number>;
  masterVolume: number;
  localVolume: number;
  remoteVolume: number;
  selectedOutputApp: string | null;
  togglePlay: (id: string) => void;
  play: (id: string) => void;
  stop: (id: string) => void;
  stopAll: () => void;
  setProgress: (id: string, value: number) => void;
  clearProgress: (id: string) => void;
  setMasterVolume: (volume: number) => void;
  setLocalVolume: (volume: number) => void;
  setRemoteVolume: (volume: number) => void;
  setSelectedOutputApp: (appId: string | null) => void;
  isPlaying: (id: string) => boolean;
  playingCount: () => number;
  loadSettings: () => Promise<void>;
  saveSettings: () => Promise<void>;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  playingIds: new Set(),
  progress: {},
  masterVolume: 80,
  localVolume: 60,
  remoteVolume: 80,
  selectedOutputApp: null,

  togglePlay: (id) => {
    const state = get();
    if (state.playingIds.has(id)) {
      state.stop(id);
    } else {
      state.play(id);
    }
  },

  play: (id) =>
    set((state) => ({
      playingIds: new Set([...state.playingIds, id]),
      progress: { ...state.progress, [id]: 0 },
    })),

  stop: (id) =>
    set((state) => {
      const next = new Set(state.playingIds);
      next.delete(id);
      const nextProgress = { ...state.progress };
      delete nextProgress[id];
      return { playingIds: next, progress: nextProgress };
    }),

  stopAll: () => set({ playingIds: new Set(), progress: {} }),

  setProgress: (id, value) =>
    set((state) => ({
      progress: { ...state.progress, [id]: value },
    })),

  clearProgress: (id) =>
    set((state) => {
      const next = { ...state.progress };
      delete next[id];
      return { progress: next };
    }),

  setMasterVolume: (volume) => {
    set({ masterVolume: volume });
    get().saveSettings();
  },

  setLocalVolume: (volume) => {
    set({ localVolume: volume });
    get().saveSettings();
  },

  setRemoteVolume: (volume) => {
    set({ remoteVolume: volume });
    get().saveSettings();
  },

  setSelectedOutputApp: (appId) => {
    set({ selectedOutputApp: appId });
    get().saveSettings();
  },

  isPlaying: (id) => get().playingIds.has(id),

  playingCount: () => get().playingIds.size,

  loadSettings: async () => {
    try {
      const config = await tauri.getSettings();
      set({
        masterVolume: Math.round(config.audio.sample_rate > 0 ? 80 : 80),
        selectedOutputApp: config.audio.output_device,
      });
    } catch (err) {
      console.error("Failed to load settings:", err);
    }
  },

  saveSettings: async () => {
    const state = get();
    try {
      const existing = await tauri.getSettings();
      await tauri.saveSettings({
        ...existing,
        audio: {
          ...existing.audio,
          output_device: state.selectedOutputApp,
        },
      });
    } catch (err) {
      console.error("Failed to save settings:", err);
    }
  },
}));
