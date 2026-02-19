'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
    Stack,
    TextInput,
    Button,
    Group,
    Select,
    Text,
    Box,
    Flex,
    Container,
    Paper,
    Title,
    ThemeIcon,
    Badge,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconRocket, IconSparkles, IconList } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CategoryAPI } from '../../apis/v1/blog/categoryApi';
import { ContentPlanAPI } from '../../apis/v1/contentPlan';
import type { ContentPlanCreatePayload } from '../../apis/v1/contentPlan';
import { LexicalEditor } from '../StructuredTutorial/Editor/LexicalEditor';
import { AISuggestionButton } from '../Common/AISuggestionButton';
import { CategorySearch } from '@whatsnxt/core-ui';
import type { CategoryPath } from '@whatsnxt/core-ui';
import classes from './AutoCreateForm.module.css';

interface AutoCreateFormData {
    title: string;
    description: string;
    categoryName: string;
    subCategory: string;
    nestedSubCategory: string;
}

interface CategoryOption {
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

export function AutoCreateForm() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [categories, setCategories] = useState<CategoryOption[]>([]);
    const [categoriesData, setCategoriesData] = useState<CategoryData[]>([]);

    const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm<AutoCreateFormData>({
        defaultValues: {
            title: '',
            description: '',
            categoryName: '',
            subCategory: '',
            nestedSubCategory: '',
        },
    });

    const selectedCategory = watch('categoryName');
    const selectedSubCategory = watch('subCategory');
    const descriptionValue = watch('description');

    // Fetch categories on mount
    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = useCallback(async () => {
        try {
            const data = await CategoryAPI.getCategories();
            if (data && Array.isArray(data)) {
                setCategoriesData(data);
                setCategories(data.map((cat: CategoryData) => ({
                    value: cat.categoryName,
                    label: cat.categoryName,
                })));
            }
        } catch {
            notifications.show({
                position: 'bottom-right',
                color: 'red',
                title: 'Error',
                message: 'Failed to load categories',
            });
        }
    }, []);

    // Derive subcategory options
    const subcategoryOptions = useMemo(() => {
        if (!selectedCategory || !categoriesData.length) return [];
        const categoryData = categoriesData.find(cat => cat.categoryName === selectedCategory);
        if (!categoryData?.subcategories) return [];

        const seen = new Set<string>();
        return categoryData.subcategories
            .filter(sub => {
                if (seen.has(sub.name)) return false;
                seen.add(sub.name);
                return true;
            })
            .map(sub => ({
                value: sub.name,
                label: sub.name,
                subcategories: sub.subcategories,
            }));
    }, [selectedCategory, categoriesData]);

    // Derive nested subcategory options
    const nestedSubcategoryOptions = useMemo(() => {
        if (!selectedSubCategory || !subcategoryOptions.length) return [];
        const subData = subcategoryOptions.find(sub => sub.value === selectedSubCategory);
        if (!subData?.subcategories) return [];

        const seen = new Set<string>();
        return subData.subcategories
            .filter((nested: any) => {
                if (seen.has(nested.name)) return false;
                seen.add(nested.name);
                return true;
            })
            .map((nested: any) => ({
                value: nested.name,
                label: nested.name,
            }));
    }, [selectedSubCategory, subcategoryOptions]);

    // Extract topic preview from description (client-side simple extraction)
    const previewTopics = useMemo(() => {
        if (!descriptionValue) return [];
        const titles: string[] = [];

        // Try parsing as HTML for <li> items
        const liMatches = descriptionValue.match(/<li[^>]*>(.*?)<\/li>/gi) || [];
        for (const match of liMatches) {
            const text = match.replace(/<[^>]*>/g, '').trim();
            if (text) titles.push(text);
        }

        // Also extract headings
        const headingMatches = descriptionValue.match(/<h[23][^>]*>(.*?)<\/h[23]>/gi) || [];
        for (const match of headingMatches) {
            const text = match.replace(/<[^>]*>/g, '').trim();
            if (text && !titles.includes(text)) titles.push(text);
        }

        // Try parsing as Lexical JSON for text nodes
        if (titles.length === 0 && descriptionValue.trim().startsWith('{')) {
            try {
                const parsed = JSON.parse(descriptionValue);
                extractLexicalListItems(parsed, titles);
            } catch {
                // Not valid JSON, skip
            }
        }

        return titles.slice(0, 20);
    }, [descriptionValue]);

    const onSubmit = useCallback(async (data: AutoCreateFormData) => {
        setIsSubmitting(true);
        try {
            const payload: ContentPlanCreatePayload = {
                title: data.title,
                description: data.description,
                categoryName: data.categoryName,
                subCategory: data.subCategory || undefined,
                nestedSubCategory: data.nestedSubCategory || undefined,
            };

            await ContentPlanAPI.create(payload);

            notifications.show({
                position: 'bottom-right',
                color: 'green',
                title: 'Content Plan Created',
                message: 'Your content plan has been created. Topics will be processed daily.',
            });

            router.push('/form');
        } catch (error: any) {
            const message = error?.response?.data?.message || error?.message || 'Failed to create content plan';
            notifications.show({
                position: 'bottom-right',
                color: 'red',
                title: 'Error',
                message,
            });
        } finally {
            setIsSubmitting(false);
        }
    }, [router]);

    return (
        <Container size="md" py={{ base: 'xl', sm: '3rem' }}>
            <Stack gap="xl" align="center">
                {/* Header */}
                <Stack gap="xs" align="center" className={classes.header}>
                    <Group justify="center" gap="xs">
                        <ThemeIcon
                            size="xl"
                            radius="md"
                            variant="gradient"
                            gradient={{ from: 'teal', to: 'lime', deg: 135 }}
                        >
                            <IconRocket size={24} />
                        </ThemeIcon>
                        <Title order={1} size="h2" className={classes.headerTitle}>
                            Auto Create Content
                        </Title>
                    </Group>
                    <Text size="lg" className={classes.headerDescription}>
                        Generate blog posts with AI from a structured topic outline
                    </Text>
                    <Button
                        component={Link}
                        href="/form/auto-create/dashboard"
                        variant="subtle"
                        color="teal"
                        leftSection={<IconList size={16} />}
                        size="sm"
                    >
                        View My Plans
                    </Button>
                </Stack>

                {/* Form */}
                <Paper shadow="sm" p="xl" radius="md" w="100%" className={classes.formPaper}>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <Stack gap="md">
                            {/* Title */}
                            <TextInput
                                label={
                                    <Text className={classes.labelText}>
                                        Title <Text component="span" className={classes.requiredStar}>*</Text>
                                    </Text>
                                }
                                placeholder="Enter your content plan title"
                                maxLength={200}
                                {...register('title', { required: 'Title is required' })}
                                error={errors.title?.message}
                            />

                            {/* Description with Lexical + AI Sparkle */}
                            <Controller
                                name="description"
                                control={control}
                                rules={{ required: 'Description is required' }}
                                render={({ field }) => (
                                    <Box>
                                        <Flex className={classes.descriptionLabel}>
                                            <Text size="sm" fw={500}>
                                                Description / Topic Outline <Text component="span" className={classes.requiredStar}>*</Text>
                                            </Text>
                                            <AISuggestionButton
                                                prompt={() => {
                                                    const title = watch('title');
                                                    return title
                                                        ? `Generate a detailed topic outline with 5-15 topics for a blog series about: ${title}. Format as a bulleted list with clear, SEO-friendly topic titles.`
                                                        : '';
                                                }}
                                                onSuggestion={(text) => field.onChange(text)}
                                                label="Generate topic outline with AI"
                                                onEmptyPrompt={() => {
                                                    notifications.show({
                                                        position: 'bottom-right',
                                                        color: 'orange',
                                                        title: 'Title Required',
                                                        message: 'Please enter a title first to generate a topic outline',
                                                    });
                                                }}
                                            />
                                        </Flex>
                                        <LexicalEditor
                                            value={field.value}
                                            onChange={field.onChange}
                                            placeholder="Add a structured outline of topics. Use bullet points or headings for each topic..."
                                        />
                                        {errors.description && (
                                            <Text size="xs" c="red" mt={4}>{errors.description.message}</Text>
                                        )}
                                    </Box>
                                )}
                            />

                            {/* Topic Preview */}
                            {previewTopics.length > 0 && (
                                <Box className={classes.topicPreviewBox}>
                                    <Flex align="center" gap="xs" mb="sm">
                                        <Text size="sm" fw={600}>Extracted Topics Preview</Text>
                                        <Badge size="sm" variant="light" color="teal" className={classes.topicCountBadge}>
                                            {previewTopics.length} topics
                                        </Badge>
                                    </Flex>
                                    <Flex gap="xs" wrap="wrap">
                                        {previewTopics.map((topic, idx) => (
                                            <Text key={idx} className={classes.topicChip}>
                                                {topic}
                                            </Text>
                                        ))}
                                    </Flex>
                                </Box>
                            )}

                            {/* Category Search */}
                            <CategorySearch
                                categories={categoriesData}
                                onSelect={(path: CategoryPath) => {
                                    setValue('categoryName', path.category);
                                    setValue('subCategory', path.subCategory);
                                    setValue('nestedSubCategory', path.nestedSubCategory);
                                }}
                            />

                            {/* Category Dropdown */}
                            <Controller
                                name="categoryName"
                                control={control}
                                rules={{ required: 'Category is required' }}
                                render={({ field }) => (
                                    <Select
                                        label="Category"
                                        placeholder="Select a category"
                                        data={categories}
                                        value={field.value}
                                        onChange={(value) => {
                                            field.onChange(value);
                                            setValue('subCategory', '');
                                            setValue('nestedSubCategory', '');
                                        }}
                                        searchable
                                        clearable
                                        error={errors.categoryName?.message}
                                    />
                                )}
                            />

                            {/* Subcategory Dropdown */}
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
                                            setValue('nestedSubCategory', '');
                                        }}
                                        searchable
                                        clearable
                                        disabled={!selectedCategory || subcategoryOptions.length === 0}
                                    />
                                )}
                            />

                            {/* Nested Subcategory Dropdown */}
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

                            {/* Submit */}
                            <Group justify="flex-end" mt="md">
                                <Button
                                    type="submit"
                                    loading={isSubmitting}
                                    leftSection={<IconSparkles size={18} />}
                                    variant="gradient"
                                    gradient={{ from: 'teal', to: 'lime', deg: 135 }}
                                    size="md"
                                >
                                    Create Content Plan
                                </Button>
                            </Group>
                        </Stack>
                    </form>
                </Paper>
            </Stack>
        </Container>
    );
}

/**
 * Recursively extract list item text from a Lexical editor JSON state.
 */
function extractLexicalListItems(node: any, titles: string[]): void {
    if (!node) return;

    if (node.type === 'listitem' && node.children) {
        const text = node.children
            .filter((child: any) => child.type === 'text')
            .map((child: any) => child.text)
            .join('')
            .trim();
        if (text) titles.push(text);
    }

    if (node.children && Array.isArray(node.children)) {
        for (const child of node.children) {
            extractLexicalListItems(child, titles);
        }
    }

    if (node.root) {
        extractLexicalListItems(node.root, titles);
    }
}

export default AutoCreateForm;
