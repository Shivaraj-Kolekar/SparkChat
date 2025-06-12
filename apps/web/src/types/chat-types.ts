export type ChatType = {
  id: string
  title: string
  createdAt: number
  updatedAt: number
}

export type MessageType = {
  id?: number // Auto-incremented in DB, so optional for insert
  chatId: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number // Unix timestamp
}

export type ApiResponse<T> = {
  success: boolean
  data?: T
  error?: string
}
