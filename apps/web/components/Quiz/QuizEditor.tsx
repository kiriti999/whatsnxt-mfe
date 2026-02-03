'use client';

import React, { useState } from 'react';
import {
    Stack,
    Paper,
    Text,
    TextInput,
    Button,
    Group,
    ActionIcon,
    Select,
    Box,
    Radio,
    Divider,
    Badge,
    Modal,
} from '@mantine/core';
import { useRouter } from 'next/navigation';
import {
    IconPlus,
    IconTrash,
    IconEye,
    IconDeviceFloppy,
    IconCircleDot,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { MCQPost } from './MCQPost';
import { createMCQPost, MCQOption } from '../../services/quizService';
import useAuth from '../../hooks/Authentication/useAuth';

interface QuizEditorProps {
    sectionId: string;
    onSave?: (postId: string, result?: any) => void;
    onCancel?: () => void;
}

const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E', 'F'];

export const QuizEditor: React.FC<QuizEditorProps> = ({
    sectionId,
    onSave,
    onCancel,
}) => {
    const router = useRouter();
    const { isAuthenticated } = useAuth();
    const [title, setTitle] = useState('');
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState<MCQOption[]>([
        { id: 'a', label: 'A', text: '', isCorrect: false },
        { id: 'b', label: 'B', text: '', isCorrect: false },
        { id: 'c', label: 'C', text: '', isCorrect: false },
        { id: 'd', label: 'D', text: '', isCorrect: false },
    ]);
    const [explanation, setExplanation] = useState('');
    const [difficulty, setDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('MEDIUM');
    const [showPreview, setShowPreview] = useState(false);
    const [saving, setSaving] = useState(false);

    const addOption = () => {
        if (options.length >= 6) {
            notifications.show({
                title: 'Maximum Options Reached',
                message: 'You can add up to 6 options',
                color: 'yellow',
            });
            return;
        }

        const nextIndex = options.length;
        const newOption: MCQOption = {
            id: OPTION_LABELS[nextIndex].toLowerCase(),
            label: OPTION_LABELS[nextIndex],
            text: '',
            isCorrect: false,
        };
        setOptions([...options, newOption]);
    };

    const removeOption = (index: number) => {
        if (options.length <= 2) {
            notifications.show({
                title: 'Minimum Options Required',
                message: 'You must have at least 2 options',
                color: 'yellow',
            });
            return;
        }

        const newOptions = options.filter((_, i) => i !== index);
        setOptions(newOptions);
    };

    const updateOptionText = (index: number, text: string) => {
        const newOptions = [...options];
        newOptions[index].text = text;
        setOptions(newOptions);
    };

    const setCorrectOption = (index: number) => {
        const newOptions = options.map((opt, i) => ({
            ...opt,
            isCorrect: i === index,
        }));
        setOptions(newOptions);
    };

    // Silent validation check (no notifications) for UI state
    const isFormValid = (): boolean => {
        if (!title.trim()) return false;
        if (!question.trim()) return false;
        if (options.some(opt => !opt.text.trim())) return false;
        const correctOptions = options.filter(opt => opt.isCorrect);
        if (correctOptions.length !== 1) return false;
        return true;
    };

    // Validation with detailed error message
    const getValidationError = (): string | null => {
        if (!title.trim()) return 'Please enter a title for the quiz';
        if (!question.trim()) return 'Please enter a question';
        if (options.some(opt => !opt.text.trim())) return 'All options must have text';
        const correctOptions = options.filter(opt => opt.isCorrect);
        if (correctOptions.length !== 1) return 'Please mark exactly one option as correct';
        return null;
    };

    const handleSave = async () => {
        // Validate and show error only when user explicitly tries to save
        const validationError = getValidationError();
        if (validationError) {
            notifications.show({
                title: 'Validation Error',
                message: validationError,
                color: 'red',
            });
            return;
        }

        if (!isAuthenticated) {
            notifications.show({
                title: 'Authentication Required',
                message: 'Please log in to create a quiz',
                color: 'yellow',
            });
            return;
        }

        setSaving(true);

        try {
            const result = await createMCQPost(
                sectionId,
                {
                    title,
                    question,
                    options,
                    explanation,
                    difficulty,
                }
            );

            // Handle potential redirect to new draft
            if (result.newTutorialId) {
                notifications.show({
                    title: 'New Draft Created',
                    message: 'A new draft has been created for your edits.',
                    color: 'blue',
                    autoClose: 3000,
                });
                router.push(`/form/structured-tutorial?id=${result.newTutorialId}`);
                return;
            }

            onSave?.(result.data._id, result);
        } catch (error: any) {
            console.error('Error creating quiz:', error);
            notifications.show({
                title: 'Error',
                message: error.response?.data?.message || 'Failed to create quiz',
                color: 'red',
            });
        } finally {
            setSaving(false);
        }
    };

    const getDifficultyColor = (diff: string) => {
        switch (diff) {
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
        <>
            <Stack gap="lg">
                <Paper withBorder p="xl" radius="xs">
                    <Group justify="space-between" mb="lg">
                        <Group gap="sm">
                            <IconCircleDot size={24} color="var(--mantine-primary-color-filled)" />
                            <Text size="lg" fw={700}>Create MCQ Quiz</Text>
                        </Group>
                        <Badge color={getDifficultyColor(difficulty)} variant="light">
                            {difficulty}
                        </Badge>
                    </Group>

                    <Stack gap="md">
                        {/* Title */}
                        <TextInput
                            label="Quiz Title"
                            placeholder="Enter a descriptive title for this quiz"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            size="md"
                        />

                        {/* Difficulty */}
                        <Select
                            label="Difficulty Level"
                            placeholder="Select difficulty"
                            value={difficulty}
                            onChange={(value) => setDifficulty(value as 'EASY' | 'MEDIUM' | 'HARD')}
                            data={[
                                { value: 'EASY', label: 'Easy' },
                                { value: 'MEDIUM', label: 'Medium' },
                                { value: 'HARD', label: 'Hard' },
                            ]}
                            size="md"
                        />

                        <Divider my="sm" />

                        {/* Question */}
                        <Box>
                            <Text size="sm" fw={500} mb="xs">
                                Question <Text component="span" c="red">*</Text>
                            </Text>
                            <TextInput
                                placeholder="What does Low-Level Design (LLD) primarily focus on?"
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                required
                                size="md"
                            />
                        </Box>

                        {/* Options */}
                        <Box>
                            <Group justify="space-between" mb="xs">
                                <Text size="sm" fw={500}>
                                    Options <Text component="span" c="red">*</Text>
                                    <Text component="span" size="xs" c="dimmed" ml="xs">
                                        (Select the correct answer)
                                    </Text>
                                </Text>
                                <Button
                                    size="xs"
                                    variant="light"
                                    leftSection={<IconPlus size={14} />}
                                    onClick={addOption}
                                    disabled={options.length >= 6}
                                >
                                    Add Option
                                </Button>
                            </Group>

                            <Stack gap="sm">
                                {options.map((option, index) => (
                                    <Paper key={option.id} withBorder p="md" radius="xs">
                                        <Group gap="md" wrap="nowrap" align="flex-start">
                                            {/* Correct Answer Radio */}
                                            <Radio
                                                checked={option.isCorrect}
                                                onChange={() => setCorrectOption(index)}
                                                mt="xs"
                                            />

                                            {/* Option Label */}
                                            <Box
                                                style={{
                                                    width: 32,
                                                    height: 32,
                                                    borderRadius: '50%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    backgroundColor: option.isCorrect
                                                        ? 'var(--mantine-primary-color-filled)'
                                                        : 'var(--mantine-color-default-border)',
                                                    color: option.isCorrect ? 'white' : 'inherit',
                                                    fontWeight: 600,
                                                    flexShrink: 0,
                                                }}
                                            >
                                                {option.label}
                                            </Box>

                                            {/* Option Text Input */}
                                            <TextInput
                                                placeholder={`Option ${option.label}`}
                                                value={option.text}
                                                onChange={(e) => updateOptionText(index, e.target.value)}
                                                style={{ flex: 1 }}
                                                required
                                            />

                                            {/* Delete Button */}
                                            <ActionIcon
                                                color="red"
                                                variant="subtle"
                                                onClick={() => removeOption(index)}
                                                disabled={options.length <= 2}
                                            >
                                                <IconTrash size={18} />
                                            </ActionIcon>
                                        </Group>
                                    </Paper>
                                ))}
                            </Stack>
                        </Box>

                        <Divider my="sm" />

                        {/* Explanation */}
                        <Box>
                            <Text size="sm" fw={500} mb="xs">
                                Explanation (Optional)
                            </Text>
                            <TextInput
                                placeholder="Explain why the correct answer is correct..."
                                value={explanation}
                                onChange={(e) => setExplanation(e.target.value)}
                                size="md"
                            />
                        </Box>
                    </Stack>
                </Paper>

                {/* Action Buttons */}
                <Group justify="space-between">
                    <Button
                        variant="light"
                        leftSection={<IconEye size={18} />}
                        onClick={() => setShowPreview(true)}
                        disabled={!isFormValid()}
                    >
                        Preview
                    </Button>

                    <Group>
                        {onCancel && (
                            <Button variant="subtle" onClick={onCancel}>
                                Cancel
                            </Button>
                        )}
                        <Button
                            leftSection={<IconDeviceFloppy size={18} />}
                            onClick={handleSave}
                            loading={saving}
                        >
                            Save Quiz
                        </Button>
                    </Group>
                </Group>
            </Stack>

            {/* Preview Modal */}
            <Modal
                opened={showPreview}
                onClose={() => setShowPreview(false)}
                title="Quiz Preview"
                size="xl"
            >
                <MCQPost
                    postId="preview"
                    title={title}
                    mcqData={{
                        question,
                        options,
                        explanation,
                        difficulty,
                    }}
                    questionNumber={1}
                />
            </Modal>
        </>
    );
};
