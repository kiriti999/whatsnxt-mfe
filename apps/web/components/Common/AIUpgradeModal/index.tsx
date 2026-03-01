"use client";

import {
    Alert,
    Box,
    Button,
    Group,
    Modal,
    Progress,
    Stack,
    Text,
    ThemeIcon,
} from "@mantine/core";
import {
    IconCheck,
    IconCrown,
    IconSparkles,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { AI_USAGE_LIMITS } from "@whatsnxt/constants";
import classes from "./AIUpgradeModal.module.css";

export interface AIUpgradeModalProps {
    opened: boolean;
    onClose: () => void;
    dailyUsed: number;
    dailyLimit: number;
    resetDate?: string;
}

const PREMIUM_FEATURES = [
    "Full AI Tutor access",
    "Monthly plan: 50 AI requests/day",
    "Annual plan: 100 AI requests/day",
    "Lifetime plan: 150 AI requests/day",
    "Priority support",
] as const;

export function AIUpgradeModal({
    opened,
    onClose,
    dailyUsed,
    dailyLimit,
    resetDate,
}: AIUpgradeModalProps) {
    const router = useRouter();

    const usagePercent = Math.min(
        (dailyUsed / (dailyLimit || AI_USAGE_LIMITS.FREE_DAILY_LIMIT)) * 100,
        100,
    );

    const handleUpgrade = () => {
        onClose();
        router.push("/premium");
    };

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title="Upgrade to Premium"
            centered
            size="md"
            zIndex={1000000}
        >
            <Stack gap="md">
                <Alert
                    icon={<IconCrown size={18} />}
                    title="Daily AI Limit Reached"
                    color="orange"
                    variant="light"
                >
                    <Text size="sm">
                        You&apos;ve used all {dailyLimit} free AI requests for today.
                        Upgrade to Premium to unlock unlimited AI Tutor access.
                    </Text>
                </Alert>

                <Box>
                    <Group justify="space-between" mb={4}>
                        <Text size="sm" c="dimmed">
                            Today&apos;s usage
                        </Text>
                        <Text size="sm" fw={600}>
                            {dailyUsed} / {dailyLimit}
                        </Text>
                    </Group>
                    <Progress
                        value={usagePercent}
                        size="sm"
                        color="orange"
                        className={classes.usageBar}
                    />
                    {resetDate && (
                        <Text size="xs" c="dimmed" className={classes.resetText}>
                            Resets: {new Date(resetDate).toLocaleString()}
                        </Text>
                    )}
                </Box>

                <Group justify="flex-end">
                    <Button variant="outline" onClick={onClose}>
                        Maybe Later
                    </Button>
                    <Button
                        leftSection={<IconCrown size={16} />}
                        color="violet"
                        onClick={handleUpgrade}
                    >
                        Upgrade to Premium
                    </Button>
                </Group>
            </Stack>
        </Modal>
    );
}
