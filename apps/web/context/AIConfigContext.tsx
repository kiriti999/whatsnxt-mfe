'use client';

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { AISuggestions } from '../apis/v1/blog/aiSuggestions';
import { DEFAULT_MODELS } from '../components/Common/AIConfigModal';

interface AIConfigState {
  selectedAI: string;
  selectedModel: string;
  loaded: boolean;
}

interface AIConfigContextType extends AIConfigState {
  setSelectedAI: (provider: string) => void;
  setSelectedModel: (model: string) => void;
  /** Update both provider and model at once (e.g., after saving a key) */
  updateConfig: (provider: string, model: string) => void;
}

const AIConfigContext = createContext<AIConfigContextType | null>(null);

export function AIConfigProvider({ children, isAuthenticated }: { children: React.ReactNode; isAuthenticated: boolean }) {
  const [state, setState] = useState<AIConfigState>({
    selectedAI: 'openai',
    selectedModel: 'gpt-4.1-mini',
    loaded: false,
  });

  // Fetch saved config from DB on mount (only if authenticated)
  useEffect(() => {
    if (!isAuthenticated) {
      setState(prev => ({ ...prev, loaded: true }));
      return;
    }

    AISuggestions.getAIConfig()
      .then((res) => {
        const data = res.data?.data;
        if (data) {
          // Prefer lastUsedAI (tracked on every successful AI call)
          const lastUsed = data.lastUsedAI;
          if (lastUsed?.provider) {
            setState({
              selectedAI: lastUsed.provider,
              selectedModel: lastUsed.model || DEFAULT_MODELS[lastUsed.provider] || 'gpt-4.1-mini',
              loaded: true,
            });
            return;
          }

          // Fallback: find most recently updated provider from aiConfig (key saves)
          const config = data.aiConfig;
          if (config && typeof config === 'object') {
            let latestProvider = '';
            let latestDate = 0;
            for (const [provider, value] of Object.entries(config)) {
              const entry = value as { apiKey?: string; modelVersion?: string; updatedAt?: string };
              const updatedAt = entry?.updatedAt ? new Date(entry.updatedAt).getTime() : 0;
              if (updatedAt > latestDate) {
                latestDate = updatedAt;
                latestProvider = provider;
              }
            }

            if (latestProvider) {
              const entry = config[latestProvider] as { modelVersion?: string };
              setState({
                selectedAI: latestProvider,
                selectedModel: entry?.modelVersion || DEFAULT_MODELS[latestProvider] || 'gpt-4.1-mini',
                loaded: true,
              });
              return;
            }
          }
        }
        setState(prev => ({ ...prev, loaded: true }));
      })
      .catch(() => {
        // Silent fail — use defaults
        setState(prev => ({ ...prev, loaded: true }));
      });
  }, [isAuthenticated]);

  const setSelectedAI = useCallback((provider: string) => {
    setState(prev => ({
      ...prev,
      selectedAI: provider,
      selectedModel: DEFAULT_MODELS[provider] || prev.selectedModel,
    }));
  }, []);

  const setSelectedModel = useCallback((model: string) => {
    setState(prev => ({ ...prev, selectedModel: model }));
  }, []);

  const updateConfig = useCallback((provider: string, model: string) => {
    setState(prev => ({ ...prev, selectedAI: provider, selectedModel: model }));
  }, []);

  const value = useMemo<AIConfigContextType>(() => ({
    ...state,
    setSelectedAI,
    setSelectedModel,
    updateConfig,
  }), [state, setSelectedAI, setSelectedModel, updateConfig]);

  return <AIConfigContext.Provider value={value}>{children}</AIConfigContext.Provider>;
}

export function useAIConfig(): AIConfigContextType {
  const ctx = useContext(AIConfigContext);
  if (!ctx) throw new Error('useAIConfig must be used within AIConfigProvider');
  return ctx;
}
