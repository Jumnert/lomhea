import { create } from "zustand";

interface UIState {
  isPanelOpen: boolean;
  setPanelOpen: (open: boolean) => void;
  activeTab: "detail" | "accommodation" | "food";
  setActiveTab: (tab: "detail" | "accommodation" | "food") => void;
}

export const useUIStore = create<UIState>((set) => ({
  isPanelOpen: false,
  setPanelOpen: (open) => set({ isPanelOpen: open }),
  activeTab: "detail",
  setActiveTab: (tab) => set({ activeTab: tab }),
}));
