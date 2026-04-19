import { notifications } from "@mantine/notifications";
import { useCallback, useState } from "react";
import { AISuggestions } from "../../../../apis/v1/blog/aiSuggestions";
import { useAIConfig } from "../../../../context/AIConfigContext";

interface AICodeAction {
    action:
    | "explain"
    | "improve"
    | "refactor"
    | "translate"
    | "document"
    | "debug";
    code: string;
    language: string;
}

interface UseCodeAIReturn {
    loading: boolean;
    result: string | null;
    error: string | null;
    usingUserKey: boolean; // True if error was from user's own API key
    executeAction: (params: AICodeAction) => Promise<void>;
    clearResult: () => void;
}

const ACTION_PROMPTS = {
    explain: (code: string, language: string) =>
        `Explain the following ${language} code in simple, clear terms. Break down what it does step by step:\n\n${code}`,

    improve: (code: string, language: string) =>
        `Analyze this ${language} code and provide specific suggestions for improvement in terms of:\n` +
        `- Performance optimizations\n` +
        `- Code readability\n` +
        `- Best practices\n` +
        `- Potential bugs or edge cases\n\n${code}\n\n` +
        `Format your response as numbered points with clear explanations.`,

    refactor: (code: string, language: string) =>
        `Refactor this ${language} code following SOLID principles and best practices. ` +
        `Provide the improved code with comments explaining the key changes:\n\n${code}`,

    translate: (code: string, language: string) =>
        `Translate this ${language} code to TypeScript, maintaining the same functionality. ` +
        `Add proper type annotations and follow TypeScript best practices:\n\n${code}`,

    document: (code: string, language: string) =>
        `Add comprehensive documentation comments to this ${language} code, including:\n` +
        `- Function/class descriptions\n` +
        `- Parameter documentation\n` +
        `- Return value documentation\n` +
        `- Usage examples\n\n${code}`,

    debug: (code: string, language: string) =>
        `Review this ${language} code for potential bugs, security issues, and edge cases. ` +
        `List any problems found and suggest fixes:\n\n${code}`,
};

export function useCodeAI(): UseCodeAIReturn {
    const aiConfig = useAIConfig();
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [usingUserKey, setUsingUserKey] = useState(false);

    const executeAction = useCallback(
        async ({ action, code, language }: AICodeAction) => {
            if (!code.trim()) {
                notifications.show({
                    position: "top-right",
                    color: "orange",
                    title: "No Code",
                    message: "Code snippet is empty",
                });
                return;
            }

            setLoading(true);
            setError(null);
            setResult(null);
            setUsingUserKey(false);

            console.log('[useCodeAI] Executing AI action:', {
                action,
                aiProvider: aiConfig.selectedAI,
                model: aiConfig.selectedModel,
                language
            });

            try {
                const prompt = ACTION_PROMPTS[action](code, language);

                const response = await AISuggestions.getSuggestionByAI({
                    question: prompt,
                    aiModel: aiConfig.selectedAI,
                    modelVersion: aiConfig.selectedModel,
                });

                console.log('[useCodeAI] Response received:', {
                    status: response.status,
                    model: response.data?.model,
                    hasSuggestion: !!response.data?.suggestion
                });

                if (response.status === 200 && response.data?.suggestion) {
                    setResult(response.data.suggestion);
                    notifications.show({
                        position: "top-right",
                        color: "green",
                        title: "AI Analysis Complete",
                        message: `Generated using ${response.data.model || aiConfig.selectedAI}`,
                    });
                } else {
                    const errorMsg =
                        response.data?.message ||
                        response.data?.error ||
                        "Failed to get AI response. Please check your API key configuration.";
                    setError(errorMsg);

                    // Don't show notification for auth errors - modal will be shown instead
                    const isAuthError = errorMsg.includes('API key') ||
                        errorMsg.includes('Authentication') ||
                        errorMsg.includes('rate limit');

                    if (!isAuthError) {
                        notifications.show({
                            position: "top-right",
                            color: "red",
                            title: "AI Request Failed",
                            message: errorMsg,
                        });
                    }
                }
            } catch (err: unknown) {
                console.error("AI code action error:", err);

                let errorMessage = "Failed to process AI request";

                if (err && typeof err === "object") {
                    const error = err as {
                        response?: {
                            data?: { message?: string; error?: string };
                            status?: number;
                        };
                        message?: string;
                    };

                    if (error.response?.data?.message) {
                        errorMessage = error.response.data.message;
                    } else if (error.response?.data?.error) {
                        errorMessage = error.response.data.error;
                    } else if (error.response?.status === 429) {
                        errorMessage =
                            "Rate limit exceeded. Please use your own API key in AI Settings.";
                    } else if (error.response?.status === 401) {
                        errorMessage =
                            "Authentication failed. Please configure your API key in AI Settings.";
                    } else if (error.message) {
                        errorMessage = error.message;
                    }

                    // Track if error was from user's own key
                    const isUserKey = (error.response?.data as { usingUserKey?: boolean })?.usingUserKey ?? false;
                    setUsingUserKey(isUserKey);
                }

                setError(errorMessage);

                // Don't show notification for auth errors - modal will be shown instead
                const isAuthError = errorMessage.includes('API key') ||
                    errorMessage.includes('Authentication') ||
                    errorMessage.includes('401') ||
                    errorMessage.includes('rate limit');

                if (!isAuthError) {
                    notifications.show({
                        position: "top-right",
                        color: "red",
                        title: "Error",
                        message: errorMessage,
                        autoClose: 5000,
                    });
                }
            } finally {
                setLoading(false);
            }
        },
        [aiConfig.selectedAI, aiConfig.selectedModel],
    );

    const clearResult = useCallback(() => {
        setResult(null);
        setError(null);
        setUsingUserKey(false);
    }, []);

    return {
        loading,
        result,
        error,
        usingUserKey,
        executeAction,
        clearResult,
    };
}
