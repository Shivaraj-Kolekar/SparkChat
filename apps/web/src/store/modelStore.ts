import { create } from "zustand";
import { persist } from "zustand/middleware";

type Model = {
  selectedModel: string | null;
  setSelectedModel: (model: string | null) => void;
};

export const useModelStore = create<Model>()(
  persist(
    (set) => ({
      selectedModel: "llama-3.1-8b-instant",
      setSelectedModel: (model) => set({ selectedModel: model }),
    }),
    {
      name: "model-store",
    },
  ),
);
