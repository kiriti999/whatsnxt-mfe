"use client";

import { useCallback, useState } from "react";
import { ActionIcon, Box, Button, Group, Text, Tooltip } from "@mantine/core";
import { IconArrowsMaximize, IconArrowsMinimize, IconExternalLink, IconSparkles } from "@tabler/icons-react";
import dynamic from "next/dynamic";
import "@excalidraw/excalidraw/index.css";
import type { DiagramAttempt, EvaluationResult } from "../../../../apis/v1/practice";
import classes from "./PracticePage.module.css";

const Excalidraw = dynamic(
    () => import("@excalidraw/excalidraw").then((mod) => mod.Excalidraw),
    { ssr: false },
);

interface DiagramPracticeProps {
    diagram: DiagramAttempt;
    courseSlug: string;
    onSave: (key: string, content: string) => void;
    onEvaluate: (key: string, content: string) => void;
    saving: boolean;
    evaluating: boolean;
    evaluationResult: EvaluationResult | null;
}

function FeedbackDisplay({ result }: { result: EvaluationResult | null }) {
    if (!result) return null;
    const feedbackClass = result.passed ? classes.feedbackPassed : classes.feedbackFailed;
    return (
        <Box p="md" mt="sm" className={`${classes.feedbackCard} ${feedbackClass}`}>
            <Group gap="sm" mb="xs">
                <Text fw={600} size="sm">
                    {result.passed ? "Passed" : "Needs Improvement"} — {result.score}%
                </Text>
            </Group>
            <div
                className={classes.feedbackContent}
                dangerouslySetInnerHTML={{ __html: result.feedback }}
            />
        </Box>
    );
}

const DiagramPractice = ({
    diagram,
    courseSlug,
    onSave,
    onEvaluate,
    saving,
    evaluating,
    evaluationResult,
}: DiagramPracticeProps) => {
    const [isFullscreen, setIsFullscreen] = useState(false);

    const [elements, setElements] = useState(() => {
        if (diagram.content) {
            try {
                return JSON.parse(diagram.content);
            } catch {
                return [];
            }
        }
        return [];
    });

    const handleChange = useCallback(
        (els: readonly Record<string, unknown>[]) => {
            setElements([...els]);
        },
        [],
    );

    const handleSave = useCallback(() => {
        const filtered = elements.filter(
            (el: Record<string, unknown>) => !el.isDeleted,
        );
        onSave(diagram.key, JSON.stringify(filtered));
    }, [diagram.key, elements, onSave]);

    const hasContent = elements.some(
        (el: Record<string, unknown>) => !el.isDeleted,
    );

    return (
        <Box>
            <Group justify="space-between" mb="xs">
                <Text size="xs" c="dimmed">
                    {diagram.key === "High Level Architecture"
                        ? "Re-arrange and connect the blocks to create your High Level Architecture on the canvas below or you can create one from scratch. Save your work, then click Evaluate."
                        : `Creating ${diagram.title} diagram is OPTIONAL but you can choose to practice it if you want.`}
                </Text>
                <Tooltip label="View reference solution (opens in new tab)" position="left">
                    <Button
                        component="a"
                        href={`/content/system-design/${courseSlug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        size="xs"
                        variant="light"
                        color="blue"
                        leftSection={<IconExternalLink size={14} />}
                    >
                        View Reference
                    </Button>
                </Tooltip>
            </Group>
            <Box className={isFullscreen ? classes.diagramCanvasFullscreen : classes.diagramCanvas}>
                <ActionIcon
                    className={classes.fullscreenToggle}
                    variant="filled"
                    size="md"
                    onClick={() => setIsFullscreen((prev) => !prev)}
                    title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
                >
                    {isFullscreen ? <IconArrowsMinimize size={16} /> : <IconArrowsMaximize size={16} />}
                </ActionIcon>
                <Excalidraw
                    initialData={{
                        elements,
                        appState: { isLoading: false },
                    }}
                    onChange={handleChange}
                />
            </Box>
            <Group mt="sm" justify="flex-end">
                <Button
                    size="xs"
                    variant="outline"
                    onClick={handleSave}
                    loading={saving}
                >
                    Save Diagram
                </Button>
                <Button
                    size="xs"
                    leftSection={<IconSparkles size={14} />}
                    onClick={() => {
                        const filtered = elements.filter(
                            (el: Record<string, unknown>) => !el.isDeleted,
                        );
                        onEvaluate(diagram.key, JSON.stringify(filtered));
                    }}
                    loading={evaluating}
                    disabled={!hasContent}
                >
                    Evaluate
                </Button>
            </Group>
            {evaluationResult && <FeedbackDisplay result={evaluationResult} />}
            {diagram.evaluated && !evaluationResult && (
                <FeedbackDisplay
                    result={{
                        score: diagram.score ?? 0,
                        feedback: diagram.feedback,
                        passed: diagram.passed,
                    }}
                />
            )}
        </Box>
    );
};

export default DiagramPractice;
