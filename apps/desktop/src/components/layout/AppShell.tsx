import { Outlet } from "react-router-dom";
import { TopBar } from "./TopBar";
import { BottomTabs } from "./BottomTabs";
import { RightPanel } from "./RightPanel";

export function AppShell() {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      {/* Background gradient */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -left-32 -top-32 h-64 w-64 rounded-full bg-primary/5 blur-[100px]" />
        <div className="absolute -bottom-32 -right-32 h-64 w-64 rounded-full bg-primary/3 blur-[100px]" />
      </div>

      <div className="relative flex flex-1 flex-col overflow-hidden">
        <TopBar />
        <div className="flex flex-1 overflow-hidden">
          <main className="flex flex-1 flex-col overflow-hidden">
            <BottomTabs />
            <div className="flex-1 overflow-hidden">
              <Outlet />
            </div>
          </main>
          <RightPanel />
        </div>
      </div>
    </div>
  );
}
