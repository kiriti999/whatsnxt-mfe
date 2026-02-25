import {
    ActionIcon,
    Box,
    Button,
    Code,
    CopyButton,
    Divider,
    Group,
    Modal,
    ScrollArea,
    Text,
    Textarea,
    Tooltip,
    Typography,
} from "@mantine/core";
import { IconCheck, IconCopy, IconSend } from "@tabler/icons-react";
import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";

interface Message {
    id: string;
    role: "ai" | "user";
    content: string;
}

interface CodeAIResultModalProps {
    opened: boolean;
    onClose: () => void;
    title: string;
    result: string;
    isCodeResult?: boolean;
    onReply?: (
        replyText: string,
        conversationHistory: Array<{ role: "user" | "assistant"; content: string }>
    ) => Promise<string>; // Now receives full conversation history
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
    onReply,
}: CodeAIResultModalProps): React.JSX.Element {
    const [replyText, setReplyText] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const viewportRef = useRef<HTMLDivElement>(null);
    const messagesLengthRef = useRef(0);

    // Initialize conversation with the initial AI result
    useEffect(() => {
        if (opened && result) {
            setMessages([{ id: `ai-${Date.now()}`, role: "ai", content: result }]);
            setReplyText("");
        }
    }, [opened, result]);

    // Auto-scroll to bottom when new messages are added
    useEffect(() => {
        if (viewportRef.current && messages.length > messagesLengthRef.current) {
            viewportRef.current.scrollTo({
                top: viewportRef.current.scrollHeight,
                behavior: "smooth",
            });
            messagesLengthRef.current = messages.length;
        }
    }, [messages.length]);

    // Get plain text version for copying (only the latest AI message)
    const copyText = useMemo(() => {
        const latestAiMessage = [...messages].reverse().find((m) => m.role === "ai");
        if (!latestAiMessage) return "";
        return isCodeResult ? latestAiMessage.content : stripHtml(latestAiMessage.content);
    }, [messages, isCodeResult]);

    const handleReplySubmit = async () => {
        if (!replyText.trim() || !onReply) return;

        const userMessage = replyText.trim();
        setIsSubmitting(true);

        try {
            // Add user message to conversation
            const newUserMessage: Message = {
                id: `user-${Date.now()}`,
                role: "user",
                content: userMessage,
            };
            setMessages((prev) => [...prev, newUserMessage]);
            setReplyText(""); // Clear input immediately after adding to conversation

            // Build full conversation history for API (convert from our format to API format)
            const conversationHistory = [...messages, newUserMessage].map((msg) => ({
                role: msg.role === "ai" ? ("assistant" as const) : ("user" as const),
                content: msg.content,
            }));

            // Get AI response with full conversation context
            const aiResponse = await onReply(userMessage, conversationHistory);

            // Add AI response to conversation
            setMessages((prev) => [
                ...prev,
                { id: `ai-${Date.now()}`, role: "ai", content: aiResponse },
            ]);
        } catch (error) {
            console.error("Error submitting reply:", error);
            // Remove the user message if AI response failed
            setMessages((prev) => prev.slice(0, -1));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        // Submit on Cmd/Ctrl + Enter
        if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
            e.preventDefault();
            handleReplySubmit();
        }
    };

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={title}
            size="xl"
            padding="lg"
            zIndex={1000000}
        >
            <Box>
                {/* Copy button positioned above scroll area */}
                <Box
                    style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        marginBottom: "0.5rem",
                    }}
                >
                    <CopyButton value={copyText} timeout={2000}>
                        {({ copied, copy }) => (
                            <Tooltip label={copied ? "Copied!" : "Copy latest response"} withArrow>
                                <ActionIcon variant="subtle" onClick={copy}>
                                    {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                                </ActionIcon>
                            </Tooltip>
                        )}
                    </CopyButton>
                </Box>

                {/* Conversation thread */}
                <ScrollArea h={500} viewportRef={viewportRef}>
                    {messages.map((message, index) => (
                        <Box key={message.id} mb="md">
                            {message.role === "user" ? (
                                <>
                                    <Text
                                        size="xs"
                                        fw={600}
                                        c="dimmed"
                                        mb={4}
                                        style={{ textTransform: "uppercase" }}
                                    >
                                        You
                                    </Text>
                                    <Box
                                        p="sm"
                                        style={{
                                            backgroundColor: "#f1f3f5",
                                            borderRadius: "8px",
                                            borderLeft: "3px solid #228be6",
                                        }}
                                    >
                                        <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
                                            {message.content}
                                        </Text>
                                    </Box>
                                </>
                            ) : (
                                <>
                                    <Text
                                        size="xs"
                                        fw={600}
                                        c="dimmed"
                                        mb={4}
                                        style={{ textTransform: "uppercase" }}
                                    >
                                        AI Assistant
                                    </Text>
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
                                            {message.content}
                                        </Code>
                                    ) : (
                                        <Typography>
                                            <div
                                                dangerouslySetInnerHTML={{ __html: message.content }}
                                                style={{
                                                    lineHeight: "1.7",
                                                }}
                                            />
                                        </Typography>
                                    )}
                                </>
                            )}
                            {index < messages.length - 1 && <Divider my="md" />}
                        </Box>
                    ))}

                    {/* Loading indicator */}
                    {isSubmitting && (
                        <Box mb="md">
                            <Text
                                size="xs"
                                fw={600}
                                c="dimmed"
                                mb={4}
                                style={{ textTransform: "uppercase" }}
                            >
                                AI Assistant
                            </Text>
                            <Box
                                p="sm"
                                style={{
                                    backgroundColor: "#f8f9fa",
                                    borderRadius: "8px",
                                }}
                            >
                                <Text size="sm" c="dimmed" fs="italic">
                                    Thinking...
                                </Text>
                            </Box>
                        </Box>
                    )}
                </ScrollArea>

                {/* Reply input section */}
                {onReply && (
                    <Box mt="md" pt="md" style={{ borderTop: "1px solid #dee2e6" }}>
                        <Textarea
                            placeholder="Ask a follow-up question or provide additional context... (⌘+Enter to send)"
                            value={replyText}
                            onChange={(e) => setReplyText(e.currentTarget.value)}
                            onKeyDown={handleKeyDown}
                            minRows={2}
                            maxRows={4}
                            disabled={isSubmitting}
                            autosize
                        />
                        <Group justify="flex-end" mt="sm">
                            <Button
                                leftSection={<IconSend size={16} />}
                                onClick={handleReplySubmit}
                                disabled={!replyText.trim() || isSubmitting}
                                loading={isSubmitting}
                            >
                                Send
                            </Button>
                        </Group>
                    </Box>
                )}
            </Box>
        </Modal>
    );
}
