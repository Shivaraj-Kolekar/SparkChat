import { create } from 'zustand';

interface AiLoadingState {
  aiLoading: boolean;
  setAiLoading: (loading: boolean) => void;
}

export const useAiLoadingStore = create<AiLoadingState>((set) => ({
  aiLoading: false,
  setAiLoading: (loading) => set({ aiLoading: loading }),
}));
