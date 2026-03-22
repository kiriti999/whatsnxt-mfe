'use client';

import React, { useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
    Stack,
    TextInput,
    Textarea,
    Text,
    Switch,
} from '@mantine/core';
import { IconEye } from '@tabler/icons-react';
import { IconPicker } from '../Form/IconPicker';

interface SectionFormData {
    title: string;
    description: string;
    icon: string;
    isFreePreview?: boolean;
}

interface SectionFormProps {
    initialData?: Partial<SectionFormData>;
    onSave: (data: SectionFormData) => Promise<void>;
    onChange?: (data: Partial<SectionFormData>) => void; // Real-time updates
    onCancel?: () => void;
    isSaving?: boolean;
    isNew?: boolean;
}

export const SectionForm: React.FC<SectionFormProps> = ({
    initialData,
    onSave,
    onChange,
    onCancel,
    isSaving,
    isNew = false,
}) => {
    const { register, handleSubmit, control, reset, watch, formState: { isDirty } } = useForm<SectionFormData>({
        defaultValues: {
            title: '',
            description: '',
            icon: 'IconFolder',
            isFreePreview: false,
            ...initialData,
        },
    });

    // Watch all fields for real-time updates
    const formValues = watch();

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
                icon: initialData.icon || 'IconFolder',
                isFreePreview: initialData.isFreePreview || false,
            });
            // Update last saved ref when initialData changes
            lastSavedRef.current = JSON.stringify({
                title: initialData.title || '',
                description: initialData.description || '',
                icon: initialData.icon || 'IconFolder',
                isFreePreview: initialData.isFreePreview || false,
            });
        }
    }, [initialData, reset]);

    // Save on unmount
    useEffect(() => {
        return () => {
            const currentValues = JSON.stringify(formValuesRef.current);
            // Check refs at the time of unmount
            if (isDirtyRef.current && formValuesRef.current.title && currentValues !== lastSavedRef.current) {
                onSaveRef.current(formValuesRef.current as SectionFormData).catch(() => { });
            }
        };
    }, []);

    // Notify parent of changes in real-time with debouncing and auto-save
    useEffect(() => {
        if (!onChange) return;

        const timeoutId = setTimeout(() => {
            const currentValues = JSON.stringify(formValues);

            // Only save if values have actually changed (isDirty) and title is not empty
            if (isDirty && formValues.title && currentValues !== lastSavedRef.current) {
                if (onChange) onChange(formValues);
                // Auto-save to backend
                onSave(formValues as SectionFormData).then(() => {
                    lastSavedRef.current = currentValues;
                }).catch(() => {
                    // Silent fail for auto-save
                });
            }
        }, 1000); // Debounce for 1 second

        return () => clearTimeout(timeoutId);
    }, [formValues, isDirty]); // Include isDirty dependency

    // onSubmit is no longer used for form submission, as auto-save is implemented
    // The form element still needs handleSubmit for validation, but the button is removed.
    const onSubmit = async (data: SectionFormData) => {
        // This function will not be called by a submit button anymore.
        // Auto-save handles the saving logic.
        // It's kept here for potential future use or if validation is needed before auto-save.
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Stack gap="md">
                <TextInput
                    label={
                        <Text fz={15}>
                            Section Title <Text component="span" c="red">*</Text>
                        </Text>
                    }
                    placeholder="e.g., Getting Started"
                    {...register('title', { required: 'Section title is required' })}
                />

                <Textarea
                    label="Section Description"
                    placeholder="Briefly describe this section"
                    rows={3}
                    {...register('description')}
                />

                <Controller
                    name="icon"
                    control={control}
                    render={({ field }) => (
                        <IconPicker
                            label="Section Icon"
                            value={field.value}
                            onChange={field.onChange}
                        />
                    )}
                />

                <Controller
                    name="isFreePreview"
                    control={control}
                    render={({ field }) => (
                        <Switch
                            label="Free Preview"
                            description="Allow students to view this section without a premium subscription"
                            checked={field.value || false}
                            onChange={(event) => field.onChange(event.currentTarget.checked)}
                            thumbIcon={<IconEye size={12} />}
                            color="teal"
                        />
                    )}
                />

                {isSaving && (
                    <Text size="sm" c="dimmed" ta="right">
                        Saving...
                    </Text>
                )}
            </Stack>
        </form>
    );
};
