import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { useLMStudio } from '@/contexts/LMStudioContext'
import { storage } from '@/services/storage'
import type { Message, Model, OutputItem } from '@/types'
import './ChatPage.css'

export default function ChatPage() {
  const { api, isConfigured } = useLMStudio()
  const [messages, setMessages] = useState<Message[]>(() => storage.getChatHistory())
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [models, setModels] = useState<Model[]>([])
  const [selectedModel, setSelectedModel] = useState<string>('')
  const [responseId, setResponseId] = useState<string | undefined>(undefined)
  const [images, setImages] = useState<string[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    storage.saveChatHistory(messages)
  }, [messages])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, sending])

  useEffect(() => {
    if (!api) return
    api.listModels().then((list) => {
      const llms = list.filter((m) => m.type === 'llm')
      setModels(llms)
      if (llms.length > 0 && !selectedModel) {
        const loaded = llms.find((m) => m.loaded_instances.length > 0)
        setSelectedModel(loaded?.key ?? llms[0].key)
      }
    }).catch(() => {})
  }, [api])

  const autoResize = (el: HTMLTextAreaElement) => {
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 160) + 'px'
  }

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files
    if (!files) return

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const reader = new FileReader()
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string
        setImages((prev) => [...prev, dataUrl])
      }
      reader.readAsDataURL(file)
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSend = async () => {
    const text = input.trim()
    if ((!text && images.length === 0) || !api || sending || !selectedModel) return

    const userMessage: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text || '(图片)',
      timestamp: Date.now(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setImages([])
    setError(null)
    setSending(true)
    if (textareaRef.current) textareaRef.current.style.height = 'auto'

    try {
      const chatInput =
        images.length > 0
          ? [
              { type: 'text', content: text || '' },
              ...images.map((img) => ({ type: 'image', data_url: img })),
            ]
          : text

      const response = await api.chat(chatInput, selectedModel, responseId)
      const messageItem = response.output.find((o) => o.type === 'message')
      const assistantMessage: Message = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: messageItem?.content ?? '',
        timestamp: Date.now(),
        responseId: response.response_id,
        outputItems: response.output,
      }
      setResponseId(response.response_id)
      setMessages((prev) => [...prev, assistantMessage])
    } catch (err) {
      setError(err instanceof Error ? err.message : '发送失败')
      setMessages((prev) => prev.filter((m) => m.id !== userMessage.id))
      setInput(text)
      setImages([])
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleClear = () => {
    if (messages.length === 0) return
    if (!confirm('确认清除当前对话？')) return
    setMessages([])
    setResponseId(undefined)
    setError(null)
  }

  if (!isConfigured) {
    return (
      <div className="chat-empty">
        <div className="chat-empty-icon">⚙️</div>
        <h2 className="chat-empty-title">还没有配置 LM Studio</h2>
        <p className="chat-empty-desc">请先到设置页填写服务器地址，就可以开始对话了。</p>
        <Link to="/settings" className="btn btn-primary">
          前往设置
        </Link>
      </div>
    )
  }

  return (
    <div className="chat-page">
      <div className="chat-toolbar">
        <div className="chat-toolbar-info">
          <span className="chat-toolbar-dot" />
          <span>{messages.length > 0 ? `${messages.length} 条消息` : '开始新对话'}</span>
        </div>
        <div className="chat-toolbar-right">
          {models.length > 0 && (
            <select
              className="model-select"
              value={selectedModel}
              onChange={(e) => {
                setSelectedModel(e.target.value)
                setResponseId(undefined)
              }}
            >
              {models.map((m) => (
                <option key={m.key} value={m.key}>
                  {m.loaded_instances.length > 0 ? '● ' : '○ '}{m.display_name}
                </option>
              ))}
            </select>
          )}
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={handleClear}
            disabled={messages.length === 0}
          >
            清空
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="chat-messages">
        {messages.length === 0 && !sending && (
          <div className="chat-intro">
            <div className="chat-intro-icon">✨</div>
            <h3>你好！</h3>
            <p>我已经连接到你的 LM Studio 服务器，问我任何问题吧。</p>
          </div>
        )}

        {messages.map((m) => (
          <MessageBubble key={m.id} role={m.role} content={m.content} outputItems={m.outputItems} />
        ))}

        {sending && (
          <div className="message-row message-assistant">
            <div className="message-bubble message-bubble-assistant typing-bubble">
              <TypingDots />
            </div>
          </div>
        )}
      </div>

      {error && <div className="chat-error">⚠️ {error}</div>}

      {images.length > 0 && (
        <div className="chat-image-preview">
          {images.map((img, idx) => (
            <div key={idx} className="image-preview-item">
              <img src={img} alt={`preview-${idx}`} />
              <button type="button" className="btn-remove-image" onClick={() => removeImage(idx)}>
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="chat-input-bar">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="chat-file-input"
          onChange={handleImageSelect}
          disabled={sending}
        />
        <button
          type="button"
          className="btn btn-ghost btn-sm chat-attach-btn"
          onClick={() => fileInputRef.current?.click()}
          disabled={sending}
          aria-label="添加图片"
        >
          📎
        </button>
        <textarea
          ref={textareaRef}
          className="chat-input"
          placeholder={selectedModel ? '输入消息，Enter 发送，Shift+Enter 换行' : '请先到模型页面加载一个模型'}
          rows={1}
          value={input}
          onChange={(e) => {
            setInput(e.target.value)
            autoResize(e.target)
          }}
          onKeyDown={handleKeyDown}
          disabled={sending || !selectedModel}
        />
        <button
          type="button"
          className="btn btn-primary chat-send"
          onClick={handleSend}
          disabled={(!input.trim() && images.length === 0) || sending || !selectedModel}
          aria-label="发送"
        >
          {sending ? <span className="spinner" /> : <SendIcon />}
        </button>
      </div>
    </div>
  )
}

function MessageBubble({
  role,
  content,
  outputItems,
}: {
  role: 'user' | 'assistant'
  content: string
  outputItems?: OutputItem[]
}) {
  return (
    <div className={`message-row message-${role}`}>
      <div className={`message-bubble message-bubble-${role}`}>
        {role === 'assistant' && outputItems ? (
          <>
            {outputItems.map((item, idx) => {
              if (item.type === 'message') {
                return (
                  <ReactMarkdown key={idx} remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                    {item.content}
                  </ReactMarkdown>
                )
              }
              if (item.type === 'tool_call') {
                return (
                  <div key={idx} className="tool-call-block">
                    <div className="tool-call-header">🔧 Tool Call: {item.name}</div>
                    <pre className="tool-call-args">{item.arguments}</pre>
                  </div>
                )
              }
              if (item.type === 'tool_output') {
                return (
                  <div key={idx} className="tool-output-block">
                    <div className="tool-output-header">✓ Tool Output</div>
                    <div className="tool-output-content">{item.content}</div>
                  </div>
                )
              }
              return null
            })}
          </>
        ) : (
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
            {content}
          </ReactMarkdown>
        )}
      </div>
    </div>
  )
}

function TypingDots() {
  return (
    <span className="typing-dots" aria-label="正在思考">
      <span />
      <span />
      <span />
    </span>
  )
}

function SendIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  )
}
