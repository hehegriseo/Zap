import {
  FolderPlus,
  RefreshCw,
  Download,
  Search,
  ArrowUpDown,
  Heart,
  ListMusic,
  Cable,
  Settings,
  HelpCircle,
} from "lucide-react";
import { useUIStore } from "@/store/ui";

interface ActionButton {
  icon: typeof FolderPlus;
  label: string;
  onClick?: () => void;
}

export function RightPanel() {
  const setSearchOpen = useUIStore((s) => s.setSearchOpen);

  const topActions: ActionButton[] = [
    { icon: FolderPlus, label: "Add Tab" },
    { icon: RefreshCw, label: "Reload" },
    { icon: Download, label: "Downloader" },
    { icon: Search, label: "Search", onClick: () => setSearchOpen(true) },
    { icon: ArrowUpDown, label: "Sort" },
    { icon: Heart, label: "Favorites" },
  ];

  const bottomActions: ActionButton[] = [
    { icon: ListMusic, label: "Playlist Mode" },
    { icon: Cable, label: "Pass Through" },
    { icon: Settings, label: "Settings" },
    { icon: HelpCircle, label: "Help" },
  ];

  return (
    <aside className="flex w-44 flex-shrink-0 flex-col border-l border-white/5 bg-sidebar/50 backdrop-blur-md">
      {/* Top actions */}
      <div className="flex flex-col gap-0.5 p-2">
        {topActions.map((action) => (
          <button
            key={action.label}
            onClick={action.onClick}
            className="group flex items-center gap-2.5 rounded-lg px-3 py-2 text-[11px] font-medium text-white/35 transition-all duration-200 hover:bg-white/5 hover:text-white/70"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-white/5 transition-colors group-hover:bg-white/10">
              <action.icon className="h-3 w-3" />
            </div>
            {action.label}
          </button>
        ))}
      </div>

      {/* Divider */}
      <div className="mx-3 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Bottom actions */}
      <div className="flex flex-col gap-0.5 p-2">
        {bottomActions.map((action) => (
          <button
            key={action.label}
            className="group flex items-center gap-2.5 rounded-lg px-3 py-2 text-[11px] font-medium text-white/35 transition-all duration-200 hover:bg-white/5 hover:text-white/70"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-white/5 transition-colors group-hover:bg-white/10">
              <action.icon className="h-3 w-3" />
            </div>
            {action.label}
          </button>
        ))}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Branding at bottom */}
      <div className="p-3">
        <div className="rounded-lg bg-white/[0.02] p-3 ring-1 ring-white/5">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]" />
            <span className="text-[10px] text-white/25">Connected</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
