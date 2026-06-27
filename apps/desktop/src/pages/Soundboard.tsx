import { useCallback, useEffect, useMemo } from "react";
import { Plus, Music } from "lucide-react";
import { useUIStore } from "@/store/ui";
import { useLibraryStore } from "@/store/library";
import { usePlayerStore } from "@/store/player";
import { SoundCard } from "@/components/sounds/SoundCard";
import { SoundContextMenu } from "@/components/sounds/SoundContextMenu";
import { CommandPalette } from "@/components/sounds/CommandPalette";

export function Soundboard() {
  const sounds = useLibraryStore((s) => s.sounds);
  const audioRefs = useLibraryStore((s) => s.audioRefs);
  const loadDurations = useLibraryStore((s) => s.loadDurations);
  const toggleFavorite = useLibraryStore((s) => s.toggleFavorite);
  const renameSound = useLibraryStore((s) => s.renameSound);
  const assignHotkey = useLibraryStore((s) => s.assignHotkey);
  const removeHotkey = useLibraryStore((s) => s.removeHotkey);
  const duplicateSound = useLibraryStore((s) => s.duplicateSound);
  const removeSound = useLibraryStore((s) => s.removeSound);
  const removeSounds = useLibraryStore((s) => s.removeSounds);
  const addSounds = useLibraryStore((s) => s.addSounds);

  const playingIds = usePlayerStore((s) => s.playingIds);
  const progress = usePlayerStore((s) => s.progress);
  const play = usePlayerStore((s) => s.play);
  const stop = usePlayerStore((s) => s.stop);
  const stopAll = usePlayerStore((s) => s.stopAll);
  const setProgress = usePlayerStore((s) => s.setProgress);
  const clearProgress = usePlayerStore((s) => s.clearProgress);

  const filterView = useUIStore((s) => s.filterView);
  const viewMode = useUIStore((s) => s.viewMode);
  const search = useUIStore((s) => s.search);
  const searchOpen = useUIStore((s) => s.searchOpen);
  const setSearchOpen = useUIStore((s) => s.setSearchOpen);
  const selectedIds = useUIStore((s) => s.selectedIds);
  const toggleSelection = useUIStore((s) => s.toggleSelection);
  const selectAll = useUIStore((s) => s.selectAll);
  const clearSelection = useUIStore((s) => s.clearSelection);
  const focusedIndex = useUIStore((s) => s.focusedIndex);
  const setFocusedIndex = useUIStore((s) => s.setFocusedIndex);
  const editingId = useUIStore((s) => s.editingId);
  const setEditingId = useUIStore((s) => s.setEditingId);
  const assigningHotkeyId = useUIStore((s) => s.assigningHotkeyId);
  const setAssigningHotkeyId = useUIStore((s) => s.setAssigningHotkeyId);
  const contextMenu = useUIStore((s) => s.contextMenu);
  const setContextMenu = useUIStore((s) => s.setContextMenu);
  const dragOver = useUIStore((s) => s.dragOver);
  const setDragOver = useUIStore((s) => s.setDragOver);

  useEffect(() => {
    loadDurations();
  }, [loadDurations]);

  const filteredSounds = useMemo(() => {
    return sounds.filter((s) => {
      if (filterView === "favorites") return s.favorite;
      if (filterView !== "all" && s.category !== filterView) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          s.name.toLowerCase().includes(q) ||
          s.tags.some((t) => t.toLowerCase().includes(q)) ||
          s.category.toLowerCase().includes(q) ||
          (s.hotkey && s.hotkey.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [filterView, search, sounds]);

  const handleTogglePlay = useCallback(
    (id: string) => {
      const audio = audioRefs.get(id);
      if (!audio) return;

      if (playingIds.has(id)) {
        audio.pause();
        audio.currentTime = 0;
        stop(id);
        clearProgress(id);
      } else {
        audio.currentTime = 0;
        audio.play().catch(() => {});
        play(id);

        const interval = setInterval(() => {
          if (audio.duration) {
            setProgress(id, (audio.currentTime / audio.duration) * 100);
          }
        }, 100);

        audio.onended = () => {
          stop(id);
          clearProgress(id);
          clearInterval(interval);
        };
      }
    },
    [audioRefs, playingIds, play, stop, setProgress, clearProgress]
  );

  const handleStop = useCallback(
    (id: string) => {
      const audio = audioRefs.get(id);
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
      stop(id);
      clearProgress(id);
    },
    [audioRefs, stop, clearProgress]
  );

  const handleStopAll = useCallback(() => {
    audioRefs.forEach((audio) => {
      audio.pause();
      audio.currentTime = 0;
    });
    stopAll();
    Object.keys(progress).forEach((id) => clearProgress(id));
  }, [audioRefs, stopAll, progress, clearProgress]);

  useEffect(() => {
    return () => {
      audioRefs.forEach((audio) => {
        audio.pause();
        audio.src = "";
      });
    };
  }, [audioRefs]);

  useEffect(() => {
    if (!assigningHotkeyId) return;
    const handler = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.key === "Escape") {
        setAssigningHotkeyId(null);
        return;
      }
      let key = e.key;
      if (key === " ") key = "Space";
      else if (key === "Shift") key = "Shift";
      else if (key === "Control") key = "Ctrl";
      else if (key === "Alt") key = "Alt";
      else if (key === "Meta") key = "Meta";
      else if (key.length === 1) key = key.toUpperCase();

      const conflict = sounds.find((s) => s.hotkey === key && s.id !== assigningHotkeyId);
      if (conflict) {
        useLibraryStore.getState().updateSound(assigningHotkeyId, { hotkey: key });
        useLibraryStore.getState().updateSound(conflict.id, { hotkey: null });
      } else {
        assignHotkey(assigningHotkeyId, key);
      }
      setAssigningHotkeyId(null);
    };
    window.addEventListener("keydown", handler, true);
    return () => window.removeEventListener("keydown", handler, true);
  }, [assigningHotkeyId, sounds, assignHotkey, setAssigningHotkeyId]);

  useEffect(() => {
    if (assigningHotkeyId || editingId || searchOpen) return;

    const handler = (e: KeyboardEvent) => {
      if (e.key === "/" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setSearchOpen(true);
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "f") {
        e.preventDefault();
        setSearchOpen(true);
        return;
      }

      if (e.key === "Escape") {
        if (selectedIds.size > 0) {
          clearSelection();
          return;
        }
        if (playingIds.size > 0) {
          handleStopAll();
          return;
        }
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "a") {
        e.preventDefault();
        selectAll(filteredSounds.map((s) => s.id));
        return;
      }

      if ((e.key === "Delete" || e.key === "Backspace") && selectedIds.size > 0) {
        e.preventDefault();
        removeSounds(Array.from(selectedIds));
        clearSelection();
        return;
      }

      if (e.key === "ArrowRight") {
        e.preventDefault();
        setFocusedIndex((p) => Math.min(p + 1, filteredSounds.length - 1));
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setFocusedIndex((p) => Math.max(p - 1, 0));
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setFocusedIndex((p) => {
          const cols = viewMode === "grid" ? 6 : 1;
          return Math.min(p + cols, filteredSounds.length - 1);
        });
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setFocusedIndex((p) => {
          const cols = viewMode === "grid" ? 6 : 1;
          return Math.max(p - cols, 0);
        });
      }

      if (e.key === "Enter") {
        e.preventDefault();
        const s = filteredSounds[focusedIndex];
        if (s) handleTogglePlay(s.id);
      }

      if (e.key === "F2") {
        e.preventDefault();
        const s = filteredSounds[focusedIndex];
        if (s) setEditingId(s.id);
      }

      const key = e.key.toUpperCase();
      const sound = sounds.find((s) => s.hotkey === key);
      if (sound) {
        e.preventDefault();
        handleTogglePlay(sound.id);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [
    assigningHotkeyId,
    editingId,
    searchOpen,
    filteredSounds,
    focusedIndex,
    selectedIds,
    playingIds,
    sounds,
    viewMode,
    setSearchOpen,
    selectAll,
    clearSelection,
    setFocusedIndex,
    setEditingId,
    handleTogglePlay,
    handleStopAll,
    removeSounds,
  ]);

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!dragOver) setDragOver(true);
    },
    [dragOver, setDragOver]
  );

  const handleDragLeave = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.currentTarget === e.target) {
        setDragOver(false);
      }
    },
    [setDragOver]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOver(false);
      if (e.dataTransfer.files.length > 0) {
        addSounds(e.dataTransfer.files);
      }
    },
    [addSounds, setDragOver]
  );

  const contextMenuSound = contextMenu
    ? sounds.find((s) => s.id === contextMenu.soundId)
    : null;

  return (
    <div
      className="relative flex h-full flex-col"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag overlay */}
      {dragOver && (
        <div className="absolute inset-0 z-40 flex items-center justify-center border-2 border-dashed border-primary/30 bg-background/80 backdrop-blur-md">
          <div className="flex flex-col items-center gap-3 rounded-2xl bg-primary/10 p-8 ring-1 ring-primary/20">
            <Plus className="h-8 w-8 text-primary/60" />
            <p className="text-sm font-medium text-primary/70">Drop audio files to import</p>
          </div>
        </div>
      )}

      {/* Sound grid */}
      <div className="flex-1 overflow-y-auto p-3 scrollbar-thin">
        {filteredSounds.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-white/20">
            <Music className="h-12 w-12 mb-3" />
            <p className="text-sm">No sounds found</p>
            <p className="text-xs mt-1">Import audio files or change your filter</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8">
            {filteredSounds.map((sound, i) => (
              <SoundCard
                key={sound.id}
                sound={sound}
                playing={playingIds.has(sound.id)}
                progress={progress[sound.id] ?? 0}
                onPlay={() => handleTogglePlay(sound.id)}
                onStop={() => handleStop(sound.id)}
                selected={selectedIds.has(sound.id)}
                onSelect={(multi) => toggleSelection(sound.id, multi)}
                focused={i === focusedIndex}
                editing={editingId === sound.id}
                onRenameSubmit={(name) => {
                  renameSound(sound.id, name);
                  setEditingId(null);
                }}
                onRenameCancel={() => setEditingId(null)}
                onContextMenu={(e) =>
                  setContextMenu({ x: e.clientX, y: e.clientY, soundId: sound.id })
                }
              />
            ))}
            {/* Add button */}
            <button
              onClick={() => {
                const input = document.createElement("input");
                input.type = "file";
                input.multiple = true;
                input.accept = "audio/*";
                input.onchange = (e) => {
                  const target = e.target as HTMLInputElement;
                  if (target.files) addSounds(target.files);
                };
                input.click();
              }}
              className="flex items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.02] transition-all duration-300 hover:border-white/15 hover:bg-white/[0.04]"
              style={{ aspectRatio: "2 / 1" }}
            >
              <Plus className="h-4 w-4 text-white/15 transition-colors group-hover:text-white/30" />
            </button>
          </div>
        )}
      </div>

      {/* Context Menu */}
      {contextMenu && contextMenuSound && (
        <SoundContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          sound={contextMenuSound}
          isPlaying={playingIds.has(contextMenuSound.id)}
          onClose={() => setContextMenu(null)}
          onPlay={() => handleTogglePlay(contextMenuSound.id)}
          onStop={() => handleStop(contextMenuSound.id)}
          onRename={() => {
            setEditingId(contextMenuSound.id);
            setContextMenu(null);
          }}
          onToggleFavorite={() => {
            toggleFavorite(contextMenuSound.id);
            setContextMenu(null);
          }}
          onDuplicate={() => {
            duplicateSound(contextMenuSound.id);
            setContextMenu(null);
          }}
          onDelete={() => {
            removeSound(contextMenuSound.id);
            setContextMenu(null);
          }}
          onAssignHotkey={() => {
            setAssigningHotkeyId(contextMenuSound.id);
            setContextMenu(null);
          }}
          onRemoveHotkey={() => {
            removeHotkey(contextMenuSound.id);
            setContextMenu(null);
          }}
        />
      )}

      {/* Hotkey assignment indicator */}
      {assigningHotkeyId && (
        <div className="fixed bottom-12 left-1/2 z-50 -translate-x-1/2 animate-fade-in">
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-[hsl(230,20%,10%)]/90 px-5 py-2.5 text-xs text-white/60 shadow-2xl backdrop-blur-xl">
            <span className="animate-pulse text-white/30">Press a key to assign...</span>
            <button
              onClick={() => setAssigningHotkeyId(null)}
              className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] text-white/30 hover:text-white/60"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Command Palette */}
      <CommandPalette />
    </div>
  );
}
