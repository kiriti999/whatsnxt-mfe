"use client";

import {
    ActionIcon,
    CopyButton,
    Group,
    MantineProvider,
    Tooltip,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
    IconCheck,
    IconChevronUp,
    IconCopy,
    IconMaximize,
    IconSparkles,
} from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { AISuggestions } from "../../../../apis/v1/blog/aiSuggestions";
import {
    AIConfigProvider,
    useAIConfig,
} from "../../../../context/AIConfigContext";
import { AIConfigModal } from "../../../Common/AIConfigModal";
import type { AIUsageStats, LimitError } from "./CodeAIResultModal";
import { CodeAIResultModal } from "./CodeAIResultModal";
import { useDiagramAI } from "./useDiagramAI";

const DIAGRAM_ACTION_TITLES: Record<string, string> = {
    explain: "Diagram Explanation",
    describe: "Diagram Description",
    summarize: "Diagram Summary",
};

interface DiagramActionsProps {
    svgContent: string;
    figureElement: HTMLElement;
}

function DiagramActions({ svgContent, figureElement }: DiagramActionsProps) {
    const [aiResultModalOpen, setAiResultModalOpen] = useState(false);
    const [modalResult, setModalResult] = useState<string | null>(null);
    const [currentActionType, setCurrentActionType] = useState("explain");
    const [usageStats, setUsageStats] = useState<AIUsageStats | null>(null);
    const [limitError, setLimitError] = useState<LimitError | null>(null);
    const [configModalOpened, { open: openConfigModal, close: closeConfigModal }] =
        useDisclosure(false);
    const [apiKeyError, setApiKeyError] = useState("");
    const hasUserInteractedRef = useRef(false);

    const aiConfig = useAIConfig();
    const {
        loading: aiLoading,
        result: aiResult,
        error: aiError,
        executeAction,
        clearResult,
    } = useDiagramAI();

    useEffect(() => {
        if (aiResult) {
            setModalResult(aiResult);
            setAiResultModalOpen(true);
            setLimitError(null);
        }
    }, [aiResult]);

    useEffect(() => {
        if (!aiError || !aiConfig.loaded || !hasUserInteractedRef.current) return;
        const isAuthError =
            aiError.includes("API key") ||
            aiError.includes("Authentication") ||
            aiError.includes("401");
        const isInvalidKey =
            aiError.includes("Incorrect API key") ||
            aiError.includes("Invalid API key");
        const isRateLimit =
            aiError.includes("rate limit") || aiError.includes("429");

        if (isAuthError && !isRateLimit && (isInvalidKey || !aiConfig.hasApiKey(aiConfig.selectedAI))) {
            setApiKeyError(aiError);
            openConfigModal();
        }
    }, [aiError, openConfigModal, aiConfig]);

    const handleCloseResultModal = () => {
        setAiResultModalOpen(false);
        setModalResult(null);
        setUsageStats(null);
        setLimitError(null);
        clearResult();
    };

    const handleReply = async (
        _replyText: string,
        conversationHistory: Array<{ role: "user" | "assistant"; content: string }>,
    ): Promise<{ response: string; usageStats?: AIUsageStats; limitError?: LimitError }> => {
        try {
            const response = await AISuggestions.getSuggestionByAI({
                aiModel: aiConfig.selectedAI,
                modelVersion: aiConfig.selectedModel,
                messages: conversationHistory,
            });

            if (response.status === 200 && response.data?.suggestion) {
                if (response.data.usageStats) setUsageStats(response.data.usageStats);
                return { response: response.data.suggestion, usageStats: response.data.usageStats };
            }
            throw new Error("Failed to get AI response");
        } catch (error: unknown) {
            return handleReplyError(error, setUsageStats, setLimitError);
        }
    };

    const handleAIAction = (actionType: string) => {
        if (!aiConfig.isAuthenticated) {
            const returnUrl = encodeURIComponent(window.location.pathname);
            window.location.href = `/authentication?returnUrl=${returnUrl}`;
            return;
        }
        hasUserInteractedRef.current = true;
        setCurrentActionType(actionType);
        executeAction({ action: actionType as "explain" | "describe" | "summarize", svgContent });
    };

    const handleFullScreen = () => {
        createFullScreenModal(svgContent);
    };

    const handleToggle = () => {
        const isCollapsed = figureElement.style.maxHeight === "150px";
        figureElement.style.maxHeight = isCollapsed ? "none" : "150px";
        figureElement.style.overflow = isCollapsed ? "auto" : "hidden";
    };

    return (
        <>
            <Group
                gap={4}
                style={{
                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                    padding: "0.5rem",
                    borderRadius: "0.375rem",
                    backdropFilter: "blur(8px)",
                }}
            >
                <Tooltip label="Explain Diagram" withArrow>
                    <ActionIcon
                        variant="filled"
                        size="md"
                        color="violet"
                        onClick={() => handleAIAction("explain")}
                        loading={aiLoading}
                        style={{
                            backgroundColor: "#7c3aed",
                            border: "1px solid rgba(255, 255, 255, 0.3)",
                            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                        }}
                    >
                        <IconSparkles size={16} />
                    </ActionIcon>
                </Tooltip>

                <CopyButton value={svgContent} timeout={2000}>
                    {({ copied, copy }) => (
                        <Tooltip label={copied ? "Copied!" : "Copy SVG"} withArrow>
                            <ActionIcon
                                variant="filled"
                                size="md"
                                onClick={copy}
                                color={copied ? "green" : "gray"}
                                style={{
                                    backgroundColor: copied ? "#51cf66" : "#374151",
                                    border: "1px solid rgba(255, 255, 255, 0.3)",
                                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                                }}
                            >
                                {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                            </ActionIcon>
                        </Tooltip>
                    )}
                </CopyButton>

                <Tooltip label="Full screen" withArrow>
                    <ActionIcon
                        variant="filled"
                        size="md"
                        color="gray"
                        onClick={handleFullScreen}
                        style={{
                            backgroundColor: "#374151",
                            border: "1px solid rgba(255, 255, 255, 0.3)",
                            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                        }}
                    >
                        <IconMaximize size={16} />
                    </ActionIcon>
                </Tooltip>

                <Tooltip label="Toggle" withArrow>
                    <ActionIcon
                        variant="filled"
                        size="md"
                        color="gray"
                        onClick={handleToggle}
                        style={{
                            backgroundColor: "#374151",
                            border: "1px solid rgba(255, 255, 255, 0.3)",
                            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                        }}
                    >
                        <IconChevronUp size={16} />
                    </ActionIcon>
                </Tooltip>
            </Group>

            <AIConfigModal
                opened={configModalOpened}
                onClose={closeConfigModal}
                selectedAI={aiConfig.selectedAI}
                selectedModel={aiConfig.selectedModel}
                onProviderChange={aiConfig.setSelectedAI}
                onModelChange={aiConfig.setSelectedModel}
                onGenerate={() => {
                    setApiKeyError("");
                    clearResult();
                    closeConfigModal();
                }}
                onSaveKeyAndGenerate={() => {
                    setApiKeyError("");
                    clearResult();
                    aiConfig.updateConfig(aiConfig.selectedAI, aiConfig.selectedModel);
                    closeConfigModal();
                }}
                onNotification={(n) => {
                    notifications.show({
                        position: "top-right",
                        color: n.color,
                        title: "API Key Saved",
                        message: n.message,
                    });
                }}
                error={apiKeyError}
            />

            {modalResult && (
                <CodeAIResultModal
                    opened={aiResultModalOpen}
                    onClose={handleCloseResultModal}
                    title={DIAGRAM_ACTION_TITLES[currentActionType] || "AI Result"}
                    result={modalResult}
                    isCodeResult={false}
                    usageStats={usageStats}
                    limitError={limitError}
                    onReply={handleReply}
                />
            )}
        </>
    );
}

/**
 * Enhance SVG diagram figures with AI action icons in blog/tutorial view.
 * Targets <figure> elements that contain an <svg>.
 */
export function enhanceDiagrams(
    containerElement: HTMLElement | null,
    isAuthenticatedContext?: boolean,
) {
    if (!containerElement || typeof window === "undefined") return;

    const isAuthenticated =
        isAuthenticatedContext ?? containerElement.dataset?.authenticated === "true";

    const figures = containerElement.querySelectorAll("figure");

    figures.forEach((figure) => {
        const svgEl = figure.querySelector("svg");
        if (!svgEl || figure.dataset.diagramEnhanced === "true") return;

        figure.dataset.diagramEnhanced = "true";
        figure.style.position = "relative";

        const svgContent = svgEl.outerHTML;

        const actionsWrapper = document.createElement("div");
        actionsWrapper.style.cssText =
            "position: absolute; top: 0.5rem; right: 0.5rem; z-index: 1000;";
        figure.insertBefore(actionsWrapper, figure.firstChild);

        const root = createRoot(actionsWrapper);
        root.render(
            <MantineProvider>
                <AIConfigProvider isAuthenticated={isAuthenticated}>
                    <DiagramActions svgContent={svgContent} figureElement={figure} />
                </AIConfigProvider>
            </MantineProvider>,
        );
    });
}

/* ---------- Helpers (extracted to keep cyclomatic complexity low) ---------- */

function createFullScreenModal(svgContent: string) {
    const modal = document.createElement("div");
    modal.style.cssText =
        "position:fixed;inset:0;background:#0d1117;z-index:99999;display:flex;flex-direction:column;";

    const header = buildFullScreenHeader(modal);
    const contentArea = buildFullScreenContent(svgContent);

    modal.appendChild(header);
    modal.appendChild(contentArea);
    document.body.appendChild(modal);

    const handleEsc = (e: KeyboardEvent) => {
        if (e.key === "Escape") modal.remove();
    };
    document.addEventListener("keydown", handleEsc);
    modal.addEventListener("click", (e) => {
        if (e.target === modal) modal.remove();
    });
}

function buildFullScreenHeader(modal: HTMLDivElement): HTMLDivElement {
    const header = document.createElement("div");
    header.style.cssText =
        "padding:1rem 1.5rem;border-bottom:1px solid #30363d;background:#161b22;display:flex;justify-content:space-between;align-items:center;";

    const title = document.createElement("span");
    title.textContent = "Diagram";
    title.style.cssText = "color:white;font-weight:600;font-size:14px;";

    const closeBtn = document.createElement("button");
    closeBtn.textContent = "\u2715";
    closeBtn.style.cssText =
        "background:transparent;color:white;border:none;border-radius:4px;padding:0.5rem 1rem;cursor:pointer;font-size:1.5rem;transition:background 0.2s;";
    closeBtn.onmouseover = () => (closeBtn.style.background = "rgba(255,255,255,0.1)");
    closeBtn.onmouseout = () => (closeBtn.style.background = "transparent");
    closeBtn.onclick = () => modal.remove();

    header.appendChild(title);
    header.appendChild(closeBtn);
    return header;
}

function buildFullScreenContent(svgContent: string): HTMLDivElement {
    const contentArea = document.createElement("div");
    contentArea.style.cssText =
        "flex:1;overflow:auto;padding:2rem;background:#0d1117;display:flex;align-items:center;justify-content:center;";
    contentArea.innerHTML = svgContent;

    const svg = contentArea.querySelector("svg");
    if (svg) {
        svg.style.maxWidth = "100%";
        svg.style.maxHeight = "100%";
        svg.style.height = "auto";
    }
    return contentArea;
}

function handleReplyError(
    error: unknown,
    setUsageStats: (stats: AIUsageStats | null) => void,
    setLimitError: (err: LimitError | null) => void,
): { response: string; usageStats?: AIUsageStats; limitError?: LimitError } {
    if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
            response?: {
                status?: number;
                data?: {
                    limitInfo?: { reason?: string; resetDate?: string; isPremium?: boolean };
                    usageStats?: AIUsageStats;
                    message?: string;
                };
            };
        };

        if (axiosError.response?.status === 429 && axiosError.response?.data) {
            const limitInfo = axiosError.response.data.limitInfo;
            const usageStatsData = axiosError.response.data.usageStats;
            if (usageStatsData) setUsageStats(usageStatsData);

            const limitErr: LimitError = {
                reason: (limitInfo?.reason as LimitError["reason"]) || "monthly_limit_exceeded",
                message: axiosError.response.data.message || "Rate limit exceeded",
                resetDate: limitInfo?.resetDate || new Date().toISOString(),
                isPremium: limitInfo?.isPremium || false,
            };
            setLimitError(limitErr);
            return { response: "", usageStats: usageStatsData, limitError: limitErr };
        }
    }

    notifications.show({
        position: "top-right",
        color: "red",
        title: "Error",
        message: "Failed to get AI response for follow-up question",
    });
    throw error;
}
