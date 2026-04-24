import { useState, useEffect } from 'react'
import { useLMStudio } from '@/contexts/LMStudioContext'
import { LMStudioApi } from '@/services/lmStudioApi'
import { storage } from '@/services/storage'
import './SettingsPage.css'

type TestStatus = 'idle' | 'testing' | 'success' | 'error'

export default function SettingsPage() {
  const { config, isConfigured, setConfig, clearConfig } = useLMStudio()
  const [baseURL, setBaseURL] = useState('http://localhost:1234')
  const [apiKey, setApiKey] = useState('')
  const [showApiKey, setShowApiKey] = useState(false)
  const [testStatus, setTestStatus] = useState<TestStatus>('idle')
  const [testMessage, setTestMessage] = useState('')

  useEffect(() => {
    if (config) {
      setBaseURL(config.baseURL)
      setApiKey(config.apiKey ?? '')
    }
  }, [config])

  const handleTest = async () => {
    const url = baseURL.trim()
    if (!url) {
      setTestStatus('error')
      setTestMessage('请输入服务器地址')
      return
    }
    setTestStatus('testing')
    setTestMessage('')
    const api = new LMStudioApi({ baseURL: url, apiKey: apiKey.trim() || undefined })
    const result = await api.testConnection()
    if (result.ok) {
      setTestStatus('success')
      setTestMessage('连接成功')
    } else {
      setTestStatus('error')
      setTestMessage(result.error || '连接失败')
    }
  }

  const handleSave = () => {
    const url = baseURL.trim()
    if (!url) {
      setTestStatus('error')
      setTestMessage('请输入服务器地址')
      return
    }
    setConfig({ baseURL: url, apiKey: apiKey.trim() || undefined })
    setTestStatus('success')
    setTestMessage('配置已保存')
  }

  const handleClear = () => {
    if (!confirm('确认清除当前配置？')) return
    clearConfig()
    setBaseURL('http://localhost:1234')
    setApiKey('')
    setTestStatus('idle')
    setTestMessage('')
  }

  const handleClearHistory = () => {
    if (!confirm('确认清除所有聊天历史？')) return
    storage.clearChatHistory()
    alert('聊天历史已清除')
  }

  return (
    <div className="settings-page">
      <section className="card">
        <h2 className="section-title">LM Studio 服务器</h2>
        <p className="section-desc">
          配置你的 LM Studio 服务器地址，本地运行时通常是 <code>http://localhost:1234</code>。
        </p>

        <div className="form-group">
          <label className="form-label" htmlFor="baseURL">
            服务器地址
          </label>
          <input
            id="baseURL"
            className="form-input"
            type="url"
            inputMode="url"
            autoComplete="off"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            placeholder="http://localhost:1234"
            value={baseURL}
            onChange={(e) => setBaseURL(e.target.value)}
          />
          <p className="form-hint">也可以是局域网或远程地址，例如 http://192.168.1.100:1234</p>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="apiKey">
            API Key <span className="optional-tag">可选</span>
          </label>
          <div className="input-with-action">
            <input
              id="apiKey"
              className="form-input"
              type={showApiKey ? 'text' : 'password'}
              autoComplete="off"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              placeholder="如果服务器开启了鉴权请填写"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowApiKey((s) => !s)}
            >
              {showApiKey ? '隐藏' : '显示'}
            </button>
          </div>
        </div>

        {testStatus !== 'idle' && (
          <div className={`test-result test-${testStatus}`}>
            {testStatus === 'testing' && (
              <>
                <span className="spinner" /> 正在测试…
              </>
            )}
            {testStatus === 'success' && <>✓ {testMessage}</>}
            {testStatus === 'error' && <>✗ {testMessage}</>}
          </div>
        )}

        <div className="action-row">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleTest}
            disabled={testStatus === 'testing'}
          >
            测试连接
          </button>
          <button type="button" className="btn btn-primary" onClick={handleSave}>
            保存配置
          </button>
        </div>
      </section>

      {isConfigured && (
        <section className="card">
          <h2 className="section-title">数据管理</h2>
          <p className="section-desc">所有数据都保存在你的浏览器本地，不会上传到任何服务器。</p>
          <div className="action-row">
            <button type="button" className="btn btn-secondary" onClick={handleClearHistory}>
              清除聊天历史
            </button>
            <button type="button" className="btn btn-danger" onClick={handleClear}>
              清除服务器配置
            </button>
          </div>
        </section>
      )}

      <section className="card about-card">
        <h2 className="section-title">关于</h2>
        <ul className="about-list">
          <li>
            <strong>LM Studio Mobile</strong> v1.0.0
          </li>
          <li>基于 React + Vite + TypeScript</li>
          <li>
            <a
              href="https://lmstudio.ai/docs/api/rest-api"
              target="_blank"
              rel="noopener noreferrer"
            >
              LM Studio REST API 文档
            </a>
          </li>
        </ul>
      </section>
    </div>
  )
}
