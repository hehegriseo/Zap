import { useState, useRef, useEffect } from "react";
import { Play, Square, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Sound } from "@/lib/types";

interface SoundItemProps {
  sound: Sound;
  playing: boolean;
  progress: number;
  selected: boolean;
  focused: boolean;
  editing: boolean;
  onPlay: () => void;
  onStop: () => void;
  onSelect: (multi: boolean) => void;
  onContextMenu: (e: React.MouseEvent) => void;
  onRenameSubmit: (name: string) => void;
  onRenameCancel: () => void;
}

export function SoundItem({
  sound,
  playing,
  progress,
  selected,
  focused,
  editing,
  onPlay,
  onStop,
  onSelect,
  onContextMenu,
  onRenameSubmit,
  onRenameCancel,
}: SoundItemProps) {
  const [editValue, setEditValue] = useState(sound.name);
  const editRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && editRef.current) {
      editRef.current.focus();
      editRef.current.select();
    }
  }, [editing]);

  return (
    <div
      onClick={(e) => {
        if (editing) return;
        if (e.shiftKey || e.ctrlKey || e.metaKey) {
          onSelect(true);
        } else if (playing) {
          onStop();
        } else {
          onPlay();
        }
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        onContextMenu(e);
      }}
      className={cn(
        "group relative flex h-10 items-center gap-3 rounded-xl border px-3 text-xs transition-all duration-200 cursor-default",
        playing
          ? "border-primary/25 bg-primary/8 text-foreground shadow-[0_0_16px_rgba(147,51,234,0.08)]"
          : selected
            ? "border-primary/15 bg-primary/5 text-foreground"
            : focused
              ? "border-white/10 bg-white/5 text-foreground"
              : "border-white/[0.04] bg-white/[0.02] text-white/50 hover:bg-white/[0.04] hover:border-white/10 hover:text-white/70"
      )}
    >
      {/* Play/Stop button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (playing) onStop();
          else onPlay();
        }}
        className={cn(
          "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg transition-all duration-200",
          playing
            ? "bg-primary/15 text-primary shadow-[0_0_8px_rgba(147,51,234,0.15)]"
            : "bg-white/5 text-white/30 hover:bg-white/10 hover:text-white/60"
        )}
      >
        {playing ? (
          <Square className="h-3 w-3" fill="currentColor" />
        ) : (
          <Play className="h-3 w-3 ml-0.5" fill="currentColor" />
        )}
      </button>

      {/* Name */}
      <div className="flex-1 min-w-0">
        {editing ? (
          <input
            ref={editRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onRenameSubmit(editValue);
              if (e.key === "Escape") onRenameCancel();
              e.stopPropagation();
            }}
            onClick={(e) => e.stopPropagation()}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-foreground outline-none ring-1 ring-white/10 backdrop-blur-sm"
          />
        ) : (
          <span className={cn(
            "truncate text-xs",
            playing ? "text-foreground font-medium" : "",
          )}>
            {sound.name}
          </span>
        )}
      </div>

      {/* Hotkey */}
      {sound.hotkey && (
        <kbd className="flex h-5 min-w-[28px] flex-shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/5 px-1.5 font-mono text-[10px] text-white/30">
          {sound.hotkey}
        </kbd>
      )}

      {/* More menu */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onContextMenu(e);
        }}
        className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md text-white/15 opacity-0 group-hover:opacity-100 transition-all hover:bg-white/5 hover:text-white/50"
      >
        <MoreHorizontal className="h-3.5 w-3.5" />
      </button>

      {/* Progress bar */}
      {playing && (
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/5">
          <div
            className="h-full bg-gradient-to-r from-primary to-primary/70 transition-[width] duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
