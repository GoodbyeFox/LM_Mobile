import { useEffect, useState } from 'react'
import { useLMStudio } from '@/contexts/LMStudioContext'
import type { LoadedModel, Model } from '@/types'
import './ModelsPage.css'

export default function ModelsPage() {
  const { api, isConfigured } = useLMStudio()
  const [models, setModels] = useState<Model[]>([])
  const [loadedModel, setLoadedModel] = useState<LoadedModel | null>(null)
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
      const [modelsList, loaded] = await Promise.all([
        api.listModels(),
        api.getLoadedModel(),
      ])
      setModels(modelsList)
      setLoadedModel(loaded)
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败')
    } finally {
      setLoading(false)
    }
  }

  const handleLoadModel = async (model: Model) => {
    if (!api || actionInProgress) return
    if (!confirm(`确认加载模型 ${model.id}？`)) return

    setActionInProgress(model.id)
    setError(null)
    try {
      await api.loadModel(model.id)
      setLoadedModel(model as LoadedModel)
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败')
    } finally {
      setActionInProgress(null)
    }
  }

  const handleUnloadModel = async () => {
    if (!api || !loadedModel || actionInProgress) return
    if (!confirm('确认卸载当前模型？')) return

    setActionInProgress(loadedModel.id)
    setError(null)
    try {
      await api.unloadModel()
      setLoadedModel(null)
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

  return (
    <div className="models-page">
      {loadedModel && (
        <section className="card loaded-model-section">
          <h2 className="section-title">当前加载的模型</h2>
          <div className="loaded-model-card">
            <div className="model-info">
              <h3 className="model-name">{loadedModel.id}</h3>
              <p className="model-meta">已加载</p>
            </div>
            <button
              type="button"
              className="btn btn-danger btn-sm"
              onClick={handleUnloadModel}
              disabled={actionInProgress === loadedModel.id}
            >
              {actionInProgress === loadedModel.id ? (
                <>
                  <span className="spinner" /> 卸载中…
                </>
              ) : (
                '卸载'
              )}
            </button>
          </div>
        </section>
      )}

      <section className="card available-models-section">
        <div className="section-header">
          <h2 className="section-title">可用的模型</h2>
          {models.length > 0 && !loading && (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={loadModelsData}
              disabled={loading}
            >
              刷新
            </button>
          )}
        </div>

        {error && <div className="models-error">⚠️ {error}</div>}

        {loading && (
          <div className="models-loading">
            <span className="spinner" /> 加载中…
          </div>
        )}

        {!loading && models.length === 0 && (
          <div className="models-empty-inline">
            <p>没有找到任何模型</p>
            <p className="text-secondary">请确保 LM Studio 服务器正在运行</p>
          </div>
        )}

        {!loading && models.length > 0 && (
          <div className="models-list">
            {models.map((model) => (
              <div key={model.id} className="model-item">
                <div className="model-info">
                  <h3 className="model-name">{model.id}</h3>
                  {model.type && (
                    <p className="model-meta">类型: {model.type}</p>
                  )}
                </div>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => handleLoadModel(model)}
                  disabled={actionInProgress === model.id || loadedModel?.id === model.id}
                >
                  {actionInProgress === model.id ? (
                    <>
                      <span className="spinner" /> 加载中…
                    </>
                  ) : loadedModel?.id === model.id ? (
                    '已加载'
                  ) : (
                    '加载'
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
