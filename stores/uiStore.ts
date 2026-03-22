import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIState {
  isPanelOpen: boolean;
  setPanelOpen: (open: boolean) => void;
  activeTab: "detail" | "accommodation" | "food";
  setActiveTab: (tab: "detail" | "accommodation" | "food") => void;
  language: "EN" | "KH";
  setLanguage: (lang: "EN" | "KH") => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      isPanelOpen: false,
      setPanelOpen: (open) => set({ isPanelOpen: open }),
      activeTab: "detail",
      setActiveTab: (tab) => set({ activeTab: tab }),
      language: "EN",
      setLanguage: (lang) => set({ language: lang }),
    }),
    {
      name: "lomhea-ui-store",
      partialize: (state) => ({ language: state.language }),
    },
  ),
);
