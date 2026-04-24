import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLMStudio } from '@/contexts/LMStudioContext'
import { storage } from '@/services/storage'
import type { ChatMessage, Message } from '@/types'
import './ChatPage.css'

export default function ChatPage() {
  const { api, isConfigured, config } = useLMStudio()
  const [messages, setMessages] = useState<Message[]>(() => storage.getChatHistory())
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    storage.saveChatHistory(messages)
  }, [messages])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, sending])

  const historyForApi = useMemo<ChatMessage[]>(
    () => messages.map((m) => ({ role: m.role, content: m.content })),
    [messages],
  )

  const autoResize = (el: HTMLTextAreaElement) => {
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 160) + 'px'
  }

  const handleSend = async () => {
    const text = input.trim()
    if (!text || !api || sending) return

    const userMessage: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setError(null)
    setSending(true)
    if (textareaRef.current) textareaRef.current.style.height = 'auto'

    try {
      const response = await api.chat([...historyForApi, { role: 'user', content: text }], config?.defaultModel)
      const assistantMessage: Message = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: response.message.content,
        timestamp: Date.now(),
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (err) {
      setError(err instanceof Error ? err.message : '发送失败')
      // 发送失败时回滚用户消息
      setMessages((prev) => prev.filter((m) => m.id !== userMessage.id))
      setInput(text)
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
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={handleClear}
          disabled={messages.length === 0}
        >
          清空对话
        </button>
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
          <MessageBubble key={m.id} role={m.role} content={m.content} />
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

      <div className="chat-input-bar">
        <textarea
          ref={textareaRef}
          className="chat-input"
          placeholder="输入消息，Enter 发送，Shift+Enter 换行"
          rows={1}
          value={input}
          onChange={(e) => {
            setInput(e.target.value)
            autoResize(e.target)
          }}
          onKeyDown={handleKeyDown}
          disabled={sending}
        />
        <button
          type="button"
          className="btn btn-primary chat-send"
          onClick={handleSend}
          disabled={!input.trim() || sending}
          aria-label="发送"
        >
          {sending ? <span className="spinner" /> : <SendIcon />}
        </button>
      </div>
    </div>
  )
}

function MessageBubble({ role, content }: { role: 'user' | 'assistant'; content: string }) {
  return (
    <div className={`message-row message-${role}`}>
      <div className={`message-bubble message-bubble-${role}`}>
        {content.split('\n').map((line, i) => (
          <p key={i}>{line || ' '}</p>
        ))}
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
