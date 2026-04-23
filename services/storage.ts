import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LMStudioConfig {
  baseURL: string;
  apiKey?: string;
}

const CONFIG_KEY = 'lm_studio_config';
const CHAT_HISTORY_KEY = 'chat_history';

export const storage = {
  async saveConfig(config: LMStudioConfig): Promise<void> {
    await AsyncStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  },

  async getConfig(): Promise<LMStudioConfig | null> {
    const data = await AsyncStorage.getItem(CONFIG_KEY);
    return data ? JSON.parse(data) : null;
  },

  async clearConfig(): Promise<void> {
    await AsyncStorage.removeItem(CONFIG_KEY);
  },

  async saveChatHistory(messages: any[]): Promise<void> {
    await AsyncStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
  },

  async getChatHistory(): Promise<any[]> {
    const data = await AsyncStorage.getItem(CHAT_HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  },

  async clearChatHistory(): Promise<void> {
    await AsyncStorage.removeItem(CHAT_HISTORY_KEY);
  },
};
