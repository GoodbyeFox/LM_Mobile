export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export interface Model {
  id: string
  name?: string
  type?: string
  parameters?: {
    contextLength?: number
    temperature?: number
  }
}

export interface LMStudioConfig {
  baseURL: string
  apiKey?: string
  defaultModel?: string
}

export interface LoadedModel {
  id: string
  type?: string
}
