"use client";

import {
    ActionIcon,
    CopyButton,
    Group,
    MantineProvider,
    Menu,
    Text,
    Tooltip,
} from "@mantine/core";
import {
    IconCheck,
    IconChevronUp,
    IconCopy,
    IconMaximize,
    IconSparkles,
} from "@tabler/icons-react";
import { useEffect } from "react";
import { createRoot } from "react-dom/client";

interface CodeBlockActionsProps {
    code: string;
    language: string;
    preElement: HTMLPreElement;
}

function CodeBlockActions({ code, preElement }: CodeBlockActionsProps) {
    const handleFullScreen = () => {
        // Create modal overlay
        const modal = document.createElement("div");
        modal.style.cssText = `
      position: fixed;
      inset: 0;
      background: #0d1117;
      z-index: 10000;
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
        <Group gap={4} style={{ marginBottom: "0.5rem" }}>
            {/* AI Menu */}
            <Menu shadow="md" width={200} position="bottom-start">
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
                    <Menu.Label>
                        <Text size="xs" fw={500}>
                            AI Actions
                        </Text>
                    </Menu.Label>
                    <Menu.Item onClick={() => alert("AI feature coming soon!")}>
                        Explain Code
                    </Menu.Item>
                    <Menu.Item onClick={() => alert("AI feature coming soon!")}>
                        Suggest Improvements
                    </Menu.Item>
                </Menu.Dropdown>
            </Menu>

            {/* Copy Button */}
            <CopyButton value={code} timeout={2000}>
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

            {/* Full Screen */}
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

            {/* Toggle */}
            <Tooltip label="Toggle" withArrow>
                <ActionIcon
                    variant="subtle"
                    size="sm"
                    onClick={handleToggle}
                    style={{
                        backgroundColor: "rgba(0, 0, 0, 0.6)",
                        color: "white",
                    }}
                >
                    <IconChevronUp size={14} />
                </ActionIcon>
            </Tooltip>
        </Group>
    );
}

/**
 * Enhanced code block display for blog/tutorial content
 * Adds AI, copy, fullscreen, and toggle buttons to all <pre><code> blocks
 */
export function enhanceCodeBlocks(containerElement: HTMLElement | null) {
    if (!containerElement || typeof window === "undefined") return;

    const codeBlocks = containerElement.querySelectorAll("pre code");

    codeBlocks.forEach((codeEl) => {
        const preElement = codeEl.closest("pre") as HTMLPreElement;
        if (!preElement || preElement.dataset.enhanced === "true") return;

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
      z-index: 10;
    `;
        preElement.style.paddingTop = "3rem"; // Make room for actions
        preElement.insertBefore(actionsWrapper, preElement.firstChild);

        // Render React component
        const root = createRoot(actionsWrapper);
        root.render(
            <MantineProvider>
                <CodeBlockActions
                    code={code}
                    language={language}
                    preElement={preElement}
                />
            </MantineProvider>,
        );
    });
}

/**
 * Hook to enhance code blocks in a container
 */
export function useEnhancedCodeBlocks(
    containerRef: React.RefObject<HTMLElement>,
    dependencies: unknown[] = [],
) {
    useEffect(() => {
        if (containerRef.current) {
            // Wait for highlight.js to finish
            const timer = setTimeout(() => {
                enhanceCodeBlocks(containerRef.current);
            }, 100);

            return () => clearTimeout(timer);
        }
    }, [containerRef, ...dependencies]);
}
