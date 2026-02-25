import {
    ActionIcon,
    Box,
    Code,
    CopyButton,
    Modal,
    ScrollArea,
    Tooltip,
    Typography,
} from "@mantine/core";
import { IconCheck, IconCopy } from "@tabler/icons-react";
import type React from "react";
import { useMemo } from "react";

interface CodeAIResultModalProps {
    opened: boolean;
    onClose: () => void;
    title: string;
    result: string;
    isCodeResult?: boolean;
}

// Strip HTML tags to get plain text for copying
function stripHtml(html: string): string {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
}

export function CodeAIResultModal({
    opened,
    onClose,
    title,
    result,
    isCodeResult = false,
}: CodeAIResultModalProps): React.JSX.Element {
    // Get plain text version for copying
    const copyText = useMemo(() => {
        return isCodeResult ? result : stripHtml(result);
    }, [result, isCodeResult]);

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={title}
            size="xl"
            padding="lg"
            zIndex={1000000}
        >
            <Box style={{ position: "relative" }}>
                <CopyButton value={copyText} timeout={2000}>
                    {({ copied, copy }) => (
                        <Tooltip label={copied ? "Copied!" : "Copy result"} withArrow>
                            <ActionIcon
                                variant="subtle"
                                onClick={copy}
                                style={{
                                    position: "absolute",
                                    top: 0,
                                    right: 0,
                                }}
                            >
                                {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                            </ActionIcon>
                        </Tooltip>
                    )}
                </CopyButton>

                <ScrollArea h={500}>
                    {isCodeResult ? (
                        <Code
                            block
                            style={{
                                backgroundColor: "#1e1e1e",
                                color: "#d4d4d4",
                                padding: "1rem",
                                borderRadius: "6px",
                                fontSize: "14px",
                                lineHeight: "1.6",
                                fontFamily:
                                    "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace",
                            }}
                        >
                            {result}
                        </Code>
                    ) : (
                        <Typography>
                            <div
                                dangerouslySetInnerHTML={{ __html: result }}
                                style={{
                                    lineHeight: "1.7",
                                }}
                            />
                        </Typography>
                    )}
                </ScrollArea>
            </Box>
        </Modal>
    );
}
