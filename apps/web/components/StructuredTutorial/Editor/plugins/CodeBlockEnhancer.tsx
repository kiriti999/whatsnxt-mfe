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
import { AIUpgradeModal } from "../../../Common/AIUpgradeModal";
import type { AIUsageStats, LimitError } from "./CodeAIResultModal";
import { CodeAIResultModal } from "./CodeAIResultModal";
import { useCodeAI } from "./useCodeAI";

const AI_ACTION_TITLES: Record<string, string> = {
    explain: "Code Explanation",
    improve: "Improvement Suggestions",
    refactor: "Refactored Code",
    translate: "Translated Code",
    document: "Documentation",
    debug: "Bug Analysis",
};

interface CodeBlockActionsProps {
    code: string;
    language: string;
    preElement: HTMLPreElement;
}

function CodeBlockActions({
    code,
    language,
    preElement,
}: CodeBlockActionsProps) {
    const [currentActionType, setCurrentActionType] = useState<string>("");
    const [aiResultModalOpen, setAiResultModalOpen] = useState(false);
    const [modalResult, setModalResult] = useState<string | null>(null);
    const [usageStats, setUsageStats] = useState<AIUsageStats | null>(null);
    const [limitError, setLimitError] = useState<LimitError | null>(null);
    const [
        configModalOpened,
        { open: openConfigModal, close: closeConfigModal },
    ] = useDisclosure(false);
    const [
        upgradeModalOpened,
        { open: openUpgradeModal, close: closeUpgradeModal },
    ] = useDisclosure(false);
    const [apiKeyError, setApiKeyError] = useState("");
    const [upgradeInfo, setUpgradeInfo] = useState({
        dailyUsed: 0,
        dailyLimit: 5,
        resetDate: "",
    });
    const hasUserInteractedRef = useRef(false); // Track if user has clicked AI button

    // AI hook
    const aiConfig = useAIConfig();
    const {
        loading: aiLoading,
        result: aiResult,
        error: aiError,
        executeAction,
        clearResult,
    } = useCodeAI();

    // Show result modal when AI result is ready
    useEffect(() => {
        if (aiResult) {
            setModalResult(aiResult); // Update modal content
            setAiResultModalOpen(true);
            setLimitError(null); // Clear any previous limit errors
        }
    }, [aiResult]);

    // Open config modal when there's an auth error (only after user interaction)
    useEffect(() => {
        if (aiError && aiConfig.loaded && hasUserInteractedRef.current) {
            const isStudent = aiConfig.userRole === "student";

            // Check if it's a rate limit error for students — show upgrade modal
            const isRateLimit =
                aiError.includes("daily limit") ||
                aiError.includes("rate limit") ||
                aiError.includes("429");

            if (isRateLimit && isStudent) {
                setUpgradeInfo({
                    dailyUsed: 5,
                    dailyLimit: 5,
                    resetDate: "",
                });
                openUpgradeModal();
                return;
            }

            // Check if it's an authentication/API key error
            const isAuthError =
                aiError.includes("API key") ||
                aiError.includes("Authentication") ||
                aiError.includes("401");

            // Check if it's specifically an incorrect/invalid key error
            const isInvalidKey =
                aiError.includes("Incorrect API key") ||
                aiError.includes("Invalid API key");

            // Show config modal for trainers if:
            // 1. It's an auth error AND
            // 2. Either the key is invalid OR user doesn't have a key saved AND
            // 3. It's NOT a temporary rate limit error
            if (
                isAuthError &&
                !isRateLimit &&
                (isInvalidKey || !aiConfig.hasApiKey(aiConfig.selectedAI))
            ) {
                setApiKeyError(aiError);
                openConfigModal();
            }
        }
    }, [aiError, openConfigModal, openUpgradeModal, aiConfig]);

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
    ): Promise<{
        response: string;
        usageStats?: AIUsageStats;
        limitError?: LimitError;
    }> => {
        try {
            // Send full conversation history to API
            const response = await AISuggestions.getSuggestionByAI({
                aiModel: aiConfig.selectedAI,
                modelVersion: aiConfig.selectedModel,
                messages: conversationHistory, // Full conversation context
            });

            if (response.status === 200 && response.data?.suggestion) {
                // Update usage stats if provided
                if (response.data.usageStats) {
                    setUsageStats(response.data.usageStats);
                }

                return {
                    response: response.data.suggestion,
                    usageStats: response.data.usageStats,
                };
            }
            throw new Error("Failed to get AI response");
        } catch (error: unknown) {
            console.error("Error handling reply:", error);

            // Handle rate limit error (429)
            if (error && typeof error === "object" && "response" in error) {
                const axiosError = error as {
                    response?: {
                        status?: number;
                        data?: {
                            limitInfo?: {
                                reason?: string;
                                resetDate?: string;
                                isPremium?: boolean;
                            };
                            usageStats?: AIUsageStats;
                            message?: string;
                        };
                    };
                };

                if (axiosError.response?.status === 429 && axiosError.response?.data) {
                    const limitInfo = axiosError.response.data.limitInfo;
                    const usageStats = axiosError.response.data.usageStats;

                    if (usageStats) {
                        setUsageStats(usageStats);
                    }

                    // Student hit daily limit — show upgrade modal instead
                    if (aiConfig.userRole === "student") {
                        setUpgradeInfo({
                            dailyUsed: usageStats?.daily?.used || 5,
                            dailyLimit: usageStats?.daily?.limit || 5,
                            resetDate: limitInfo?.resetDate || "",
                        });
                        openUpgradeModal();
                        return { response: "" };
                    }

                    const limitError: LimitError = {
                        reason:
                            (limitInfo?.reason as LimitError["reason"]) ||
                            "daily_limit_exceeded_free",
                        message: axiosError.response.data.message || "Rate limit exceeded",
                        resetDate: limitInfo?.resetDate || new Date().toISOString(),
                        isPremium: limitInfo?.isPremium || false,
                    };

                    setLimitError(limitError);

                    return {
                        response: "",
                        usageStats,
                        limitError,
                    };
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
    };

    const handleAIAction = (actionType: string) => {

        // Check authentication first - redirect to login if not authenticated
        console.log('🚀 :: handleAIAction :: aiConfig:', aiConfig)
        if (!aiConfig.isAuthenticated) {
            const returnUrl = encodeURIComponent(window.location.pathname);
            window.location.href = `/authentication?returnUrl=${returnUrl}`;
            return;
        }

        hasUserInteractedRef.current = true; // Mark that user has clicked AI button
        setCurrentActionType(actionType);
        executeAction({
            action: actionType as
                | "explain"
                | "improve"
                | "refactor"
                | "translate"
                | "document"
                | "debug",
            code,
            language,
        });
    };
    const handleFullScreen = () => {
        // Create modal overlay
        const modal = document.createElement("div");
        modal.style.cssText = `
      position: fixed;
      inset: 0;
      background: #0d1117;
      z-index: 99999;
      display: flex;
      flex-direction: column;
    `;

        // Header bar
        const header = document.createElement("div");
        header.style.cssText = `
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #30363d;
      background: #161b22;
      display: flex;
      justify-content: space-between;
      align-items: center;
    `;

        const title = document.createElement("span");
        title.textContent = "Code";
        title.style.cssText = `
      color: white;
      font-weight: 600;
      font-size: 14px;
    `;

        const closeBtn = document.createElement("button");
        closeBtn.textContent = "✕";
        closeBtn.style.cssText = `
      background: transparent;
      color: white;
      border: none;
      border-radius: 4px;
      padding: 0.5rem 1rem;
      cursor: pointer;
      font-size: 1.5rem;
      transition: background 0.2s;
    `;
        closeBtn.onmouseover = () =>
            (closeBtn.style.background = "rgba(255, 255, 255, 0.1)");
        closeBtn.onmouseout = () => (closeBtn.style.background = "transparent");
        closeBtn.onclick = () => modal.remove();

        header.appendChild(title);
        header.appendChild(closeBtn);

        // Code content area
        const contentArea = document.createElement("div");
        contentArea.style.cssText = `
      flex: 1;
      overflow: auto;
      padding: 2rem;
      background: #0d1117;
    `;

        const codeContainer = document.createElement("pre");
        codeContainer.style.cssText = `
      background: #0d1117;
      color: #c9d1d9;
      padding: 0;
      margin: 0;
      font-size: 16px;
      line-height: 1.7;
      font-family: 'JetBrains Mono', 'Fira Code', 'SF Mono', Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
      white-space: pre;
      overflow-x: auto;
      tab-size: 2;
    `;
        codeContainer.textContent = code;

        contentArea.appendChild(codeContainer);

        modal.appendChild(header);
        modal.appendChild(contentArea);
        document.body.appendChild(modal);

        // Handle ESC key
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") modal.remove();
        };
        document.addEventListener("keydown", handleEsc);
        modal.addEventListener("click", (e) => {
            if (e.target === modal) modal.remove();
        });

        // Cleanup
        const cleanup = () => {
            document.removeEventListener("keydown", handleEsc);
        };
        closeBtn.addEventListener("click", cleanup);
    };

    const handleToggle = () => {
        const isCollapsed = preElement.style.maxHeight === "150px";
        preElement.style.maxHeight = isCollapsed ? "none" : "150px";
        preElement.style.overflow = isCollapsed ? "auto" : "hidden";
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
                {/* AI Sparkle - Direct Explain */}
                <Tooltip label="Explain Code" withArrow>
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

                {/* Copy Button */}
                <CopyButton value={code} timeout={2000}>
                    {({ copied, copy }) => (
                        <Tooltip label={copied ? "Copied!" : "Copy code"} withArrow>
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

                {/* Full Screen */}
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

                {/* Toggle */}
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

            {/* AI Config Modal */}
            <AIConfigModal
                opened={configModalOpened}
                onClose={closeConfigModal}
                selectedAI={aiConfig.selectedAI}
                selectedModel={aiConfig.selectedModel}
                onProviderChange={aiConfig.setSelectedAI}
                onModelChange={aiConfig.setSelectedModel}
                onGenerate={() => {
                    setApiKeyError("");
                    clearResult(); // Clear any previous errors
                    closeConfigModal();
                }}
                onSaveKeyAndGenerate={() => {
                    console.log(
                        "[CodeBlockEnhancer] onSaveKeyAndGenerate called with context state:",
                        {
                            selectedAI: aiConfig.selectedAI,
                            selectedModel: aiConfig.selectedModel,
                            savedProviders: Array.from(aiConfig.savedProviders),
                        },
                    );
                    setApiKeyError("");
                    clearResult(); // Clear any previous errors
                    // Update context to reflect the newly saved API key
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

            {/* AI Result Modal */}
            {modalResult && (
                <CodeAIResultModal
                    opened={aiResultModalOpen}
                    onClose={handleCloseResultModal}
                    title={AI_ACTION_TITLES[currentActionType] || "AI Result"}
                    result={modalResult}
                    isCodeResult={
                        currentActionType === "refactor" ||
                        currentActionType === "translate" ||
                        currentActionType === "document"
                    }
                    usageStats={usageStats}
                    limitError={limitError}
                    userRole={aiConfig.userRole}
                    onReply={handleReply}
                />
            )}

            {/* AI Upgrade Modal for free users */}
            <AIUpgradeModal
                opened={upgradeModalOpened}
                onClose={closeUpgradeModal}
                dailyUsed={upgradeInfo.dailyUsed}
                dailyLimit={upgradeInfo.dailyLimit}
                resetDate={upgradeInfo.resetDate}
            />
        </>
    );
}

/**
 * Enhanced code block display for blog/tutorial content
 * Adds AI, copy, fullscreen, and toggle buttons to all <pre><code> blocks
 * @param containerElement - The container element with code blocks
 * @param isAuthenticatedContext - Auth status from parent context (optional, will read from DOM if not provided)
 */
export function enhanceCodeBlocks(
    containerElement: HTMLElement | null,
    isAuthenticatedContext?: boolean,
    userRoleContext?: string,
) {
    if (!containerElement || typeof window === "undefined") return;

    // Read auth status from container's data attribute (set by parent component with context)
    const isAuthenticated = isAuthenticatedContext ??
        containerElement.dataset?.authenticated === "true";
    const userRole = userRoleContext ?? containerElement.dataset?.userRole ?? "";

    const codeBlocks = containerElement.querySelectorAll("pre code");

    codeBlocks.forEach((codeEl) => {
        const preElement = codeEl.closest("pre") as HTMLPreElement;
        if (!preElement || preElement.dataset.enhanced === "true") {
            return;
        }

        preElement.dataset.enhanced = "true";
        preElement.style.position = "relative";

        const code = codeEl.textContent || "";
        const language =
            codeEl.className.match(/language-(\w+)/)?.[1] || "plaintext";

        // Create wrapper for actions
        const actionsWrapper = document.createElement("div");
        actionsWrapper.style.cssText = `
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      z-index: 1000;
    `;
        preElement.style.paddingTop = "3.5rem"; // Make room for actions
        preElement.insertBefore(actionsWrapper, preElement.firstChild);

        // Render React component
        // Note: Use auth status from parent context (via data attribute bridge)
        const root = createRoot(actionsWrapper);
        root.render(
            <MantineProvider>
                <AIConfigProvider isAuthenticated={isAuthenticated} userRole={userRole}>
                    <CodeBlockActions
                        code={code}
                        language={language}
                        preElement={preElement}
                    />
                </AIConfigProvider>
            </MantineProvider>,
        );
    });
}

/**
 * Hook to enhance code blocks in a container
 * @param containerRef - Reference to the container element
 * @param isAuthenticated - Auth status from parent context
 * @param userRole - User role from parent context
 * @param dependencies - Additional dependencies for the effect
 */
export function useEnhancedCodeBlocks(
    containerRef: React.RefObject<HTMLElement>,
    isAuthenticated: boolean = false,
    userRole: string = "",
    dependencies: unknown[] = [],
) {
    useEffect(() => {
        if (containerRef.current) {
            // Set auth status and role as data attributes for code enhancement
            containerRef.current.dataset.authenticated = String(isAuthenticated);
            containerRef.current.dataset.userRole = userRole;
            // Wait for highlight.js to finish
            const timer = setTimeout(() => {
                enhanceCodeBlocks(containerRef.current, isAuthenticated, userRole);
            }, 100);

            return () => clearTimeout(timer);
        }
    }, [containerRef, isAuthenticated, userRole, ...dependencies]);
}
