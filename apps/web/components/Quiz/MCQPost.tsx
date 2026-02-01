'use client';

import React, { useState, useEffect } from 'react';
import { Box, Paper, Text, Group, Stack, Button, Badge } from '@mantine/core';
import { IconCheck, IconX, IconRefresh, IconCircleDot } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { submitQuizAnswer, getUserQuizAnswer } from '../../services/quizService';
import useAuth from '../../hooks/Authentication/useAuth';

interface MCQOption {
    id: string;
    label: string;
    text: string;
    isCorrect: boolean;
}

interface MCQData {
    question: string;
    options: MCQOption[];
    explanation: string;
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
}

interface MCQPostProps {
    postId: string;
    title: string;
    mcqData: MCQData;
    questionNumber?: number;
    onAnswerSubmit?: (isCorrect: boolean) => void;
}

export const MCQPost: React.FC<MCQPostProps> = ({
    postId,
    title,
    mcqData,
    questionNumber = 1,
    onAnswerSubmit,
}) => {
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [attempts, setAttempts] = useState(0);
    const [loading, setLoading] = useState(false);

    const { user, token } = useAuth();

    // Load previous answer on mount
    useEffect(() => {
        const loadPreviousAnswer = async () => {
            if (!token || !user) return;

            try {
                const previousAnswer = await getUserQuizAnswer(postId, token);
                if (previousAnswer) {
                    setSelectedOption(previousAnswer.selectedOptionId);
                    setIsAnswered(true);
                    setIsCorrect(previousAnswer.isCorrect);
                    setAttempts(previousAnswer.attempts);
                }
            } catch (error) {
                console.error('Error loading previous answer:', error);
            }
        };

        loadPreviousAnswer();
    }, [postId, token, user]);

    const handleOptionClick = async (optionId: string) => {
        if (isAnswered || loading) return; // Prevent changing answer after submission

        if (!token || !user) {
            notifications.show({
                title: 'Authentication Required',
                message: 'Please log in to submit your answer',
                color: 'yellow',
            });
            return;
        }

        setLoading(true);
        setSelectedOption(optionId);

        try {
            // Submit answer to backend
            const result = await submitQuizAnswer(postId, { selectedOptionId: optionId }, token);

            setIsAnswered(true);
            setIsCorrect(result.isCorrect);
            setAttempts(result.attempts);

            // Call parent callback
            onAnswerSubmit?.(result.isCorrect);

            // Show notification
            if (result.isCorrect) {
                notifications.show({
                    title: 'Correct!',
                    message: 'Great job! 🎉',
                    color: 'green',
                    icon: <IconCheck size={18} />,
                });
            } else {
                notifications.show({
                    title: 'Incorrect',
                    message: 'Try again or review the explanation',
                    color: 'red',
                    icon: <IconX size={18} />,
                });
            }
        } catch (error) {
            console.error('Error submitting answer:', error);
            notifications.show({
                title: 'Error',
                message: 'Failed to submit answer. Please try again.',
                color: 'red',
            });
            setSelectedOption(null);
        } finally {
            setLoading(false);
        }
    };

    const handleTryAgain = () => {
        setSelectedOption(null);
        setIsAnswered(false);
        setIsCorrect(null);
    };

    const getOptionStyle = (option: MCQOption) => {
        if (!isAnswered) {
            return {
                cursor: 'pointer',
                border: '1px solid var(--mantine-color-default-border)',
                backgroundColor: 'transparent',
                transition: 'all 0.2s ease',
            };
        }

        // After answering
        // Only show green if the user got it right and this is the correct option
        if (option.isCorrect && isCorrect) {
            return {
                cursor: 'default',
                border: '2px solid #40c057',
                backgroundColor: 'rgba(64, 192, 87, 0.1)',
            };
        }

        if (option.id === selectedOption && !option.isCorrect) {
            return {
                cursor: 'default',
                border: '2px solid #fa5252',
                backgroundColor: 'rgba(250, 82, 82, 0.1)',
            };
        }

        return {
            cursor: 'default',
            border: '1px solid var(--mantine-color-default-border)',
            backgroundColor: 'transparent',
            opacity: 0.6,
        };
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'EASY':
                return 'green';
            case 'MEDIUM':
                return 'yellow';
            case 'HARD':
                return 'red';
            default:
                return 'gray';
        }
    };

    return (
        <Stack gap="lg">
            {/* Question Header */}
            <Paper withBorder p="lg" radius="xs">
                <Group justify="space-between" mb="md">
                    <Group gap="sm">
                        <IconCircleDot size={20} color="var(--mantine-primary-color-filled)" />
                        <Text size="sm" fw={600}>Multiple Choice</Text>
                    </Group>
                    <Group gap="xs">
                        <Badge color={getDifficultyColor(mcqData.difficulty)} variant="light" size="sm">
                            {mcqData.difficulty}
                        </Badge>
                        {isAnswered && (
                            <Badge
                                color={isCorrect ? 'green' : 'red'}
                                variant="filled"
                                size="sm"
                            >
                                {isCorrect ? 'Correct' : 'Incorrect'}
                            </Badge>
                        )}
                    </Group>
                </Group>

                {/* Question Number and Text */}
                <Group gap="sm" align="flex-start" mb="md">
                    <Text size="lg" fw={600} c="dimmed">{questionNumber}.</Text>
                    <Text size="lg" fw={500} style={{ flex: 1 }}>
                        {mcqData.question}
                    </Text>
                </Group>

                {/* Options */}
                <Stack gap="sm">
                    {mcqData.options.map((option) => (
                        <Box
                            key={option.id}
                            p="md"
                            style={getOptionStyle(option)}
                            onClick={() => !isAnswered && handleOptionClick(option.id)}
                            className={!isAnswered ? 'mcq-option-hover' : ''}
                        >
                            <Group gap="md" wrap="nowrap">
                                {/* Option Label Circle */}
                                <Box
                                    style={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: option.isCorrect && isAnswered && isCorrect
                                            ? '#40c057'
                                            : option.id === selectedOption && !option.isCorrect && isAnswered
                                                ? '#fa5252'
                                                : 'var(--mantine-color-default-border)',
                                        color: (option.isCorrect && isAnswered && isCorrect) || (option.id === selectedOption && isAnswered)
                                            ? 'white'
                                            : 'inherit',
                                        fontWeight: 600,
                                        flexShrink: 0,
                                    }}
                                >
                                    {option.label}
                                </Box>

                                {/* Option Text */}
                                <Text size="sm" style={{ flex: 1 }}>
                                    {option.text}
                                </Text>

                                {/* Feedback Icon */}
                                {isAnswered && option.isCorrect && isCorrect && (
                                    <IconCheck size={20} color="#40c057" style={{ flexShrink: 0 }} />
                                )}
                                {isAnswered && option.id === selectedOption && !option.isCorrect && (
                                    <IconX size={20} color="#fa5252" style={{ flexShrink: 0 }} />
                                )}
                            </Group>
                        </Box>
                    ))}
                </Stack>

                {/* Try Again Button */}
                {isAnswered && !isCorrect && (
                    <Group justify="flex-end" mt="md">
                        <Button
                            variant="light"
                            leftSection={<IconRefresh size={16} />}
                            onClick={handleTryAgain}
                            size="sm"
                        >
                            Try Again
                        </Button>
                    </Group>
                )}
            </Paper>

            {/* Explanation - Only show if correct */}
            {isAnswered && isCorrect && mcqData.explanation && (
                <Paper
                    withBorder
                    p="lg"
                    radius="xs"
                    style={{
                        borderColor: '#40c057',
                        backgroundColor: 'rgba(64, 192, 87, 0.05)',
                    }}
                >
                    <Text size="sm" fw={600} mb="xs" c="green">
                        Explanation:
                    </Text>
                    <Text size="sm" c="dimmed">
                        {mcqData.explanation}
                    </Text>
                </Paper>
            )}

            <style jsx global>{`
                .mcq-option-hover:hover {
                    background-color: var(--mantine-color-default-hover) !important;
                    border-color: var(--mantine-primary-color-filled) !important;
                }
            `}</style>
        </Stack>
    );
};
