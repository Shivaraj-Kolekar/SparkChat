import { create } from "zustand";
import { persist } from "zustand/middleware";

type ThemeStore = {
  baseTheme: "amethyst" | "graphite" | "t3" | "tangerine" | "vercel" | "claude" | "mono";
  mode: "light" | "dark" | "system";
  setBaseTheme: (theme: "amethyst" | "graphite" | "t3" | "tangerine" | "vercel" | "claude" | "mono") => void;
  setMode: (mode: "light" | "dark" | "system") => void;
};

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      baseTheme: "amethyst",
      mode: "light",
      setBaseTheme: (baseTheme) => set({ baseTheme }),
      setMode: (mode) => set({ mode }),
    }),
    {
      name: "theme-store", // key in localStorage
    }
  )
);
