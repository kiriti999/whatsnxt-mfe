import { $isCodeNode, CodeNode, normalizeCodeLang } from "@lexical/code";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
    ActionIcon,
    Button,
    CopyButton,
    Group,
    Menu,
    Tooltip,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
    IconCheck,
    IconChevronDown,
    IconChevronUp,
    IconCopy,
    IconMaximize,
    IconSparkles,
} from "@tabler/icons-react";
import { $getSelection, $isRangeSelection } from "lexical";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { AISuggestions } from "../../../../apis/v1/blog/aiSuggestions";
import { useAIConfig } from "../../../../context/AIConfigContext";
import { AIConfigModal } from "../../../Common/AIConfigModal";
import { CodeAIResultModal } from "./CodeAIResultModal";
import { FullScreenCodeModal } from "./FullScreenCodeModal";
import { useCodeAI } from "./useCodeAI";

const CODE_LANGUAGE_MAP = {
    javascript: "JavaScript",
    typescript: "TypeScript",
    python: "Python",
    java: "Java",
    cpp: "C++",
    c: "C",
    csharp: "C#",
    php: "PHP",
    ruby: "Ruby",
    go: "Go",
    rust: "Rust",
    swift: "Swift",
    kotlin: "Kotlin",
    sql: "SQL",
    html: "HTML",
    css: "CSS",
    xml: "XML",
    json: "JSON",
    yaml: "YAML",
    markdown: "Markdown",
    bash: "Bash",
    shell: "Shell",
    plaintext: "Plain Text",
};

const AI_ACTION_TITLES: Record<string, string> = {
    explain: "Code Explanation",
    improve: "Improvement Suggestions",
    refactor: "Refactored Code",
    translate: "Translated Code",
    document: "Documentation",
    debug: "Bug Analysis",
};

function getCodeLanguageOptions(): [string, string][] {
    const options: [string, string][] = [];

    for (const [lang, friendlyName] of Object.entries(CODE_LANGUAGE_MAP)) {
        options.push([lang, friendlyName]);
    }

    return options;
}

interface CodeActionMenuPluginProps {
    anchorElem?: HTMLElement;
}

function CodeActionMenuContainer({
    anchorElem: _anchorElem = document.body,
}: {
    anchorElem?: HTMLElement;
}): React.JSX.Element {
    const [editor] = useLexicalComposerContext();
    const [lang, setLang] = useState("");
    const [isShown, setIsShown] = useState<boolean>(false);
    const [shouldListenMouseMove, setShouldListenMouseMove] =
        useState<boolean>(false);
    const [position, setPosition] = useState<{ top: string; right: string }>({
        top: "0",
        right: "0",
    });
    const [fullScreenOpen, setFullScreenOpen] = useState(false);
    const [codeContent, setCodeContent] = useState("");
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [aiResultModalOpen, setAiResultModalOpen] = useState(false);
    const [currentActionType, setCurrentActionType] = useState<string>("");
    const [modalResult, setModalResult] = useState<string | null>(null); // Local state for modal content
    const codeSetRef = useRef<Set<string>>(new Set());
    const codeDOMNodeRef = useRef<HTMLElement | null>(null);
    const [
        configModalOpened,
        { open: openConfigModal, close: closeConfigModal },
    ] = useDisclosure(false);
    const [apiKeyError, setApiKeyError] = useState("");
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

    const getCodeDOMNode = useCallback((): HTMLElement | null => {
        return codeDOMNodeRef.current;
    }, []);

    const updateCodeGutterPosition = useCallback(() => {
        const codeDOM = getCodeDOMNode();

        if (!codeDOM) {
            return;
        }

        const { right, top } = codeDOM.getBoundingClientRect();
        setPosition({
            right: `${window.innerWidth - right + 5}px`,
            top: `${top}px`,
        });
    }, [getCodeDOMNode]);

    useEffect(() => {
        const codeDOM = getCodeDOMNode();

        if (codeDOM) {
            updateCodeGutterPosition();
        }
    }, [getCodeDOMNode, updateCodeGutterPosition]);

    useEffect(() => {
        return editor.registerMutationListener(
            CodeNode,
            (mutations) => {
                editor.getEditorState().read(() => {
                    for (const [key, type] of mutations) {
                        if (type === "destroyed") {
                            codeSetRef.current.delete(key);
                        } else {
                            codeSetRef.current.add(key);
                        }
                    }
                });
            },
            { skipInitialization: false },
        );
    }, [editor]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const codeDOM = target.closest<HTMLElement>("code.lexical-code-block");

            if (codeDOM) {
                codeDOMNodeRef.current = codeDOM;
                let lang = codeDOM.getAttribute("data-language") || "";
                lang = normalizeCodeLang(lang);
                setLang(lang);
                setIsShown(true);
                updateCodeGutterPosition();
            } else if (codeDOMNodeRef.current) {
                codeDOMNodeRef.current = null;
                setIsShown(false);
            }
        };

        if (shouldListenMouseMove) {
            document.addEventListener("mousemove", handleMouseMove);

            return () => {
                document.removeEventListener("mousemove", handleMouseMove);
            };
        }

        return () => {
            setIsShown(false);
        };
    }, [shouldListenMouseMove, updateCodeGutterPosition]);

    useEffect(() => {
        return editor.registerUpdateListener(() => {
            editor.getEditorState().read(() => {
                const selection = $getSelection();

                if ($isRangeSelection(selection)) {
                    const anchorNode = selection.anchor.getNode();
                    const element =
                        anchorNode.getKey() === "root"
                            ? anchorNode
                            : anchorNode.getTopLevelElementOrThrow();

                    if ($isCodeNode(element)) {
                        const lang = element.getLanguage() || "";
                        setLang(normalizeCodeLang(lang));
                        setShouldListenMouseMove(false);
                        return;
                    }
                }
                setShouldListenMouseMove(true);
            });
        });
    }, [editor]);

    const handleLanguageChange = (language: string) => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                const anchorNode = selection.anchor.getNode();
                const element =
                    anchorNode.getKey() === "root"
                        ? anchorNode
                        : anchorNode.getTopLevelElementOrThrow();

                if ($isCodeNode(element)) {
                    element.setLanguage(language);
                }
            }
        });
    };

    const handleFullScreen = () => {
        const codeDOM = getCodeDOMNode();
        if (codeDOM) {
            setCodeContent(codeDOM.textContent || "");
            setFullScreenOpen(true);
        }
    };

    const handleToggleCollapse = () => {
        const codeDOM = getCodeDOMNode();
        if (codeDOM) {
            const preElement = codeDOM.closest("pre");
            if (preElement) {
                setIsCollapsed(!isCollapsed);
                preElement.style.maxHeight = isCollapsed ? "none" : "100px";
                preElement.style.overflow = isCollapsed ? "auto" : "hidden";
            }
        }
    };

    const handleAIAction = useCallback(
        (actionType: string) => {
            const codeDOM = getCodeDOMNode();
            if (codeDOM) {
                hasUserInteractedRef.current = true; // Mark that user has clicked AI button
                const code = codeDOM.textContent || "";
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
                    language: lang,
                });
            }
        },
        [executeAction, getCodeDOMNode, lang],
    );

    // Show result modal when AI result is ready
    useEffect(() => {
        if (aiResult) {
            setModalResult(aiResult); // Update modal content
            setAiResultModalOpen(true);
        }
    }, [aiResult]);

    // Open config modal when there's an auth error (only after user interaction)
    useEffect(() => {
        if (aiError && aiConfig.loaded && hasUserInteractedRef.current) {
            console.log("[CodeActionMenu] Error detected:", {
                error: aiError,
                loaded: aiConfig.loaded,
                selectedAI: aiConfig.selectedAI,
                hasApiKey: aiConfig.hasApiKey(aiConfig.selectedAI),
                savedProviders: Array.from(aiConfig.savedProviders),
                hasUserInteracted: hasUserInteractedRef.current,
            });

            // Check if it's an authentication/API key error
            const isAuthError =
                aiError.includes("API key") ||
                aiError.includes("Authentication") ||
                aiError.includes("401");

            // Check if it's specifically an incorrect/invalid key error
            const isInvalidKey =
                aiError.includes("Incorrect API key") ||
                aiError.includes("Invalid API key");

            // Check if it's a rate limit error (temporary issue, don't show modal)
            const isRateLimit =
                aiError.includes("rate limit") || aiError.includes("429");

            console.log("[CodeActionMenu] Error analysis:", {
                isAuthError,
                isInvalidKey,
                isRateLimit,
            });

            // Show modal if:
            // 1. It's an auth error AND
            // 2. Either the key is invalid OR user doesn't have a key saved AND
            // 3. It's NOT a rate limit error (temporary issue)
            if (
                isAuthError &&
                !isRateLimit &&
                (isInvalidKey || !aiConfig.hasApiKey(aiConfig.selectedAI))
            ) {
                console.log("[CodeActionMenu] Opening config modal");
                setApiKeyError(aiError);
                openConfigModal();
            } else {
                console.log("[CodeActionMenu] Not showing modal - criteria not met");
            }
        }
    }, [aiError, openConfigModal, aiConfig]);

    const handleCloseResultModal = () => {
        setAiResultModalOpen(false);
        setModalResult(null);
        clearResult();
    };

    const handleReply = useCallback(
        async (
            _replyText: string,
            conversationHistory: Array<{ role: "user" | "assistant"; content: string }>,
        ): Promise<string> => {
            try {
                // Send full conversation history to API
                const response = await AISuggestions.getSuggestionByAI({
                    aiModel: aiConfig.selectedAI,
                    modelVersion: aiConfig.selectedModel,
                    messages: conversationHistory, // Full conversation context
                });

                if (response.status === 200 && response.data?.suggestion) {
                    return response.data.suggestion;
                }
                throw new Error("Failed to get AI response");
            } catch (error) {
                console.error("Error handling reply:", error);
                notifications.show({
                    position: "top-right",
                    color: "red",
                    title: "Error",
                    message: "Failed to get AI response for follow-up question",
                });
                throw error;
            }
        },
        [aiConfig.selectedAI, aiConfig.selectedModel],
    );

    const OPTIONS = getCodeLanguageOptions();

    return (
        <>
            {isShown && !aiResultModalOpen && (
                <div
                    style={{
                        position: "fixed",
                        ...position,
                        zIndex: 10,
                    }}
                >
                    <Group gap={4}>
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
                        <CopyButton
                            value={getCodeDOMNode()?.textContent || ""}
                            timeout={2000}
                        >
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

                        {/* Full Screen Button */}
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

                        {/* Collapse/Expand Button */}
                        <Tooltip label={isCollapsed ? "Expand" : "Collapse"} withArrow>
                            <ActionIcon
                                variant="filled"
                                size="md"
                                color="gray"
                                onClick={handleToggleCollapse}
                                style={{
                                    backgroundColor: "#374151",
                                    border: "1px solid rgba(255, 255, 255, 0.3)",
                                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                                }}
                            >
                                <IconChevronUp
                                    size={16}
                                    style={{
                                        transform: isCollapsed ? "rotate(180deg)" : "rotate(0deg)",
                                        transition: "transform 0.2s",
                                    }}
                                />
                            </ActionIcon>
                        </Tooltip>

                        {/* Language Selector */}
                        <Menu shadow="md" width={200} position="bottom-end">
                            <Menu.Target>
                                <Button
                                    variant="subtle"
                                    size="xs"
                                    rightSection={<IconChevronDown size={14} />}
                                    style={{
                                        backgroundColor: "rgba(0, 0, 0, 0.6)",
                                        color: "white",
                                        fontSize: "11px",
                                        padding: "4px 8px",
                                    }}
                                >
                                    {CODE_LANGUAGE_MAP[lang] || "Select Language"}
                                </Button>
                            </Menu.Target>
                            <Menu.Dropdown>
                                {OPTIONS.map(([value, label]) => (
                                    <Menu.Item
                                        key={value}
                                        onClick={() => handleLanguageChange(value)}
                                        style={{
                                            backgroundColor:
                                                value === lang ? "#e3f2fd" : "transparent",
                                        }}
                                    >
                                        {label}
                                    </Menu.Item>
                                ))}
                            </Menu.Dropdown>
                        </Menu>
                    </Group>
                </div>
            )}

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
                        "[CodeActionMenu] onSaveKeyAndGenerate called with context state:",
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

            {/* Full Screen Modal */}
            <FullScreenCodeModal
                opened={fullScreenOpen}
                onClose={() => setFullScreenOpen(false)}
                code={codeContent}
                language={CODE_LANGUAGE_MAP[lang] || "Plain Text"}
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
                    onReply={handleReply}
                />
            )}
        </>
    );
}

export function CodeActionMenuPlugin({
    anchorElem = document.body,
}: CodeActionMenuPluginProps): React.JSX.Element | null {
    return <CodeActionMenuContainer anchorElem={anchorElem} />;
}
