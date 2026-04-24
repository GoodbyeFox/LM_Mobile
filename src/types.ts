export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  responseId?: string
}

export interface LoadedInstance {
  id: string
  config: { context_length: number }
}

export interface Model {
  key: string
  display_name: string
  type: 'llm' | 'embedding'
  publisher: string
  architecture?: string | null
  size_bytes: number
  params_string?: string | null
  loaded_instances: LoadedInstance[]
  max_context_length: number
  format?: string | null
  capabilities?: {
    vision: boolean
    trained_for_tool_use: boolean
  }
}

export interface LMStudioConfig {
  baseURL: string
  apiKey?: string
}

export interface ChatResponse {
  output: Array<{ type: string; content: string }>
  response_id?: string
  stats?: {
    input_tokens: number
    total_output_tokens: number
    tokens_per_second: number
  }
}
