"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { AISuggestions } from "../apis/v1/blog/aiSuggestions";
import { DEFAULT_MODELS } from "../components/Common/AIConfigModal";

interface AIConfigState {
  selectedAI: string;
  selectedModel: string;
  loaded: boolean;
  savedProviders: Set<string>;
}

interface AIConfigContextType extends AIConfigState {
  setSelectedAI: (provider: string) => void;
  setSelectedModel: (model: string) => void;
  /** Update both provider and model at once (e.g., after saving a key) */
  updateConfig: (provider: string, model: string) => void;
  /** Check if user has saved API key for the given provider */
  hasApiKey: (provider: string) => boolean;
  /** Whether the user is authenticated (from AuthContext) */
  isAuthenticated: boolean;
}

const AIConfigContext = createContext<AIConfigContextType | null>(null);

export function AIConfigProvider({
  children,
  isAuthenticated,
}: {
  children: React.ReactNode;
  isAuthenticated: boolean;
}) {
  // Default AI provider/model set at build time in next.config.ts
  const defaultProvider = process.env.NEXT_PUBLIC_DEFAULT_AI_PROVIDER as string;
  const defaultModel = process.env.NEXT_PUBLIC_DEFAULT_AI_MODEL as string;

  const [state, setState] = useState<AIConfigState>({
    selectedAI: defaultProvider,
    selectedModel: defaultModel,
    loaded: false,
    savedProviders: new Set(),
  });

  // Fetch saved config from DB on mount (only if authenticated)
  useEffect(() => {
    // Always try to load config - backend will handle auth
    // If not authenticated, backend returns 401 and we use defaults
    AISuggestions.getAIConfig()
      .then((res) => {
        const data = res.data?.data;
        console.log("[AIConfigContext] Loaded config from backend:", {
          data,
          isAuthenticated,
        });
        if (data) {
          // Parse aiConfig to determine which providers have saved keys
          const config = data.aiConfig;
          const providersWithKeys = new Set<string>();
          if (config && typeof config === "object") {
            for (const [provider, value] of Object.entries(config)) {
              const entry = value as {
                apiKey?: string;
                modelVersion?: string;
                updatedAt?: string;
              };
              if (entry?.apiKey) {
                providersWithKeys.add(provider);
                console.log(
                  `[AIConfigContext] Found saved API key for provider: ${provider}`,
                );
              }
            }
          }
          console.log(
            "[AIConfigContext] Providers with saved keys:",
            Array.from(providersWithKeys),
          );

          // Prefer lastUsedAI (tracked on every successful AI call)
          const lastUsed = data.lastUsedAI;
          console.log("[AIConfigContext] lastUsedAI from DB:", lastUsed);
          if (lastUsed?.provider) {
            console.log(
              "[AIConfigContext] Using lastUsedAI provider:",
              lastUsed.provider,
            );
            setState({
              selectedAI: lastUsed.provider,
              selectedModel:
                lastUsed.model ||
                DEFAULT_MODELS[lastUsed.provider] ||
                "gpt-4.1-mini",
              loaded: true,
              savedProviders: providersWithKeys,
            });
            console.log("[AIConfigContext] Final state set with lastUsedAI:", {
              selectedAI: lastUsed.provider,
              selectedModel:
                lastUsed.model || DEFAULT_MODELS[lastUsed.provider],
            });
            return;
          }

          // Fallback: find most recently updated provider from aiConfig (key saves)
          console.log(
            "[AIConfigContext] No lastUsedAI, checking aiConfig for most recent provider",
          );
          if (config && typeof config === "object") {
            let latestProvider = "";
            let latestDate = 0;
            for (const [provider, value] of Object.entries(config)) {
              const entry = value as {
                apiKey?: string;
                modelVersion?: string;
                updatedAt?: string;
              };
              const updatedAt = entry?.updatedAt
                ? new Date(entry.updatedAt).getTime()
                : 0;
              console.log(
                `[AIConfigContext] Checking provider ${provider}: updatedAt=${entry?.updatedAt}, timestamp=${updatedAt}`,
              );
              if (updatedAt > latestDate) {
                latestDate = updatedAt;
                latestProvider = provider;
              }
            }

            console.log(
              "[AIConfigContext] Most recent provider from aiConfig:",
              latestProvider,
            );
            if (latestProvider) {
              const entry = config[latestProvider] as { modelVersion?: string };
              setState({
                selectedAI: latestProvider,
                selectedModel:
                  entry?.modelVersion ||
                  DEFAULT_MODELS[latestProvider] ||
                  "gpt-4.1-mini",
                loaded: true,
                savedProviders: providersWithKeys,
              });
              console.log(
                "[AIConfigContext] Final state set with fallback provider:",
                {
                  selectedAI: latestProvider,
                  selectedModel:
                    entry?.modelVersion || DEFAULT_MODELS[latestProvider],
                },
              );
              return;
            }
          }

          // No lastUsedAI or config found, but still set savedProviders
          console.log("[AIConfigContext] No provider found, using defaults");
          setState((prev) => ({
            ...prev,
            loaded: true,
            savedProviders: providersWithKeys,
          }));
          return;
        }
        setState((prev) => ({ ...prev, loaded: true }));
      })
      .catch(() => {
        // Silent fail — use defaults
        setState((prev) => ({ ...prev, loaded: true }));
      });
  }, [isAuthenticated]);

  const setSelectedAI = useCallback((provider: string) => {
    console.log("[AIConfigContext] setSelectedAI called:", provider);
    setState((prev) => ({
      ...prev,
      selectedAI: provider,
      selectedModel: DEFAULT_MODELS[provider] || prev.selectedModel,
    }));
  }, []);

  const setSelectedModel = useCallback((model: string) => {
    console.log("[AIConfigContext] setSelectedModel called:", model);
    setState((prev) => ({ ...prev, selectedModel: model }));
  }, []);

  const updateConfig = useCallback((provider: string, model: string) => {
    console.log("[AIConfigContext] updateConfig called:", { provider, model });
    setState((prev) => ({
      ...prev,
      selectedAI: provider,
      selectedModel: model,
      savedProviders: new Set([...prev.savedProviders, provider]), // Add provider to saved list
    }));
  }, []);

  const hasApiKey = useCallback(
    (provider: string) => {
      return state.savedProviders.has(provider);
    },
    [state.savedProviders],
  );

  const value = useMemo<AIConfigContextType>(
    () => ({
      ...state,
      setSelectedAI,
      setSelectedModel,
      updateConfig,
      hasApiKey,
      isAuthenticated,
    }),
    [state, setSelectedAI, setSelectedModel, updateConfig, hasApiKey, isAuthenticated],
  );

  return (
    <AIConfigContext.Provider value={value}>
      {children}
    </AIConfigContext.Provider>
  );
}

export function useAIConfig(): AIConfigContextType {
  const ctx = useContext(AIConfigContext);
  if (!ctx) throw new Error("useAIConfig must be used within AIConfigProvider");
  return ctx;
}
