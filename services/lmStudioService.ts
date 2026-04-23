import axios, { AxiosInstance } from 'axios';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface ChatResponse {
  message: ChatMessage;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface Model {
  id: string;
  name: string;
  type: string;
  parameters?: {
    temperature?: number;
    contextLength?: number;
  };
}

export interface LoadedModel {
  id: string;
  type: string;
}

export class LMStudioService {
  private client: AxiosInstance;
  private baseURL: string;
  private apiKey?: string;

  constructor(baseURL: string, apiKey?: string) {
    this.baseURL = baseURL;
    this.apiKey = apiKey;
    this.client = axios.create({
      baseURL: baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey && { 'X-API-Key': apiKey }),
      },
    });
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    const response = await this.client.post('/api/v1/chat', request);
    return response.data;
  }

  async *chatStream(request: ChatRequest) {
    const response = await this.client.post('/api/v1/chat',
      { ...request, stream: true },
      { responseType: 'stream' }
    );

    for await (const chunk of response.data) {
      const lines = chunk.toString().split('\n');
      for (const line of lines) {
        if (line.trim() && line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            yield data;
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    }
  }

  async listModels(): Promise<Model[]> {
    const response = await this.client.get('/api/v1/models');
    return response.data.models || response.data;
  }

  async getLoadedModel(): Promise<LoadedModel | null> {
    const response = await this.client.get('/api/v1/models');
    return response.data.loaded || null;
  }

  async loadModel(modelId: string): Promise<void> {
    await this.client.post('/api/v1/models/load', { id: modelId });
  }

  async unloadModel(): Promise<void> {
    await this.client.post('/api/v1/models/unload', {});
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.listModels();
      return true;
    } catch (error) {
      return false;
    }
  }
}

let instance: LMStudioService | null = null;

export function initLMStudioService(baseURL: string, apiKey?: string): LMStudioService {
  instance = new LMStudioService(baseURL, apiKey);
  return instance;
}

export function getLMStudioService(): LMStudioService | null {
  return instance;
}
