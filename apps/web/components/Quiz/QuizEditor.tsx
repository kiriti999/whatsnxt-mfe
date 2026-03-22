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
import { createMCQPost, updateMCQPost, MCQOption } from '../../services/quizService';
import useAuth from '../../hooks/Authentication/useAuth';
import { AISuggestionButton } from '../Common/AISuggestionButton';

const MIN_TITLE_LENGTH = 10;

const buildMCQPrompt = (quizTitle: string): string => {
    return `You are an educational assessment expert. Generate a Multiple Choice Question based on the following quiz title/topic.

Quiz Title: "${quizTitle}"

Generate a clear, educational MCQ question with 4 plausible options (one correct, three distractors), the correct answer, and a brief explanation.

Respond ONLY with valid JSON in this exact format:
{
  "question": "Your generated question here?",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": "Option B",
  "explanation": "Brief explanation of why this is correct."
}

Rules:
- The question should be directly related to the quiz title/topic.
- The correct answer must exactly match one of the options.
- Distractors should be plausible but clearly wrong.
- Keep options concise (under 100 characters each).
- The explanation should be 1-2 sentences.
- IMPORTANT: Randomize the position of the correct answer among the options. Do NOT always place it first.

IMPORTANT: Respond ONLY with the JSON object. No markdown, no extra text.`;
};

const parseAIMCQResponse = (
    rawResponse: string,
): { question: string; options: string[]; correctAnswer: string; explanation: string } | null => {
    try {
        let jsonStr = rawResponse.trim();
        if (jsonStr.startsWith('```')) {
            jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
        }
        const parsed = JSON.parse(jsonStr);
        if (!parsed.question || !parsed.options || !parsed.correctAnswer) return null;
        if (!Array.isArray(parsed.options) || parsed.options.length < 2) return null;
        return {
            question: parsed.question,
            options: parsed.options,
            correctAnswer: parsed.correctAnswer,
            explanation: parsed.explanation || '',
        };
    } catch {
        return null;
    }
};

interface QuizEditorProps {
    sectionId: string;
    postId?: string;
    initialData?: {
        title?: string;
        mcqData?: {
            question: string;
            options: Array<{ id: string; label: string; text: string; isCorrect: boolean }>;
            explanation?: string;
            difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
        };
    };
    onSave?: (postId: string, result?: any) => void;
    onCancel?: () => void;
}

const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E', 'F'];

const DEFAULT_OPTIONS: MCQOption[] = [
    { id: 'a', label: 'A', text: '', isCorrect: false },
    { id: 'b', label: 'B', text: '', isCorrect: false },
    { id: 'c', label: 'C', text: '', isCorrect: false },
    { id: 'd', label: 'D', text: '', isCorrect: false },
];

export const QuizEditor: React.FC<QuizEditorProps> = ({
    sectionId,
    postId,
    initialData,
    onSave,
    onCancel,
}) => {
    const isEditing = !!postId && !postId.startsWith('temp-');
    const router = useRouter();
    const { isAuthenticated } = useAuth();
    const [title, setTitle] = useState(initialData?.title || '');
    const [question, setQuestion] = useState(initialData?.mcqData?.question || '');
    const [options, setOptions] = useState<MCQOption[]>(
        initialData?.mcqData?.options?.length
            ? initialData.mcqData.options.map((opt, i) => ({
                id: opt.id || OPTION_LABELS[i].toLowerCase(),
                label: opt.label || OPTION_LABELS[i],
                text: opt.text,
                isCorrect: opt.isCorrect,
            }))
            : DEFAULT_OPTIONS,
    );
    const [explanation, setExplanation] = useState(initialData?.mcqData?.explanation || '');
    const [difficulty, setDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>(
        initialData?.mcqData?.difficulty || 'MEDIUM',
    );
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
            const payload = { title, question, options, explanation, difficulty };
            const result = isEditing
                ? await updateMCQPost(sectionId, postId!, payload)
                : await createMCQPost(sectionId, payload);

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

            onSave?.(isEditing ? postId! : result.data._id, result);
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
                            <Text size="lg" fw={700}>{isEditing ? 'Edit MCQ Quiz' : 'Create MCQ Quiz'}</Text>
                        </Group>
                        <Badge color={getDifficultyColor(difficulty)} variant="light">
                            {difficulty}
                        </Badge>
                    </Group>

                    <Stack gap="md">
                        {/* Title */}
                        <Box>
                            <Group gap="xs" mb={4}>
                                <Text size="sm" fw={500}>
                                    Quiz Title <Text component="span" c="red">*</Text>
                                </Text>
                                <AISuggestionButton
                                    prompt={() => buildMCQPrompt(title)}
                                    label="Generate MCQ from title"
                                    disabled={!title.trim() || title.trim().length < MIN_TITLE_LENGTH}
                                    onEmptyPrompt={() => {
                                        notifications.show({
                                            title: 'Title Required',
                                            message: `Please enter a Quiz Title (at least ${MIN_TITLE_LENGTH} characters) before generating.`,
                                            color: 'orange',
                                        });
                                    }}
                                    onSuggestion={(suggestion) => {
                                        const result = parseAIMCQResponse(suggestion);
                                        if (result) {
                                            setQuestion(result.question);
                                            const shuffled = [...result.options].sort(() => Math.random() - 0.5);
                                            const newOptions = shuffled.map((text, i) => ({
                                                id: OPTION_LABELS[i].toLowerCase(),
                                                label: OPTION_LABELS[i],
                                                text,
                                                isCorrect: text === result.correctAnswer,
                                            }));
                                            setOptions(newOptions);
                                            if (result.explanation) setExplanation(result.explanation);
                                            notifications.show({
                                                title: 'MCQ Generated',
                                                message: 'AI generated the question, options, and correct answer.',
                                                color: 'teal',
                                            });
                                        } else {
                                            notifications.show({
                                                title: 'Generation Failed',
                                                message: 'Could not parse the AI response. Please try again.',
                                                color: 'red',
                                            });
                                        }
                                    }}
                                />
                            </Group>
                            <TextInput
                                placeholder="Enter a descriptive title for this quiz of 10 characters or more to enable AI generation"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                                size="md"
                            />
                        </Box>

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
