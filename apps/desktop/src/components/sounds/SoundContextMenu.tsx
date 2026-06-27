import { useRef, useEffect } from "react";
import {
  Play,
  Square,
  Star,
  Pencil,
  Copy,
  Trash2,
  Keyboard,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Sound } from "@/lib/types";

interface ContextMenuProps {
  x: number;
  y: number;
  sound: Sound;
  isPlaying: boolean;
  onClose: () => void;
  onPlay: () => void;
  onStop: () => void;
  onRename: () => void;
  onToggleFavorite: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onAssignHotkey: () => void;
  onRemoveHotkey: () => void;
}

interface MenuItem {
  icon: typeof Play;
  label: string;
  shortcut?: string;
  danger?: boolean;
  action?: () => void;
  divider?: boolean;
}

export function SoundContextMenu({
  x,
  y,
  sound,
  isPlaying,
  onClose,
  onPlay,
  onStop,
  onRename,
  onToggleFavorite,
  onDuplicate,
  onDelete,
  onAssignHotkey,
  onRemoveHotkey,
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("mousedown", handleClick);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("mousedown", handleClick);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const items: MenuItem[] = [
    {
      icon: isPlaying ? Square : Play,
      label: isPlaying ? "Stop" : "Play",
      shortcut: "Space",
      action: isPlaying ? onStop : onPlay,
    },
    { icon: Play, label: "", divider: true },
    { icon: Pencil, label: "Rename", shortcut: "F2", action: onRename },
    {
      icon: Keyboard,
      label: sound.hotkey ? "Change Hotkey" : "Assign Hotkey",
      action: onAssignHotkey,
    },
    ...(sound.hotkey
      ? [{ icon: X, label: "Remove Hotkey", action: onRemoveHotkey }]
      : []),
    {
      icon: Star,
      label: sound.favorite ? "Unfavorite" : "Favorite",
      action: onToggleFavorite,
    },
    { icon: Play, label: "", divider: true },
    { icon: Copy, label: "Duplicate", shortcut: "Ctrl+D", action: onDuplicate },
    { icon: Play, label: "", divider: true },
    {
      icon: Trash2,
      label: "Delete",
      shortcut: "Del",
      danger: true,
      action: onDelete,
    },
  ];

  const adjustedX = Math.min(x, window.innerWidth - 220);
  const adjustedY = Math.min(y, window.innerHeight - 300);

  return (
    <div
      ref={menuRef}
      className="fixed z-[100] min-w-[200px] overflow-hidden rounded-xl border border-white/10 bg-[hsl(230,20%,10%)]/90 p-1.5 shadow-2xl backdrop-blur-xl animate-fade-in"
      style={{ left: adjustedX, top: adjustedY }}
    >
      {/* Header */}
      <div className="border-b border-white/5 px-3 py-2">
        <p className="truncate text-xs font-medium text-white/70">{sound.name}</p>
        <p className="mt-0.5 font-mono text-[10px] text-white/30">
          {sound.duration}
          {sound.hotkey ? (
            <span className="ml-1">
              <kbd className="rounded-md border border-white/10 bg-white/5 px-1 py-0.5 text-[9px]">{sound.hotkey}</kbd>
            </span>
          ) : ""}
        </p>
      </div>

      {/* Items */}
      {items.map((item, i) => {
        if (item.divider) {
          return <div key={i} className="my-1 h-px bg-white/5" />;
        }
        const Icon = item.icon;
        return (
          <button
            key={i}
            onClick={() => {
              item.action?.();
              onClose();
            }}
            className={cn(
              "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs transition-colors",
              item.danger
                ? "text-red-400/70 hover:bg-red-500/10 hover:text-red-400"
                : "text-white/50 hover:bg-white/5 hover:text-white/80",
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            <span className="flex-1 text-left">{item.label}</span>
            {item.shortcut && (
              <span className="font-mono text-[10px] text-white/20">
                {item.shortcut}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
