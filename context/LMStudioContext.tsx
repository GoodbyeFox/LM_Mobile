import React, { createContext, useContext, useEffect, useState } from 'react';
import { initLMStudioService, LMStudioService } from '@/services/lmStudioService';
import { storage, LMStudioConfig } from '@/services/storage';

interface LMStudioContextType {
  config: LMStudioConfig | null;
  service: LMStudioService | null;
  isConfigured: boolean;
  isLoading: boolean;
  error: string | null;
  setConfig: (config: LMStudioConfig) => Promise<void>;
  testConnection: () => Promise<boolean>;
  clearConfig: () => Promise<void>;
}

const LMStudioContext = createContext<LMStudioContextType | undefined>(undefined);

export function LMStudioProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfigState] = useState<LMStudioConfig | null>(null);
  const [service, setService] = useState<LMStudioService | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const savedConfig = await storage.getConfig();
        if (savedConfig) {
          setConfigState(savedConfig);
          const svc = initLMStudioService(savedConfig.baseURL, savedConfig.apiKey);
          setService(svc);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load config');
      } finally {
        setIsLoading(false);
      }
    };

    loadConfig();
  }, []);

  const setConfig = async (newConfig: LMStudioConfig) => {
    try {
      setError(null);
      await storage.saveConfig(newConfig);
      setConfigState(newConfig);
      const svc = initLMStudioService(newConfig.baseURL, newConfig.apiKey);
      setService(svc);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Failed to save config';
      setError(errMsg);
      throw err;
    }
  };

  const testConnection = async (): Promise<boolean> => {
    try {
      if (!service) return false;
      return await service.testConnection();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed');
      return false;
    }
  };

  const clearConfig = async () => {
    try {
      await storage.clearConfig();
      setConfigState(null);
      setService(null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear config');
    }
  };

  return (
    <LMStudioContext.Provider
      value={{
        config,
        service,
        isConfigured: !!config,
        isLoading,
        error,
        setConfig,
        testConnection,
        clearConfig,
      }}>
      {children}
    </LMStudioContext.Provider>
  );
}

export function useLMStudio() {
  const context = useContext(LMStudioContext);
  if (context === undefined) {
    throw new Error('useLMStudio must be used within LMStudioProvider');
  }
  return context;
}
