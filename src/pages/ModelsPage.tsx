import { useEffect, useState } from 'react'
import { useLMStudio } from '@/contexts/LMStudioContext'
import type { Model } from '@/types'
import './ModelsPage.css'

export default function ModelsPage() {
  const { api, isConfigured } = useLMStudio()
  const [models, setModels] = useState<Model[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [actionInProgress, setActionInProgress] = useState<string | null>(null)

  useEffect(() => {
    if (!isConfigured || !api) return
    loadModelsData()
  }, [isConfigured, api])

  const loadModelsData = async () => {
    if (!api) return
    setLoading(true)
    setError(null)
    try {
      const list = await api.listModels()
      setModels(list)
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败')
    } finally {
      setLoading(false)
    }
  }

  const handleLoadModel = async (model: Model) => {
    if (!api || actionInProgress) return
    if (!confirm(`确认加载模型 ${model.display_name}？`)) return

    setActionInProgress(model.key)
    setError(null)
    try {
      await api.loadModel(model.key)
      await loadModelsData()
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败')
    } finally {
      setActionInProgress(null)
    }
  }

  const handleUnloadModel = async (model: Model) => {
    if (!api || actionInProgress) return
    const instance = model.loaded_instances[0]
    if (!instance) return
    if (!confirm(`确认卸载模型 ${model.display_name}？`)) return

    setActionInProgress(model.key)
    setError(null)
    try {
      await api.unloadModel(instance.id)
      await loadModelsData()
    } catch (err) {
      setError(err instanceof Error ? err.message : '卸载失败')
    } finally {
      setActionInProgress(null)
    }
  }

  if (!isConfigured) {
    return (
      <div className="models-empty">
        <div className="models-empty-icon">⚙️</div>
        <h2 className="models-empty-title">还没有配置 LM Studio</h2>
        <p className="models-empty-desc">请先到设置页填写服务器地址，就可以查看模型了。</p>
      </div>
    )
  }

  const loadedModels = models.filter((m) => m.loaded_instances.length > 0)
  const llmModels = models.filter((m) => m.type === 'llm')
  const embeddingModels = models.filter((m) => m.type === 'embedding')

  return (
    <div className="models-page">
      {loadedModels.length > 0 && (
        <section className="card loaded-model-section">
          <h2 className="section-title">已加载的模型</h2>
          {loadedModels.map((model) => (
            <div key={model.key} className="loaded-model-card">
              <div className="model-info">
                <h3 className="model-name">{model.display_name}</h3>
                <p className="model-meta">
                  {model.params_string && `${model.params_string} · `}
                  上下文 {model.loaded_instances[0].config.context_length.toLocaleString()} tokens
                </p>
              </div>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={() => handleUnloadModel(model)}
                disabled={actionInProgress === model.key}
              >
                {actionInProgress === model.key ? <><span className="spinner" /> 卸载中…</> : '卸载'}
              </button>
            </div>
          ))}
        </section>
      )}

      {error && <div className="models-error">⚠️ {error}</div>}

      <section className="card available-models-section">
        <div className="section-header">
          <h2 className="section-title">可用模型</h2>
          {!loading && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={loadModelsData}>
              刷新
            </button>
          )}
        </div>

        {loading && (
          <div className="models-loading"><span className="spinner" /> 加载中…</div>
        )}

        {!loading && models.length === 0 && (
          <div className="models-empty-inline">
            <p>没有找到任何模型</p>
            <p className="text-secondary">请确保 LM Studio 服务器正在运行</p>
          </div>
        )}

        {!loading && llmModels.length > 0 && (
          <>
            <p className="model-type-label">语言模型</p>
            <div className="models-list">
              {llmModels.map((model) => {
                const isLoaded = model.loaded_instances.length > 0
                return (
                  <div key={model.key} className={`model-item${isLoaded ? ' model-item-loaded' : ''}`}>
                    <div className="model-info">
                      <h3 className="model-name">{model.display_name}</h3>
                      <p className="model-meta">
                        {model.publisher}
                        {model.params_string && ` · ${model.params_string}`}
                        {model.architecture && ` · ${model.architecture}`}
                        {` · ${formatBytes(model.size_bytes)}`}
                      </p>
                    </div>
                    {isLoaded ? (
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => handleUnloadModel(model)}
                        disabled={actionInProgress === model.key}
                      >
                        {actionInProgress === model.key ? <><span className="spinner" /> 卸载中…</> : '卸载'}
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => handleLoadModel(model)}
                        disabled={actionInProgress === model.key}
                      >
                        {actionInProgress === model.key ? <><span className="spinner" /> 加载中…</> : '加载'}
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </>
        )}

        {!loading && embeddingModels.length > 0 && (
          <>
            <p className="model-type-label" style={{ marginTop: 16 }}>嵌入模型</p>
            <div className="models-list">
              {embeddingModels.map((model) => (
                <div key={model.key} className="model-item">
                  <div className="model-info">
                    <h3 className="model-name">{model.display_name}</h3>
                    <p className="model-meta">{model.publisher} · {formatBytes(model.size_bytes)}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  )
}

function formatBytes(bytes: number) {
  if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(1)} GB`
  if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(0)} MB`
  return `${(bytes / 1e3).toFixed(0)} KB`
}
