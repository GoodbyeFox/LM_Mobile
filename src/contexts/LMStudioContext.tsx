import { createContext, useContext, useMemo, useState, ReactNode, useCallback } from 'react'
import { LMStudioApi } from '@/services/lmStudioApi'
import { storage } from '@/services/storage'
import type { LMStudioConfig } from '@/types'

interface LMStudioContextValue {
  config: LMStudioConfig | null
  api: LMStudioApi | null
  isConfigured: boolean
  setConfig: (config: LMStudioConfig) => void
  clearConfig: () => void
}

const LMStudioContext = createContext<LMStudioContextValue | undefined>(undefined)

export function LMStudioProvider({ children }: { children: ReactNode }) {
  const [config, setConfigState] = useState<LMStudioConfig | null>(() => storage.getConfig())

  const api = useMemo(() => (config ? new LMStudioApi(config) : null), [config])

  const setConfig = useCallback((newConfig: LMStudioConfig) => {
    storage.saveConfig(newConfig)
    setConfigState(newConfig)
  }, [])

  const clearConfig = useCallback(() => {
    storage.clearConfig()
    setConfigState(null)
  }, [])

  const value = useMemo<LMStudioContextValue>(
    () => ({
      config,
      api,
      isConfigured: !!config,
      setConfig,
      clearConfig,
    }),
    [config, api, setConfig, clearConfig],
  )

  return <LMStudioContext.Provider value={value}>{children}</LMStudioContext.Provider>
}

export function useLMStudio() {
  const ctx = useContext(LMStudioContext)
  if (!ctx) throw new Error('useLMStudio must be used within LMStudioProvider')
  return ctx
}
