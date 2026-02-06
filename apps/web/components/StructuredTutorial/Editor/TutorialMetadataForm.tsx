'use client';

import React, { useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
    Stack,
    TextInput,
    Button,
    Group,
    Select,
    FileInput,
    Text,
    Box,
} from '@mantine/core';
import { IconUpload, IconDeviceFloppy } from '@tabler/icons-react';
import Image from 'next/image';
import { IconPicker } from '../Form/IconPicker';
import { LexicalEditor } from './LexicalEditor';

interface TutorialFormData {
    title: string;
    description: string;
    lexicalState?: any;
    categoryName: string;
    subCategory: string;
    nestedSubCategory: string;
    icon: string;
    imageUrl?: string;
}

interface Category {
    value: string;
    label: string;
}

interface CategoryData {
    categoryName: string;
    subcategories: Array<{
        name: string;
        subcategories?: Array<{ name: string }>;
    }>;
}

interface TutorialMetadataFormProps {
    initialData?: Partial<TutorialFormData>;
    categories: Category[];
    categoriesData: CategoryData[]; // Raw category data with subcategories
    onSave: (data: TutorialFormData, imageFile?: File | null) => Promise<void>;
    isSaving?: boolean;
}

export const TutorialMetadataForm: React.FC<TutorialMetadataFormProps> = ({
    initialData,
    categories,
    categoriesData,
    onSave,
    isSaving,
}) => {
    const { register, handleSubmit, control, reset, watch, setValue } = useForm<TutorialFormData>({
        defaultValues: {
            title: '',
            description: '',
            categoryName: '',
            subCategory: '',
            nestedSubCategory: '',
            icon: 'IconBook',
            ...initialData,
        },
    });

    const [tutorialImage, setTutorialImage] = React.useState<File | null>(null);
    const [imagePreview, setImagePreview] = React.useState<string | null>(initialData?.imageUrl || null);

    const selectedCategory = watch('categoryName');
    const selectedSubCategory = watch('subCategory');

    // Derive subcategories from selected category
    const subcategoryOptions = useMemo(() => {
        if (!selectedCategory || !categoriesData) return [];
        const categoryData = categoriesData.find(cat => cat.categoryName === selectedCategory);
        if (categoryData && categoryData.subcategories) {
            return categoryData.subcategories.map(subcat => ({
                value: subcat.name,
                label: subcat.name,
                subcategories: subcat.subcategories,
            }));
        }
        return [];
    }, [selectedCategory, categoriesData]);

    // Derive nested subcategories from selected subcategory
    const nestedSubcategoryOptions = useMemo(() => {
        if (!selectedSubCategory || subcategoryOptions.length === 0) return [];
        const subCategoryData = subcategoryOptions.find((sub: any) => sub.value === selectedSubCategory);
        if (subCategoryData && (subCategoryData as any).subcategories) {
            return (subCategoryData as any).subcategories.map((nested: any) => ({
                value: nested.name,
                label: nested.name,
            }));
        }
        return [];
    }, [selectedSubCategory, subcategoryOptions]);

    useEffect(() => {
        console.log('🚀 :: TutorialMetadataForm :: initialData:', initialData)
        if (initialData) {
            // Priority for description in Lexical editor:
            // 1. lexicalState (as JSON string)
            // 2. description field if it looks like JSON
            // 3. description field as HTML fallback
            let initialDescription = '';
            if (initialData.lexicalState) {
                initialDescription = typeof initialData.lexicalState === 'string'
                    ? initialData.lexicalState
                    : JSON.stringify(initialData.lexicalState);
            } else if (initialData.description?.trim().startsWith('{')) {
                initialDescription = initialData.description;
            } else {
                initialDescription = initialData.description || '';
            }

            reset({
                title: initialData.title || '',
                description: initialDescription,
                categoryName: initialData.categoryName || '',
                subCategory: initialData.subCategory || '',
                nestedSubCategory: initialData.nestedSubCategory || '',
                icon: initialData.icon || 'IconBook',
            });
            if (initialData.imageUrl) {
                setImagePreview(initialData.imageUrl);
            }
        }
    }, [initialData, reset]);

    const handleImageChange = (file: File | null) => {
        if (!file) {
            setTutorialImage(null);
            setImagePreview(null);
            return;
        }

        setTutorialImage(file);
        const reader = new FileReader();
        reader.onload = (e) => {
            setImagePreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
    };

    const onSubmit = async (data: TutorialFormData) => {
        await onSave(data, tutorialImage);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Stack gap="md">
                <TextInput
                    label={
                        <Text fz={15}>
                            Title <Text component="span" c="red">*</Text>
                        </Text>
                    }
                    placeholder="Enter tutorial title"
                    {...register('title', { required: 'Title is required' })}
                />

                <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                        <Box>
                            <Text size="sm" fw={500} mb="xs">
                                Description
                            </Text>
                            <LexicalEditor
                                value={field.value}
                                onChange={field.onChange}
                                placeholder="Describe your tutorial..."
                            />
                        </Box>
                    )}
                />

                <Controller
                    name="categoryName"
                    control={control}
                    render={({ field }) => (
                        <Select
                            label="Category"
                            placeholder="Select a category"
                            data={categories}
                            value={field.value}
                            onChange={(value) => {
                                field.onChange(value);
                                // Reset dependent fields when category changes by user
                                setValue('subCategory', '');
                                setValue('nestedSubCategory', '');
                            }}
                            searchable
                            clearable
                        />
                    )}
                />

                <Controller
                    name="subCategory"
                    control={control}
                    render={({ field }) => (
                        <Select
                            label="Subcategory"
                            placeholder="Select a subcategory"
                            data={subcategoryOptions}
                            value={field.value}
                            onChange={(value) => {
                                field.onChange(value);
                                // Reset dependent fields when subcategory changes by user
                                setValue('nestedSubCategory', '');
                            }}
                            searchable
                            clearable
                            disabled={!selectedCategory || subcategoryOptions.length === 0}
                        />
                    )}
                />

                {nestedSubcategoryOptions.length > 0 && (
                    <Controller
                        name="nestedSubCategory"
                        control={control}
                        render={({ field }) => (
                            <Select
                                label="Nested Subcategory"
                                placeholder="Select a nested subcategory"
                                data={nestedSubcategoryOptions}
                                value={field.value}
                                onChange={field.onChange}
                                searchable
                                clearable
                            />
                        )}
                    />
                )}

                <Controller
                    name="icon"
                    control={control}
                    render={({ field }) => (
                        <IconPicker
                            label="Tutorial Icon"
                            value={field.value}
                            onChange={field.onChange}
                        />
                    )}
                />

                <FileInput
                    label="Tutorial Image"
                    placeholder="Upload an image"
                    accept="image/*"
                    leftSection={<IconUpload size={16} />}
                    onChange={handleImageChange}
                />

                {imagePreview && (
                    <Box>
                        <Text size="sm" fw={500} mb="xs">
                            Image Preview
                        </Text>
                        <Image
                            src={imagePreview}
                            alt="Tutorial preview"
                            width={300}
                            height={200}
                            style={{ objectFit: 'cover', borderRadius: '8px' }}
                        />
                    </Box>
                )}

                <Group justify="flex-end" mt="md">
                    <Button
                        type="submit"
                        leftSection={<IconDeviceFloppy size={18} />}
                        loading={isSaving}
                    >
                        Save Tutorial Info
                    </Button>
                </Group>
            </Stack>
        </form>
    );
};
