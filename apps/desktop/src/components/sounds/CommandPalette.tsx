import { useRef, useEffect, useMemo } from "react";
import { Search, Music, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/ui";
import { useLibraryStore } from "@/store/library";
import { usePlayerStore } from "@/store/player";

export function CommandPalette() {
  const searchOpen = useUIStore((s) => s.searchOpen);
  const setSearchOpen = useUIStore((s) => s.setSearchOpen);
  const search = useUIStore((s) => s.search);
  const setSearch = useUIStore((s) => s.setSearch);
  const sounds = useLibraryStore((s) => s.sounds);
  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const searchRef = useRef<HTMLInputElement>(null);

  const filteredSounds = useMemo(() => {
    if (!search) return sounds;
    const q = search.toLowerCase();
    return sounds.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.tags.some((t) => t.toLowerCase().includes(q)) ||
        s.category.toLowerCase().includes(q) ||
        (s.hotkey && s.hotkey.toLowerCase().includes(q)),
    );
  }, [search, sounds]);

  useEffect(() => {
    if (searchOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [searchOpen]);

  if (!searchOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 pt-[12vh] backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setSearchOpen(false);
        }
      }}
    >
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-[hsl(230,20%,10%)]/95 shadow-2xl backdrop-blur-xl animate-slide-in">
        {/* Search input */}
        <div className="flex items-center gap-3 border-b border-white/5 px-5 py-4">
          <Search className="h-4 w-4 text-white/30" />
          <input
            ref={searchRef}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search sounds..."
            className="flex-1 bg-transparent text-sm text-white placeholder:text-white/20 outline-none"
          />
          <kbd className="rounded-lg border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[10px] text-white/30">
            esc
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-72 overflow-y-auto p-2 scrollbar-thin">
          {filteredSounds.length === 0 ? (
            <div className="flex flex-col items-center py-8">
              <Music className="h-8 w-8 text-white/10" />
              <p className="mt-3 text-xs text-white/20">
                No sounds found
              </p>
            </div>
          ) : (
            <>
              <p className="px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider text-white/20">
                Sounds ({filteredSounds.length})
              </p>
              {filteredSounds.map((sound, i) => (
                <button
                  key={sound.id}
                  onClick={() => {
                    togglePlay(sound.id);
                    setSearchOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left transition-colors",
                    i === 0 ? "bg-white/5" : "hover:bg-white/[0.03]",
                  )}
                >
                  <div className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary/50" />
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-xs font-medium text-white/70">
                      {sound.name}
                    </p>
                    <div className="mt-0.5 flex items-center gap-2">
                      <span className="text-[10px] text-white/25 capitalize">
                        {sound.category}
                      </span>
                      <span className="font-mono text-[10px] text-white/15 tabular-nums">
                        {sound.duration}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {sound.hotkey && (
                      <kbd className="rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-white/25">
                        {sound.hotkey}
                      </kbd>
                    )}
                    <ArrowRight className="h-3.5 w-3.5 text-white/10" />
                  </div>
                </button>
              ))}
            </>
          )}
        </div>

        {/* Footer hints */}
        <div className="flex items-center justify-between border-t border-white/5 px-5 py-2.5">
          <div className="flex items-center gap-3 text-[10px] text-white/20">
            <span className="flex items-center gap-1">
              <kbd className="rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[9px]">↑↓</kbd>
              navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[9px]">↵</kbd>
              play
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[9px]">esc</kbd>
              close
            </span>
          </div>
          <span className="text-[10px] text-white/15">
            {filteredSounds.length} result{filteredSounds.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>
    </div>
  );
}
