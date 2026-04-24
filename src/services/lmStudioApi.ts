import axios, { AxiosInstance } from 'axios'
import type { ChatResponse, Model, LMStudioConfig } from '@/types'

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

  async chat(input: string, model: string, previousResponseId?: string): Promise<ChatResponse> {
    const response = await this.client.post('/api/v1/chat', {
      model,
      input,
      ...(previousResponseId ? { previous_response_id: previousResponseId } : {}),
    })
    return response.data as ChatResponse
  }

  async listModels(): Promise<Model[]> {
    const response = await this.client.get('/api/v1/models')
    const data = response.data
    return data.models ?? []
  }

  async loadModel(modelKey: string): Promise<{ instance_id: string }> {
    const response = await this.client.post('/api/v1/models/load', { model: modelKey })
    return response.data
  }

  async unloadModel(instanceId: string): Promise<void> {
    await this.client.post('/api/v1/models/unload', { instance_id: instanceId })
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
