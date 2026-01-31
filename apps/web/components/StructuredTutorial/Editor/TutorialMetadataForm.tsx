'use client';

import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
    Stack,
    TextInput,
    Textarea,
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

interface TutorialFormData {
    title: string;
    description: string;
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
    const [subcategories, setSubcategories] = React.useState<Category[]>([]);
    const [nestedSubcategories, setNestedSubcategories] = React.useState<Category[]>([]);

    const selectedCategory = watch('categoryName');
    const selectedSubCategory = watch('subCategory');

    useEffect(() => {
        if (initialData) {
            reset({
                title: initialData.title || '',
                description: initialData.description || '',
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

    // Update subcategories when category changes
    useEffect(() => {
        if (selectedCategory && categoriesData && Array.isArray(categoriesData)) {
            const categoryData = categoriesData.find(cat => cat.categoryName === selectedCategory);
            if (categoryData && categoryData.subcategories) {
                const subcatOptions = categoryData.subcategories.map(subcat => ({
                    value: subcat.name,
                    label: subcat.name,
                    subcategories: subcat.subcategories,
                }));
                setSubcategories(subcatOptions);
            } else {
                setSubcategories([]);
            }
            // Reset subcategory and nested subcategory when category changes
            setValue('subCategory', '');
            setValue('nestedSubCategory', '');
            setNestedSubcategories([]);
        } else {
            setSubcategories([]);
            setNestedSubcategories([]);
        }
    }, [selectedCategory, categoriesData, setValue]);

    // Update nested subcategories when subcategory changes
    useEffect(() => {
        if (selectedSubCategory && subcategories.length > 0) {
            const subCategoryData = subcategories.find((sub: any) => sub.value === selectedSubCategory);
            if (subCategoryData && (subCategoryData as any).subcategories) {
                const nestedOptions = (subCategoryData as any).subcategories.map((nested: any) => ({
                    value: nested.name,
                    label: nested.name,
                }));
                setNestedSubcategories(nestedOptions);
            } else {
                setNestedSubcategories([]);
            }
            // Reset nested subcategory when subcategory changes
            setValue('nestedSubCategory', '');
        } else {
            setNestedSubcategories([]);
        }
    }, [selectedSubCategory, subcategories, setValue]);

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

                <Textarea
                    label="Description"
                    placeholder="Describe your tutorial"
                    rows={4}
                    {...register('description')}
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
                            onChange={field.onChange}
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
                            data={subcategories}
                            value={field.value}
                            onChange={field.onChange}
                            searchable
                            clearable
                            disabled={!selectedCategory || subcategories.length === 0}
                        />
                    )}
                />

                {nestedSubcategories.length > 0 && (
                    <Controller
                        name="nestedSubCategory"
                        control={control}
                        render={({ field }) => (
                            <Select
                                label="Nested Subcategory"
                                placeholder="Select a nested subcategory"
                                data={nestedSubcategories}
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
