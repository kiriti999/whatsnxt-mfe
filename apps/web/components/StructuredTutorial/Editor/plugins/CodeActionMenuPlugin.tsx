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
import { CodeAIMenu } from "./CodeAIMenu";
import { FullScreenCodeModal } from "./FullScreenCodeModal";

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
    const codeSetRef = useRef<Set<string>>(new Set());
    const codeDOMNodeRef = useRef<HTMLElement | null>(null);

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

    const OPTIONS = getCodeLanguageOptions();

    return (
        <>
            {isShown && (
                <div
                    style={{
                        position: "fixed",
                        ...position,
                        zIndex: 10,
                    }}
                >
                    <Group gap={4}>
                        {/* AI Sparkle Menu */}
                        <Menu shadow="md" width={200} position="bottom-end">
                            <Menu.Target>
                                <Tooltip label="AI Actions" withArrow>
                                    <ActionIcon
                                        variant="subtle"
                                        size="sm"
                                        style={{
                                            backgroundColor: "rgba(0, 0, 0, 0.6)",
                                            color: "white",
                                        }}
                                    >
                                        <IconSparkles size={14} />
                                    </ActionIcon>
                                </Tooltip>
                            </Menu.Target>
                            <Menu.Dropdown>
                                <CodeAIMenu
                                    code={codeContent || getCodeDOMNode()?.textContent || ""}
                                    language={lang}
                                />
                            </Menu.Dropdown>
                        </Menu>

                        {/* Copy Button */}
                        <CopyButton
                            value={getCodeDOMNode()?.textContent || ""}
                            timeout={2000}
                        >
                            {({ copied, copy }) => (
                                <Tooltip label={copied ? "Copied!" : "Copy code"} withArrow>
                                    <ActionIcon
                                        variant="subtle"
                                        size="sm"
                                        onClick={copy}
                                        style={{
                                            backgroundColor: "rgba(0, 0, 0, 0.6)",
                                            color: copied ? "#51cf66" : "white",
                                        }}
                                    >
                                        {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
                                    </ActionIcon>
                                </Tooltip>
                            )}
                        </CopyButton>

                        {/* Full Screen Button */}
                        <Tooltip label="Full screen" withArrow>
                            <ActionIcon
                                variant="subtle"
                                size="sm"
                                onClick={handleFullScreen}
                                style={{
                                    backgroundColor: "rgba(0, 0, 0, 0.6)",
                                    color: "white",
                                }}
                            >
                                <IconMaximize size={14} />
                            </ActionIcon>
                        </Tooltip>

                        {/* Collapse/Expand Button */}
                        <Tooltip label={isCollapsed ? "Expand" : "Collapse"} withArrow>
                            <ActionIcon
                                variant="subtle"
                                size="sm"
                                onClick={handleToggleCollapse}
                                style={{
                                    backgroundColor: "rgba(0, 0, 0, 0.6)",
                                    color: "white",
                                }}
                            >
                                <IconChevronUp
                                    size={14}
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

            {/* Full Screen Modal */}
            <FullScreenCodeModal
                opened={fullScreenOpen}
                onClose={() => setFullScreenOpen(false)}
                code={codeContent}
                language={CODE_LANGUAGE_MAP[lang] || "Plain Text"}
            />
        </>
    );
}

export function CodeActionMenuPlugin({
    anchorElem = document.body,
}: CodeActionMenuPluginProps): React.JSX.Element | null {
    return <CodeActionMenuContainer anchorElem={anchorElem} />;
}
