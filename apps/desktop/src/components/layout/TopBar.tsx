import { useState, useEffect, useCallback } from "react";
import { Square, Volume2, Zap, RefreshCw, ChevronDown, X } from "lucide-react";
import { usePlayerStore } from "@/store/player";
import { listOutputApps, type OutputApp } from "@/lib/tauri";
import { cn } from "@/lib/utils";

export function TopBar() {
  const localVolume = usePlayerStore((s) => s.localVolume);
  const setLocalVolume = usePlayerStore((s) => s.setLocalVolume);
  const remoteVolume = usePlayerStore((s) => s.remoteVolume);
  const setRemoteVolume = usePlayerStore((s) => s.setRemoteVolume);
  const playingIds = usePlayerStore((s) => s.playingIds);
  const stopAll = usePlayerStore((s) => s.stopAll);
  const isPlaying = playingIds.size > 0;

  const [outputApps, setOutputApps] = useState<OutputApp[]>([]);
  const [selectedApp, setSelectedApp] = useState<OutputApp | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const fetchApps = useCallback(async () => {
    setRefreshing(true);
    try {
      const apps = await listOutputApps();
      setOutputApps(apps);
      // Auto-select first default app if none selected
      if (!selectedApp && apps.length > 0) {
        const defaultApp = apps.find((a) => a.is_default) ?? apps[0] ?? null;
        setSelectedApp(defaultApp ?? null);
      }
    } catch {
      // Fallback
      const fallback: OutputApp[] = [
        { id: "default", name: "Default Output", description: "System Default", is_default: true },
      ];
      setOutputApps(fallback);
      if (!selectedApp) setSelectedApp(fallback[0] ?? null);
    }
    setRefreshing(false);
  }, [selectedApp]);

  useEffect(() => {
    fetchApps();
  }, []);

  const handleRefresh = async () => {
    await fetchApps();
  };

  const handleClearApp = () => {
    setSelectedApp(null);
  };

  return (
    <header className="relative flex h-14 flex-shrink-0 items-center gap-4 border-b border-white/5 bg-background/80 px-4 backdrop-blur-xl">
      {/* Subtle top gradient line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      {/* Logo */}
      <div className="flex items-center gap-2.5">
        <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/20">
          <Zap className="h-4 w-4 text-primary" />
          <div className="absolute inset-0 rounded-xl bg-primary/5 blur-sm" />
        </div>
        <span className="text-sm font-bold tracking-tight text-foreground">
          Zap
        </span>
      </div>

      {/* Stop Button */}
      <button
        onClick={stopAll}
        className={cn(
          "group flex h-8 items-center gap-2 rounded-lg px-4 text-xs font-bold uppercase tracking-wider transition-all duration-200",
          isPlaying
            ? "bg-red-500/15 text-red-400 ring-1 ring-red-500/20 hover:bg-red-500/25 hover:ring-red-500/30"
            : "bg-white/5 text-white/20 ring-1 ring-white/5 hover:bg-white/10 hover:text-white/40"
        )}
      >
        <Square className="h-3 w-3" fill="currentColor" />
        Stop
      </button>

      {/* Local Volume */}
      <div className="flex items-center gap-2 ml-1">
        <Volume2 className="h-3 w-3 text-white/25" />
        <span className="text-[10px] text-white/30 w-10">Local</span>
        <input
          type="range"
          min="0"
          max="100"
          value={localVolume}
          onChange={(e) => setLocalVolume(Number(e.target.value))}
          className="h-1 w-24 cursor-pointer appearance-none rounded-full bg-white/10 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-[0_0_6px_rgba(255,255,255,0.2)] [&::-webkit-slider-thumb]:transition-shadow [&::-webkit-slider-thumb]:hover:shadow-[0_0_10px_rgba(255,255,255,0.4)]"
        />
        <span className="w-5 text-right font-mono text-[10px] tabular-nums text-white/25">
          {localVolume}
        </span>
      </div>

      {/* Remote Volume */}
      <div className="flex items-center gap-2">
        <Volume2 className="h-3 w-3 text-white/25" />
        <span className="text-[10px] text-white/30 w-12">Remote</span>
        <input
          type="range"
          min="0"
          max="100"
          value={remoteVolume}
          onChange={(e) => setRemoteVolume(Number(e.target.value))}
          className="h-1 w-24 cursor-pointer appearance-none rounded-full bg-white/10 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-[0_0_6px_rgba(255,255,255,0.2)] [&::-webkit-slider-thumb]:transition-shadow [&::-webkit-slider-thumb]:hover:shadow-[0_0_10px_rgba(255,255,255,0.4)]"
        />
        <span className="w-5 text-right font-mono text-[10px] tabular-nums text-white/25">
          {remoteVolume}
        </span>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Playing indicator */}
      {isPlaying && (
        <div className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 ring-1 ring-primary/20">
          <div className="flex items-end gap-[2px] h-2.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-[2px] rounded-full bg-primary animate-bar-wave"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
          <span className="text-[10px] font-semibold text-primary/80 tabular-nums">
            {playingIds.size}
          </span>
        </div>
      )}

      {/* Refresh Button */}
      <button
        onClick={handleRefresh}
        disabled={refreshing}
        className={cn(
          "flex h-8 items-center gap-1.5 rounded-lg bg-primary/10 px-3 text-xs font-medium text-primary/80 ring-1 ring-primary/20 transition-all hover:bg-primary/15 hover:ring-primary/30",
          refreshing && "animate-pulse"
        )}
      >
        <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />
        Refresh
      </button>

      {/* Output App Selector */}
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 ring-1 ring-white/5 transition-all hover:bg-white/8 hover:ring-white/10"
        >
          {selectedApp ? (
            <>
              <div className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]" />
              <span className="text-[11px] text-white/60 max-w-[120px] truncate">
                {selectedApp.name}
              </span>
              {selectedApp.id !== "default" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClearApp();
                  }}
                  className="ml-1 rounded p-0.5 text-white/20 hover:text-white/50"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </>
          ) : (
            <>
              <div className="h-2 w-2 rounded-full bg-white/15" />
              <span className="text-[11px] text-white/30">No Output</span>
            </>
          )}
          <ChevronDown className={cn("h-3 w-3 text-white/20 transition-transform", showDropdown && "rotate-180")} />
        </button>

        {/* Dropdown */}
        {showDropdown && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
            <div className="absolute right-0 top-full z-50 mt-1 w-56 overflow-hidden rounded-xl border border-white/10 bg-[hsl(230,20%,10%)]/95 p-1 shadow-2xl backdrop-blur-xl animate-slide-in">
              <p className="px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider text-white/20">
                Output Applications
              </p>
              {outputApps.length === 0 ? (
                <div className="px-3 py-4 text-center text-[11px] text-white/20">
                  No outputs found
                </div>
              ) : (
                outputApps.map((app) => (
                  <button
                    key={app.id}
                    onClick={() => {
                      setSelectedApp(app);
                      setShowDropdown(false);
                    }}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left transition-colors",
                      selectedApp?.id === app.id
                        ? "bg-primary/10 text-white/70"
                        : "text-white/40 hover:bg-white/5 hover:text-white/60"
                    )}
                  >
                    <div className={cn(
                      "h-2 w-2 rounded-full",
                      selectedApp?.id === app.id
                        ? "bg-primary shadow-[0_0_6px_rgba(147,51,234,0.5)]"
                        : app.is_default
                          ? "bg-emerald-400"
                          : "bg-white/15"
                    )} />
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-[11px] font-medium">{app.name}</p>
                      <p className="truncate text-[9px] text-white/20">{app.description}</p>
                    </div>
                    {app.is_default && (
                      <span className="text-[8px] uppercase tracking-wider text-emerald-400/50">default</span>
                    )}
                  </button>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </header>
  );
}
