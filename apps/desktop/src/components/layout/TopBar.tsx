import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

/** Top bar with search input and global controls. */
export function TopBar() {
  return (
    <header className="flex h-14 items-center border-b px-4">
      <div className="relative w-64">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search sounds..." className="pl-9" />
      </div>
    </header>
  );
}
