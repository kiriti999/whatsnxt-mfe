import { Group, Loader, Menu, Text } from "@mantine/core";
import {
    IconBug,
    IconBulb,
    IconFileText,
    IconLanguage,
    IconMessageCircle,
    IconRefresh,
    IconSparkles,
} from "@tabler/icons-react";
import type React from "react";

interface CodeAIMenuProps {
    code: string;
    language: string;
    loading: boolean;
    onActionSelect: (
        action:
            | "explain"
            | "improve"
            | "refactor"
            | "translate"
            | "document"
            | "debug",
    ) => void;
}

export function CodeAIMenu({
    code: _code,
    language: _language,
    loading,
    onActionSelect,
}: CodeAIMenuProps): React.JSX.Element {
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
                onClick={() => onActionSelect("explain")}
                disabled={loading}
            >
                Explain Code
            </Menu.Item>
            <Menu.Item
                leftSection={<IconBulb size={14} />}
                onClick={() => onActionSelect("improve")}
                disabled={loading}
            >
                Suggest Improvements
            </Menu.Item>
            <Menu.Item
                leftSection={<IconRefresh size={14} />}
                onClick={() => onActionSelect("refactor")}
                disabled={loading}
            >
                Refactor Code
            </Menu.Item>
            <Menu.Item
                leftSection={<IconLanguage size={14} />}
                onClick={() => onActionSelect("translate")}
                disabled={loading}
            >
                Translate to TypeScript
            </Menu.Item>
            <Menu.Item
                leftSection={<IconFileText size={14} />}
                onClick={() => onActionSelect("document")}
                disabled={loading}
            >
                Add Documentation
            </Menu.Item>
            <Menu.Item
                leftSection={<IconBug size={14} />}
                onClick={() => onActionSelect("debug")}
                disabled={loading}
            >
                Find Bugs & Issues
            </Menu.Item>
            {loading && (
                <>
                    <Menu.Divider />
                    <Menu.Item disabled>
                        <Group gap={8}>
                            <Loader size="xs" />
                            <Text size="xs">Processing with AI...</Text>
                        </Group>
                    </Menu.Item>
                </>
            )}
        </>
    );
}
