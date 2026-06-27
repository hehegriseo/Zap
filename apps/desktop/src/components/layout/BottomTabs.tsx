import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/ui";
import type { FilterView } from "@/lib/types";

const tabs: { id: FilterView; label: string; emoji: string }[] = [
  { id: "all", label: "All Sounds", emoji: "🎵" },
  { id: "voice", label: "Voice", emoji: "🎤" },
  { id: "music", label: "Music", emoji: "🎶" },
  { id: "favorites", label: "Favorites", emoji: "⭐" },
];

export function BottomTabs() {
  const filterView = useUIStore((s) => s.filterView);
  const setFilterView = useUIStore((s) => s.setFilterView);

  return (
    <div className="relative flex h-12 flex-shrink-0 items-center gap-1.5 border-b border-white/5 bg-background/50 px-3 backdrop-blur-md">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setFilterView(tab.id)}
          className={cn(
            "relative flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[11px] font-medium transition-all duration-200",
            filterView === tab.id
              ? "bg-primary/15 text-primary ring-1 ring-primary/25 shadow-[0_0_12px_rgba(147,51,234,0.1)]"
              : "text-white/35 hover:bg-white/5 hover:text-white/60"
          )}
        >
          <span className="text-xs">{tab.emoji}</span>
          {tab.label}
          {filterView === tab.id && (
            <div className="absolute -bottom-3 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-primary shadow-[0_0_8px_rgba(147,51,234,0.5)]" />
          )}
        </button>
      ))}

      <div className="flex-1" />

      <button className="flex h-7 w-7 items-center justify-center rounded-full bg-white/5 text-white/25 ring-1 ring-white/5 transition-all hover:bg-white/10 hover:text-white/50 hover:ring-white/10">
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
