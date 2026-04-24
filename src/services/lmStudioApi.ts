import axios, { AxiosInstance } from 'axios'
import type { Model, LMStudioConfig } from '@/types'

export class LMStudioApi {
  private client: AxiosInstance
  private baseURL: string
  private apiKey?: string

  constructor(config: LMStudioConfig) {
    this.baseURL = config.baseURL.replace(/\/$/, '')
    this.apiKey = config.apiKey
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 120000,
      headers: {
        'Content-Type': 'application/json',
        ...(config.apiKey ? { 'Authorization': `Bearer ${config.apiKey}` } : {}),
      },
    })
  }

  async streamChat(
    input: string | Array<{ type: string; [key: string]: unknown }>,
    model: string,
    previousResponseId: string | undefined,
    onChunk: (text: string, type?: 'text' | 'reasoning') => void,
    signal?: AbortSignal
  ): Promise<{ responseId?: string }> {
    const response = await fetch(`${this.baseURL}/api/v1/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.apiKey ? { Authorization: `Bearer ${this.apiKey}` } : {}),
      },
      body: JSON.stringify({
        model,
        input,
        stream: true,
        ...(previousResponseId ? { previous_response_id: previousResponseId } : {}),
      }),
      signal,
    })

    if (!response.ok) {
      let errMsg = response.statusText
      try {
        const errData = await response.json()
        errMsg = errData?.error?.message ?? errMsg
      } catch {}
      throw new Error(errMsg)
    }

    if (!response.body) throw new Error('Response has no body')

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let responseId: string | undefined

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed.startsWith('data:')) continue
          const data = trimmed.slice(5).trim()
          if (data === '[DONE]') continue

          try {
            const event = JSON.parse(data)

            // LM Studio native streaming format
            if (event.type === 'text.delta' && typeof event.content === 'string') {
              onChunk(event.content, 'text')
            } else if (event.type === 'reasoning.delta' && typeof event.content === 'string') {
              onChunk(event.content, 'reasoning')
            } else if (event.type === 'chat.end') {
              if (event.response_id) responseId = event.response_id
            }
          } catch {}
        }
      }
    } finally {
      reader.releaseLock()
    }

    return { responseId }
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
