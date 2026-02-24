import { Group, Loader, Menu, Text } from "@mantine/core";
import {
    IconBulb,
    IconLanguage,
    IconMessageCircle,
    IconRefresh,
    IconSparkles,
} from "@tabler/icons-react";
import type React from "react";
import { useState } from "react";

interface CodeAIMenuProps {
    code: string;
    language: string;
    onResult?: (result: string) => void;
}

export function CodeAIMenu({
    code,
    language,
    onResult,
}: CodeAIMenuProps): React.JSX.Element {
    const [loading, setLoading] = useState(false);

    const handleAIAction = async (action: string) => {
        setLoading(true);
        try {
            // TODO: Integrate with backend AI service
            // Example endpoint: POST /api/ai/code
            const response = await fetch("/api/ai/code", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code, language, action }),
            });

            if (response.ok) {
                const data = await response.json();
                onResult?.(data.result);
            }
        } catch (error) {
            console.error("AI action failed:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Menu.Label>
                <Group gap={4}>
                    <IconSparkles size={14} />
                    <Text size="xs" fw={500}>
                        AI Actions
                    </Text>
                </Group>
            </Menu.Label>
            <Menu.Item
                leftSection={<IconMessageCircle size={14} />}
                onClick={() => handleAIAction("explain")}
                disabled={loading}
            >
                Explain Code
            </Menu.Item>
            <Menu.Item
                leftSection={<IconBulb size={14} />}
                onClick={() => handleAIAction("improve")}
                disabled={loading}
            >
                Suggest Improvements
            </Menu.Item>
            <Menu.Item
                leftSection={<IconRefresh size={14} />}
                onClick={() => handleAIAction("refactor")}
                disabled={loading}
            >
                Refactor Code
            </Menu.Item>
            <Menu.Item
                leftSection={<IconLanguage size={14} />}
                onClick={() => handleAIAction("translate")}
                disabled={loading}
            >
                Translate Language
            </Menu.Item>
            {loading && (
                <Menu.Item disabled>
                    <Group gap={8}>
                        <Loader size="xs" />
                        <Text size="xs">Processing...</Text>
                    </Group>
                </Menu.Item>
            )}
        </>
    );
}
