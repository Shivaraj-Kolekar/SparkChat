"use client";

import React, { useContext, useState, useEffect } from "react";
import axios from "axios";
import type { ChatType } from "@/types/chat-types";
import { createContext } from "react";

interface ChatContextType {
  chats: ChatType[];
  loadingChats: boolean;
  errorChats: string | null;
  refreshChats: () => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [chats, setChats] = useState<ChatType[]>([]);
  const [loadingChats, setLoadingChats] = useState(true);
  const [errorChats, setErrorChats] = useState<string | null>(null);

  const refreshChats = async () => {
    try {
      setLoadingChats(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/chat`,
        { withCredentials: true }
      );
      if (response.data.success && Array.isArray(response.data.result)) {
        setChats(response.data.result);
      }
    } catch (error) {
      console.error("Error fetching chats:", error);
      setErrorChats("Failed to load chats");
    } finally {
      setLoadingChats(false);
    }
  };

  // Refresh chats every 2 seconds if there's a new chat
  useEffect(() => {
    const interval = setInterval(refreshChats, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <ChatContext.Provider
      value={{ chats, loadingChats, errorChats, refreshChats }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
}
