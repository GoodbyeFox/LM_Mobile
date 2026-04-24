import axios, { AxiosInstance } from 'axios'
import type { ChatMessage, Model, LMStudioConfig, LoadedModel } from '@/types'

export class LMStudioApi {
  private client: AxiosInstance

  constructor(config: LMStudioConfig) {
    this.client = axios.create({
      baseURL: config.baseURL.replace(/\/$/, ''),
      timeout: 120000,
      headers: {
        'Content-Type': 'application/json',
        ...(config.apiKey ? { 'Authorization': `Bearer ${config.apiKey}` } : {}),
      },
    })
  }

  async chat(messages: ChatMessage[], model?: string) {
    const response = await this.client.post('/api/v1/chat', {
      messages,
      ...(model ? { model } : {}),
    })
    return response.data as {
      message: ChatMessage
      usage?: { promptTokens: number; completionTokens: number; totalTokens: number }
    }
  }

  async listModels(): Promise<Model[]> {
    const response = await this.client.get('/api/v1/models')
    const data = response.data
    if (Array.isArray(data)) {
      return data
    }
    return data.models ?? data.data ?? []
  }

  async getLoadedModel(): Promise<LoadedModel | null> {
    try {
      const response = await this.client.get('/api/v1/status')
      return response.data.loaded_model ?? null
    } catch {
      return null
    }
  }

  async loadModel(id: string) {
    await this.client.post('/api/v1/models/load', { id })
  }

  async unloadModel(id?: string) {
    await this.client.post('/api/v1/models/unload', id ? { id } : {})
  }

  async testConnection(): Promise<{ ok: true } | { ok: false; error: string }> {
    try {
      await this.client.get('/api/v1/models')
      return { ok: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      return { ok: false, error: message }
    }
  }
}
