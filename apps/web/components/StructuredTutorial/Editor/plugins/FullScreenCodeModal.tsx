import {
    ActionIcon,
    Box,
    CopyButton,
    Group,
    Text,
    Tooltip,
} from "@mantine/core";
import { IconCheck, IconCopy, IconX } from "@tabler/icons-react";
import type React from "react";
import { useEffect } from "react";

interface FullScreenCodeModalProps {
    opened: boolean;
    onClose: () => void;
    code: string;
    language: string;
}

export function FullScreenCodeModal({
    opened,
    onClose,
    code,
    language,
}: FullScreenCodeModalProps): React.JSX.Element | null {
    // Handle ESC key to close
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        if (opened) {
            document.addEventListener("keydown", handleEsc);
            document.body.style.overflow = "hidden";
        }
        return () => {
            document.removeEventListener("keydown", handleEsc);
            document.body.style.overflow = "";
        };
    }, [opened, onClose]);

    if (!opened) return null;

    return (
        <Box
            style={{
                position: "fixed",
                inset: 0,
                backgroundColor: "#0d1117",
                zIndex: 10000,
                display: "flex",
                flexDirection: "column",
            }}
        >
            {/* Header Bar */}
            <Box
                style={{
                    padding: "1rem 1.5rem",
                    borderBottom: "1px solid #30363d",
                    backgroundColor: "#161b22",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <Text size="sm" fw={600} c="white">
                    {language.toUpperCase()} Code
                </Text>
                <Group gap="xs">
                    <CopyButton value={code} timeout={2000}>
                        {({ copied, copy }) => (
                            <Tooltip label={copied ? "Copied!" : "Copy code"} withArrow>
                                <ActionIcon
                                    color={copied ? "teal" : "gray"}
                                    variant="subtle"
                                    onClick={copy}
                                    size="lg"
                                    c="white"
                                >
                                    {copied ? <IconCheck size={18} /> : <IconCopy size={18} />}
                                </ActionIcon>
                            </Tooltip>
                        )}
                    </CopyButton>
                    <Tooltip label="Close (ESC)" withArrow>
                        <ActionIcon variant="subtle" onClick={onClose} size="lg" c="white">
                            <IconX size={18} />
                        </ActionIcon>
                    </Tooltip>
                </Group>
            </Box>

            {/* Code Content */}
            <Box
                style={{
                    flex: 1,
                    overflow: "auto",
                    padding: "2rem",
                    backgroundColor: "#0d1117",
                }}
            >
                <pre
                    style={{
                        backgroundColor: "#0d1117",
                        color: "#c9d1d9",
                        padding: 0,
                        margin: 0,
                        fontSize: "16px",
                        lineHeight: "1.7",
                        fontFamily:
                            "'JetBrains Mono', 'Fira Code', 'SF Mono', Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
                        whiteSpace: "pre",
                        overflowX: "auto",
                        tabSize: 2,
                    }}
                >
                    <code style={{ color: "inherit" }}>{code}</code>
                </pre>
            </Box>
        </Box>
    );
}
