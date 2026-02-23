import { create } from "zustand";
import { persist } from "zustand/middleware";

type Model = {
  selectedModel: string | null;
  setSelectedModel: (model: string | null) => void;
};

export const useModelStore = create<Model>()(
  persist(
    (set) => ({
      selectedModel: "gemini-2.5-flash",
      setSelectedModel: (model) => set({ selectedModel: model }),
    }),
    {
      name: "model-store",
    },
  ),
);
