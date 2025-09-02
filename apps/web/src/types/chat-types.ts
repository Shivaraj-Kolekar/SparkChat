export type ChatType = {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
};

// Chat grouping types for sidebar sections
export type ChatGroupType = {
  todayChats: ChatType[];
  last30Chats: ChatType[];
  historyChats: ChatType[];
};

export type MessageType = {
  id?: number; // Auto-incremented in DB, so optional for insert
  chatId: string;
  role: "user" | "assistant";
  model: string;
  content: string;
  timestamp: number; // Unix timestamp
  sources?: { url: string; title?: string }[]; // Always present, even if empty
};
export type FileType = {
  url: string;
  fileName: string;
  fileType: string;
  error: string;
};
export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};
