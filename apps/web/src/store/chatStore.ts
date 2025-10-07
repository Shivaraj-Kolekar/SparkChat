import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type ChatStore = {
  selectedChatId: string | null;
  setSelectedChatId: (id: string | null) => void;
  clearSelectedChatId: () => void;
  pendingPrompt: string | null;
  setPendingPrompt: (prompt: string | null) => void;
  pendingChatId: string | null;
  setPendingChatId: (id: string | null) => void;
  clearPending: () => void;
  clearStore: () => void;
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
      clearStore: () => {
        set({
          selectedChatId: null,
          pendingPrompt: null,
          pendingChatId: null,
        });
        localStorage.removeItem("chat-store"); // Clear the persisted data
      },
    }),
    {
      name: "chat-store", // unique name in storage
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        selectedChatId: state.selectedChatId,
        pendingPrompt: state.pendingPrompt,
        pendingChatId: state.pendingChatId,
      }),
    }
  )
);

// Clear the store on window beforeunload
window.addEventListener("beforeunload", () => {
  useChatStore.getState().clearStore();
});
