"use client";

import { useCallback, useState } from "react";
import { Box, Button, Group, Text } from "@mantine/core";
import { IconSparkles } from "@tabler/icons-react";
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
            <Text size="sm">{result.feedback}</Text>
        </Box>
    );
}

const DiagramPractice = ({
    diagram,
    onSave,
    onEvaluate,
    saving,
    evaluating,
    evaluationResult,
}: DiagramPracticeProps) => {
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
            <Text size="xs" c="dimmed" mb="xs">
                Create your {diagram.title} diagram using the canvas below. Save your work, then
                click Evaluate.
            </Text>
            <Box className={classes.diagramCanvas}>
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
