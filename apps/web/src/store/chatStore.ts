import { create } from "zustand";

type ChatStore = {
  selectedChatId: string | null;
  setSelectedChatId: (id: string | null) => void;
  pendingPrompt: string | null;
  setPendingPrompt: (prompt: string | null) => void;
  pendingChatId: string | null;
  setPendingChatId: (id: string | null) => void;
  clearPending: () => void;
};

export const useChatStore = create<ChatStore>((set) => ({
  selectedChatId: null,
  setSelectedChatId: (id) => set({ selectedChatId: id }),
  pendingPrompt: null,
  setPendingPrompt: (prompt) => set({ pendingPrompt: prompt }),
  pendingChatId: null,
  setPendingChatId: (id) => set({ pendingChatId: id }),
  clearPending: () => set({ pendingPrompt: null, pendingChatId: null }),
}));
