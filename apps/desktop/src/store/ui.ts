import { create } from "zustand";
import type { ViewMode, SortBy, SortOrder, FilterView } from "@/lib/types";

interface UIState {
  filterView: FilterView;
  viewMode: ViewMode;
  sortBy: SortBy;
  sortOrder: SortOrder;
  search: string;
  searchOpen: boolean;
  selectedIds: Set<string>;
  focusedIndex: number;
  editingId: string | null;
  assigningHotkeyId: string | null;
  contextMenu: { x: number; y: number; soundId: string } | null;
  commandPaletteOpen: boolean;
  dragOver: boolean;

  setFilterView: (view: FilterView) => void;
  setViewMode: (mode: ViewMode) => void;
  setSortBy: (sort: SortBy) => void;
  setSortOrder: (order: SortOrder) => void;
  setSearch: (search: string) => void;
  setSearchOpen: (open: boolean) => void;
  toggleSearch: () => void;
  setSelectedIds: (ids: Set<string> | ((prev: Set<string>) => Set<string>)) => void;
  toggleSelection: (id: string, multi: boolean) => void;
  selectAll: (allIds: string[]) => void;
  clearSelection: () => void;
  setFocusedIndex: (index: number | ((prev: number) => number)) => void;
  setEditingId: (id: string | null) => void;
  setAssigningHotkeyId: (id: string | null) => void;
  setContextMenu: (menu: { x: number; y: number; soundId: string } | null) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setDragOver: (over: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  filterView: "all",
  viewMode: "grid",
  sortBy: "name",
  sortOrder: "asc",
  search: "",
  searchOpen: false,
  selectedIds: new Set(),
  focusedIndex: 0,
  editingId: null,
  assigningHotkeyId: null,
  contextMenu: null,
  commandPaletteOpen: false,
  dragOver: false,

  setFilterView: (view) => set({ filterView: view, focusedIndex: 0 }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setSortBy: (sort) => set({ sortBy: sort }),
  setSortOrder: (order) => set({ sortOrder: order }),
  setSearch: (search) => set({ search }),
  setSearchOpen: (open) => set({ searchOpen: open, search: open ? "" : "" }),
  toggleSearch: () => set((state) => ({ searchOpen: !state.searchOpen, search: "" })),
  setSelectedIds: (ids) =>
    set((state) => ({
      selectedIds: typeof ids === "function" ? ids(state.selectedIds) : ids,
    })),
  toggleSelection: (id, multi) =>
    set((state) => {
      const next = new Set(multi ? state.selectedIds : []);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { selectedIds: next };
    }),
  selectAll: (allIds) => set({ selectedIds: new Set(allIds) }),
  clearSelection: () => set({ selectedIds: new Set() }),
  setFocusedIndex: (index) =>
    set((state) => ({
      focusedIndex: typeof index === "function" ? index(state.focusedIndex) : index,
    })),
  setEditingId: (id) => set({ editingId: id }),
  setAssigningHotkeyId: (id) => set({ assigningHotkeyId: id }),
  setContextMenu: (menu) => set({ contextMenu: menu }),
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
  setDragOver: (over) => set({ dragOver: over }),
}));
