"use client";

import { notifications } from "@mantine/notifications";
import { useCallback, useState } from "react";
import { AISuggestions } from "../../../../apis/v1/blog/aiSuggestions";
import { useAIConfig } from "../../../../context/AIConfigContext";

type DiagramAction = "explain" | "describe" | "summarize";

interface AIDiagramAction {
    action: DiagramAction;
    svgContent: string;
}

interface UseDiagramAIReturn {
    loading: boolean;
    result: string | null;
    error: string | null;
    usingUserKey: boolean; // True if error was from user's own API key
    executeAction: (params: AIDiagramAction) => Promise<void>;
    clearResult: () => void;
}

const ACTION_PROMPTS: Record<DiagramAction, (svg: string) => string> = {
    explain: (svg: string) =>
        "Explain the following SVG diagram in simple, clear terms. " +
        "Break down the components, their relationships, and what the diagram represents:\n\n" +
        svg,

    describe: (svg: string) =>
        "Provide an accessible description of this SVG diagram suitable for screen readers " +
        "and visually impaired users. Include all key elements, labels, and relationships:\n\n" +
        svg,

    summarize: (svg: string) =>
        "Give a concise one-paragraph summary of what this SVG diagram shows, " +
        "including the main components and their connections:\n\n" +
        svg,
};

export function useDiagramAI(): UseDiagramAIReturn {
    const aiConfig = useAIConfig();
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [usingUserKey, setUsingUserKey] = useState(false);

    const clearResult = useCallback(() => {
        setResult(null);
        setError(null);
        setUsingUserKey(false);
    }, []);

    const executeAction = useCallback(
        async ({ action, svgContent }: AIDiagramAction) => {
            if (!svgContent.trim()) {
                notifications.show({
                    position: "top-right",
                    color: "orange",
                    title: "No Diagram",
                    message: "Diagram content is empty",
                });
                return;
            }

            setLoading(true);
            setError(null);
            setResult(null);
            setUsingUserKey(false);

            try {
                const prompt = ACTION_PROMPTS[action](svgContent);

                const response = await AISuggestions.getSuggestionByAI({
                    question: prompt,
                    aiModel: aiConfig.selectedAI,
                    modelVersion: aiConfig.selectedModel,
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
                    const errorMsg = extractErrorMessage(response);
                    setError(errorMsg);
                    showErrorNotification(errorMsg);
                }
            } catch (err: unknown) {
                const msg = err instanceof Error ? err.message : "Unexpected error";
                // Track if error was from user's own key
                if (err && typeof err === "object") {
                    const axiosError = err as {
                        response?: { data?: { usingUserKey?: boolean } };
                    };
                    setUsingUserKey(axiosError.response?.data?.usingUserKey ?? false);
                }
                setError(msg);
                showErrorNotification(msg);
            } finally {
                setLoading(false);
            }
        },
        [aiConfig.selectedAI, aiConfig.selectedModel],
    );

    return { loading, result, error, usingUserKey, executeAction, clearResult };
}

function extractErrorMessage(response: {
    data?: { message?: string; error?: string };
}): string {
    return (
        response.data?.message ||
        response.data?.error ||
        "Failed to get AI response"
    );
}

function showErrorNotification(message: string) {
    notifications.show({
        position: "top-right",
        color: "red",
        title: "AI Request Failed",
        message,
    });
}
