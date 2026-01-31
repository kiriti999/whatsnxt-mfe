'use client';

import React, { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import {
    Stack,
    TextInput,
    Textarea,
    Text,
    Select,
} from '@mantine/core';

interface PostFormData {
    title: string;
    description: string;
    contentFormat: 'HTML' | 'MARKDOWN';
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
            contentFormat: 'HTML',
            ...initialData,
        },
    });

    const formValues = watch();
    const contentFormat = watch('contentFormat');

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
                contentFormat: initialData.contentFormat || 'HTML',
            });
            // Update last saved ref when initialData changes
            lastSavedRef.current = JSON.stringify({
                title: initialData.title || '',
                description: initialData.description || '',
                contentFormat: initialData.contentFormat || 'HTML',
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

                <Textarea
                    label="Post Description"
                    placeholder="Brief description of this post"
                    rows={3}
                    {...register('description')}
                />

                <Select
                    label="Content Format"
                    data={[
                        { value: 'HTML', label: 'HTML' },
                        { value: 'MARKDOWN', label: 'Markdown' },
                    ]}
                    value={contentFormat}
                    onChange={(value) => setValue('contentFormat', value as 'HTML' | 'MARKDOWN')}
                />

                <Text size="sm" c="dimmed">
                    Note: The actual post content will be edited in a dedicated editor after creation.
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
