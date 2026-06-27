import { useUIStore } from "./ui";
import type { FilterView } from "@/lib/types";

export function useFilterStore() {
  const view = useUIStore((s) => s.filterView);
  const setView = useUIStore((s) => s.setFilterView);
  return { view, setView };
}

export type { FilterView };
