import { create } from "zustand";

type Model = {
  selectedModel: string | null;
  setSelectedModel: (model: string | null) => void;
};

export const useModelStore = create<Model>((set) => ({
  selectedModel: "gemini-2.0-flash",
  setSelectedModel: (model) => set({ selectedModel: model }),
}));
