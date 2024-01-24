enum MessageRole {
  USER = 'user',
  SYSTEM = 'system',
  ASSISTANT = 'assistant'
}

interface RequestMessage {
  role: `${MessageRole}`
  content: string
}

interface ChatMessage extends RequestMessage {
  date: string
  isStreaming?: boolean
  isError?: boolean
  id: string
  serverSideId?: string
}

interface ChatStat {
  tokenCount: number
  wordCount: number
  charCount: number
}

interface ChatSession {
  id: string
  topic: string
  memoryPrompt: string
  messages: ChatMessage[]
  lastUpdate: number
  clearContextIndex?: number
}

export { MessageRole }
export type { ChatMessage, ChatSession, ChatStat, RequestMessage }
