import { create } from "zustand";
import { persist } from "zustand/middleware";

type ChatStore = {
  selectedChatId: string | null;
  setSelectedChatId: (id: string | null) => void;
  clearSelectedChatId: () => void;
  pendingPrompt: string | null;
  setPendingPrompt: (prompt: string | null) => void;
  pendingChatId: string | null;
  setPendingChatId: (id: string | null) => void;
  clearPending: () => void;
};

export const useChatStore = create<ChatStore>()(
  persist(
    (set) => ({
      selectedChatId: null,
      setSelectedChatId: (id) => set({ selectedChatId: id }),
      clearSelectedChatId: () => set({ selectedChatId: null }),
      pendingPrompt: null,
      setPendingPrompt: (prompt) => set({ pendingPrompt: prompt }),
      pendingChatId: null,
      setPendingChatId: (id) => set({ pendingChatId: id }),
      clearPending: () => set({ pendingPrompt: null, pendingChatId: null }),
    }),
    {
      name: "chat-store", // unique name in storage
      partialize: (state) => ({
        selectedChatId: state.selectedChatId,
        // Optionally persist other keys if needed
      }),
    }
  )
);