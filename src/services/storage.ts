import type { LMStudioConfig, Message } from '@/types'

const CONFIG_KEY = 'lm_studio_config'
const CHAT_HISTORY_KEY = 'lm_studio_chat_history'

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export const storage = {
  getConfig(): LMStudioConfig | null {
    return safeParse<LMStudioConfig>(localStorage.getItem(CONFIG_KEY))
  },

  saveConfig(config: LMStudioConfig): void {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config))
  },

  clearConfig(): void {
    localStorage.removeItem(CONFIG_KEY)
  },

  getChatHistory(): Message[] {
    return safeParse<Message[]>(localStorage.getItem(CHAT_HISTORY_KEY)) ?? []
  },

  saveChatHistory(messages: Message[]): void {
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages))
  },

  clearChatHistory(): void {
    localStorage.removeItem(CHAT_HISTORY_KEY)
  },
}
