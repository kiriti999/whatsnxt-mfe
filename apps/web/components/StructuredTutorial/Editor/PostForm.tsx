'use client';

import React, { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import {
    Box,
    Flex,
    Paper,
    SegmentedControl,
    Stack,
    Switch,
    Text,
    TextInput,
} from '@mantine/core';
import { IconLayoutGrid, IconSparkles, IconWand } from '@tabler/icons-react';
import { LexicalEditor } from './LexicalEditor';
import { AISuggestionButton } from '../../Common/AISuggestionButton';
import { DiagramTypePicker } from '../../Visualizer/DiagramTypePicker';
import type { DiagramType } from '../../Visualizer/types';
import { wrapSvgsForLexical } from '../../../utils/wrapSvgsForLexical';

interface PostFormData {
    title: string;
    description: string;
    includeDiagram?: boolean;
    diagramMode?: string | null;
    diagramType?: string | null;
}

interface PostFormProps {
    initialData?: Partial<PostFormData>;
    onSave: (data: PostFormData) => Promise<void>;
    onChange?: (data: Partial<PostFormData>) => void; // Real-time updates
    onCancel?: () => void;
    isSaving?: boolean;
    isNew?: boolean;
}

export const PostForm: React.FC<PostFormProps> = ({
    initialData,
    onSave,
    onChange,
    onCancel,
    isSaving,
    isNew = false,
}) => {
    const { register, handleSubmit, reset, setValue, watch, formState: { isDirty } } = useForm<PostFormData>({
        defaultValues: {
            title: '',
            description: '',
            ...initialData,
        },
    });

    const formValues = watch();
    const description = watch('description');
    const [includeDiagram, setIncludeDiagram] = React.useState(
        initialData?.includeDiagram ?? false,
    );
    const [diagramMode, setDiagramMode] = React.useState<'auto' | 'manual'>(
        (initialData?.diagramMode as 'auto' | 'manual') || 'auto',
    );
    const [selectedDiagramType, setSelectedDiagramType] = React.useState<DiagramType | null>(
        (initialData?.diagramType as DiagramType) || null,
    );

    // Track last saved values to prevent duplicate saves
    const lastSavedRef = useRef<string>('');

    // Refs for cleanup/unmount
    const formValuesRef = useRef(formValues);
    const isDirtyRef = useRef(isDirty);
    const onSaveRef = useRef(onSave);

    useEffect(() => {
        formValuesRef.current = formValues;
        isDirtyRef.current = isDirty;
        onSaveRef.current = onSave;
    }, [formValues, isDirty, onSave]);

    useEffect(() => {
        if (initialData) {
            reset({
                title: initialData.title || '',
                description: initialData.description || '',
            });
            // Update last saved ref when initialData changes
            lastSavedRef.current = JSON.stringify({
                title: initialData.title || '',
                description: initialData.description || '',
            });
        }
    }, [initialData, reset]);

    // Save on unmount
    useEffect(() => {
        return () => {
            const currentValues = JSON.stringify(formValuesRef.current);
            // Check refs at the time of unmount
            if (isDirtyRef.current && formValuesRef.current.title && currentValues !== lastSavedRef.current) {
                onSaveRef.current(formValuesRef.current as PostFormData).catch(() => { });
            }
        };
    }, []);

    // Notify parent of changes in real-time with debouncing and auto-save
    useEffect(() => {
        if (!onChange) return;

        const timeoutId = setTimeout(() => {
            const currentValues = JSON.stringify(formValues);

            // Only save if values have actually changed (isDirty) and title is not empty
            // Also check equality to avoid double saves if isDirty lingers
            if (isDirty && formValues.title && currentValues !== lastSavedRef.current) {
                onChange(formValues);
                // Auto-save to backend with diagram fields
                const payload = {
                    ...formValues,
                    includeDiagram,
                    diagramMode: includeDiagram ? diagramMode : null,
                    diagramType: includeDiagram && diagramMode === 'manual' ? selectedDiagramType : null,
                } as PostFormData;
                onSave(payload).then(() => {
                    lastSavedRef.current = currentValues;
                }).catch(() => {
                    // Silent fail for auto-save
                });
            }
        }, 1000); // Debounce for 1 second

        return () => clearTimeout(timeoutId);
    }, [formValues, isDirty]); // Include isDirty dependency

    const onSubmit = async (data: PostFormData) => {
        // Auto-save handles the saving logic
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Stack gap="md">
                <TextInput
                    label={
                        <Text fz={15}>
                            Post Title <Text component="span" c="red">*</Text>
                        </Text>
                    }
                    placeholder="e.g., Introduction"
                    {...register('title', { required: 'Post title is required' })}
                />

                <div>
                    <Switch
                        label="Include AI Diagram"
                        description="AI will generate a visual diagram alongside the content"
                        checked={includeDiagram}
                        onChange={(e) => {
                            setIncludeDiagram(e.currentTarget.checked);
                            if (!e.currentTarget.checked) {
                                setSelectedDiagramType(null);
                                setDiagramMode('auto');
                            }
                        }}
                        thumbIcon={<IconSparkles size={12} />}
                        size="md"
                        mb="md"
                    />

                    {includeDiagram && (
                        <Box mb="md">
                            <SegmentedControl
                                value={diagramMode}
                                onChange={(val) => {
                                    setDiagramMode(val as 'auto' | 'manual');
                                    if (val === 'auto') setSelectedDiagramType(null);
                                }}
                                data={[
                                    {
                                        value: 'auto',
                                        label: (
                                            <Flex align="center" gap={6}>
                                                <IconWand size={16} />
                                                <span>AI Auto</span>
                                            </Flex>
                                        ),
                                    },
                                    {
                                        value: 'manual',
                                        label: (
                                            <Flex align="center" gap={6}>
                                                <IconLayoutGrid size={16} />
                                                <span>Choose Type</span>
                                            </Flex>
                                        ),
                                    },
                                ]}
                                mb="md"
                            />

                            {diagramMode === 'auto' && (
                                <Paper p="md" withBorder radius="md">
                                    <Flex align="center" gap="sm">
                                        <IconSparkles size={20} color="#7c3aed" />
                                        <Box>
                                            <Text size="sm" fw={600}>AI will choose the best diagram type</Text>
                                            <Text size="xs" c="dimmed">
                                                Based on your content, AI will automatically select and generate the most suitable diagram
                                            </Text>
                                        </Box>
                                    </Flex>
                                </Paper>
                            )}

                            {diagramMode === 'manual' && (
                                <DiagramTypePicker
                                    selectedType={selectedDiagramType}
                                    onSelect={setSelectedDiagramType}
                                />
                            )}
                        </Box>
                    )}
                </div>

                <div>
                    <Flex align="center" gap={4} mb="xs">
                        <Text size="sm" fw={500}>
                            Post Content <Text component="span" c="red">*</Text>
                        </Text>
                        <AISuggestionButton
                            prompt={() => formValues.title || ''}
                            onSuggestion={(suggestion) => {
                                const processed = includeDiagram
                                    ? wrapSvgsForLexical(suggestion)
                                    : suggestion;
                                setValue('description', processed, { shouldDirty: true });
                            }}
                            extraParams={includeDiagram ? {
                                diagramContext: {
                                    includeDiagram,
                                    diagramMode,
                                    diagramType: diagramMode === 'manual' ? selectedDiagramType : undefined,
                                },
                            } : undefined}
                        />
                    </Flex>
                    <LexicalEditor
                        value={description}
                        onChange={(state) => setValue('description', state, { shouldDirty: true })}
                        placeholder="Enter post description with rich text formatting..."
                    />
                </div>

                <Text size="sm" c="dimmed">
                    Note: Rich text content is automatically saved as you type.
                </Text>

                {isSaving && (
                    <Text size="sm" c="dimmed" ta="right">
                        Saving...
                    </Text>
                )}
            </Stack>
        </form>
    );
};
