'use client';

import React, { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import {
    Stack,
    TextInput,
    Text,
    Flex,
} from '@mantine/core';
import { LexicalEditor } from './LexicalEditor';
import { AISuggestionButton } from '../../Common/AISuggestionButton';

interface PostFormData {
    title: string;
    description: string; // Now uses Lexical editor
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
                // Auto-save to backend
                onSave(formValues as PostFormData).then(() => {
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
                    <Flex align="center" gap={4} mb="xs">
                        <Text size="sm" fw={500}>
                            Post Content <Text component="span" c="red">*</Text>
                        </Text>
                        <AISuggestionButton
                            prompt={() => formValues.title || ''}
                            onSuggestion={(text) => setValue('description', text, { shouldDirty: true })}
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
