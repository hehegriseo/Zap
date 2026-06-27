import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import type { Sound } from "@/lib/types";

const categoryGradients: Record<string, string> = {
  voice: "from-blue-500/20 to-violet-500/10",
  music: "from-amber-500/20 to-orange-500/10",
};

interface SoundCardProps {
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

export function SoundCard({
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
}: SoundCardProps) {
  const [editValue, setEditValue] = useState(sound.name);
  const editRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && editRef.current) {
      editRef.current.focus();
      editRef.current.select();
    }
  }, [editing]);

  const gradient = categoryGradients[sound.category] ?? "from-white/10 to-white/5";

  return (
    <button
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
        "group relative flex items-center justify-center overflow-hidden rounded-xl border px-3 py-3.5 text-xs font-medium transition-all duration-300",
        playing
          ? "border-primary/30 bg-primary/10 text-foreground shadow-[0_0_24px_rgba(147,51,234,0.15)]"
          : selected
            ? "border-primary/20 bg-primary/5 text-foreground shadow-[0_0_16px_rgba(147,51,234,0.08)]"
            : focused
              ? "border-white/10 bg-white/5 text-foreground"
              : "border-white/[0.04] bg-white/[0.02] text-white/50 hover:border-white/10 hover:bg-white/[0.04] hover:text-white/80"
      )}
    >
      {/* Gradient overlay */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300",
        gradient,
        playing ? "opacity-100" : "group-hover:opacity-50"
      )} />

      {/* Playing glow ring */}
      {playing && (
        <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-primary/20" />
      )}

      {/* Content */}
      <div className="relative z-10 flex w-full items-center justify-between">
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
          <>
            <span className="truncate text-left flex-1">{sound.name}</span>
            {sound.hotkey && (
              <kbd className="ml-2 flex-shrink-0 rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[9px] text-white/30">
                {sound.hotkey}
              </kbd>
            )}
          </>
        )}
      </div>

      {/* Progress bar */}
      {playing && (
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/5">
          <div
            className="h-full bg-gradient-to-r from-primary to-primary/70 transition-[width] duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </button>
  );
}
