import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Music,
  MonitorSpeaker,
  Settings,
  ScrollText,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/library", icon: Music, label: "Library" },
  { to: "/devices", icon: MonitorSpeaker, label: "Devices" },
  { to: "/settings", icon: Settings, label: "Settings" },
  { to: "/logs", icon: ScrollText, label: "Logs" },
  { to: "/about", icon: Info, label: "About" },
];

/** Application sidebar with navigation links. */
export function Sidebar() {
  return (
    <aside className="flex w-60 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="flex h-14 items-center border-b border-sidebar-border px-4">
        <span className="text-lg font-bold text-sidebar-foreground">Zap</span>
      </div>
      <nav className="flex-1 space-y-1 p-2">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50",
              )
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
