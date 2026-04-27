'use client';

import { useState, useCallback } from 'react';
import { Container, Title, Button, Group, Box, TextInput, Select, Flex, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import labApi from '@/apis/lab.api';
import useAuth from '@/hooks/Authentication/useAuth';
import { LabPricingForm } from '@/components/Lab/LabPricingForm';
import { SUCCESS_MESSAGES, ERROR_MESSAGES, ROUTE_PATHS, VALIDATION } from '@whatsnxt/constants';
import { AISuggestionButton } from '@/components/Common/AISuggestionButton';
import { CategorySearch, type CategoryPath } from '@whatsnxt/core-ui';
import { LexicalEditor } from '@/components/StructuredTutorial/Editor/LexicalEditor';

function LabCreationPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const isTrainer = isAuthenticated && user?.role === 'trainer';
  const instructorId = user?._id || '';

  const [pricing, setPricing] = useState<{ purchaseType: 'free' | 'paid'; price?: number }>({
    purchaseType: 'free'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subCategories, setSubCategories] = useState<Array<{ name: string; subcategories?: Array<{ name: string }> }>>([]);
  const [nestedSubCategories, setNestedSubCategories] = useState<Array<{ name: string }>>([]);
  const [descriptionEditorKey, setDescriptionEditorKey] = useState(0);

  const { data: categories = [] } = useQuery({
    queryKey: ['labCategories'],
    queryFn: async () => {
      const response = await labApi.getCategories();
      return response?.categories || [];
    },
  });

  const categoryOptions = categories.map((cat: { categoryName: string; subcategories?: any[] }) => ({
    value: cat.categoryName,
    label: cat.categoryName,
    subcategories: cat.subcategories || [],
  }));

  const subCategoryOptions = subCategories.map((sub) => ({
    value: sub.name,
    label: sub.name,
    subcategories: sub.subcategories || [],
  }));

  const nestedSubCategoryOptions = nestedSubCategories.map((nested) => ({
    value: nested.name,
    label: nested.name,
  }));

  const form = useForm({
    initialValues: {
      name: '',
      description: '',
      labType: '',
      subCategory: '',
      nestedSubCategory: '',
    },
    validate: {
      name: (value) => (value ? null : 'Lab name is required'),
      labType: (value) => (value ? null : 'Category is required'),
    },
  });

  const handleCategorySearch = useCallback((path: CategoryPath) => {
    form.setFieldValue('labType', path.category);
    form.setFieldValue('subCategory', path.subCategory);
    form.setFieldValue('nestedSubCategory', path.nestedSubCategory);
    handleCategoryChange(path.category);
  }, [form]);

  const handleCategoryChange = (value: string | null) => {
    form.setFieldValue('labType', value || '');
    form.setFieldValue('subCategory', '');
    form.setFieldValue('nestedSubCategory', '');
    setNestedSubCategories([]);

    const selected = categoryOptions.find((opt: { value: string }) => opt.value === value);
    setSubCategories(selected?.subcategories || []);
  };

  const handleSubCategoryChange = (value: string | null) => {
    form.setFieldValue('subCategory', value || '');
    form.setFieldValue('nestedSubCategory', '');

    const selected = subCategoryOptions.find((opt: { value: string }) => opt.value === value);
    setNestedSubCategories(selected?.subcategories || []);
  };

  const handleSubmit = async (values: { name: string; description: string; labType: string; subCategory: string; nestedSubCategory: string }) => {
    // Validate pricing for paid labs
    if (pricing.purchaseType === 'paid' && (!pricing.price || pricing.price < 10 || pricing.price > 100000)) {
      notifications.show({
        title: 'Invalid Pricing',
        message: 'Please set a valid price between ₹10 and ₹100,000 for paid labs',
        color: 'red',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await labApi.createLab({
        ...values,
        subCategory: values.subCategory || undefined,
        nestedSubCategory: values.nestedSubCategory || undefined,
        instructorId,
        pricing,
      });
      const newLab = response.data;

      // Check if backend returned defaultPageId (for new streamlined flow)
      if (newLab.defaultPageId) {
        notifications.show({
          title: 'Success',
          message: SUCCESS_MESSAGES.LAB_CREATED_REDIRECTING,
          color: 'green',
          autoClose: 2000,
        });
        // Redirect to page editor for the default page
        router.push(ROUTE_PATHS.LAB_PAGE_EDITOR(newLab.id, newLab.defaultPageId));
      } else {
        // Fallback: If backend doesn't return defaultPageId (old behavior)
        notifications.show({
          title: 'Success',
          message: SUCCESS_MESSAGES.LAB_CREATED,
          color: 'green',
        });
        router.push(ROUTE_PATHS.LAB_DETAIL(newLab.id));
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || ERROR_MESSAGES.LAB_CREATION_FAILED;
      notifications.show({
        title: 'Error',
        message: ERROR_MESSAGES.LAB_CREATION_FAILED,
        color: 'red',
        autoClose: false,
      });
      console.error('Failed to create lab:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Container size="lg" py="xl">
        <Title order={1} mb="md">Create Lab</Title>
        <Box c="red">Please log in to create labs.</Box>
      </Container>
    );
  }

  if (!isTrainer) {
    return (
      <Container size="lg" py="xl">
        <Title order={1} mb="md">Create Lab</Title>
        <Box c="red">Only trainers can create labs.</Box>
      </Container>
    );
  }

  return (
    <Container size="lg" py="xl">
      <Title order={3} mb="xl">Create New Lab</Title>
      <Box maw={600} mx="auto">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <TextInput
            label="Lab Name"
            placeholder="e.g., AWS Cloud Fundamentals"
            {...form.getInputProps('name')}
            required
            mb="md"
          />

          {/* Description with AI Sparkle Button */}
          <Box mb="md">
            <Flex align="center" gap={4} mb={4}>
              <Text size="sm" fw={500}>Description <Text component="span" c="red">*</Text></Text>
              <AISuggestionButton
                prompt={() =>
                  form.values.name
                    ? `Write a concise lab description for "${form.values.name}". Hard limit: keep the response under ${VALIDATION.MAX_DESCRIPTION_LENGTH} characters total (including any HTML markup). Do not return a full HTML document — only the inner content.`
                    : ''
                }
                onSuggestion={(suggestion) => {
                  form.setFieldValue('description', suggestion);
                  setDescriptionEditorKey((k) => k + 1);
                }}
              />
            </Flex>
            <LexicalEditor
              key={descriptionEditorKey}
              value={form.values.description}
              onChange={(value) => form.setFieldValue('description', value)}
              placeholder="Brief description of the lab"
            />
          </Box>

          {/* Category Search */}
          {categories.length > 0 && (
            <Box mb="md">
              <CategorySearch
                categories={categories as any}
                onSelect={handleCategorySearch}
              />
            </Box>
          )}

          <Select
            label="Category"
            placeholder="Select category"
            data={categoryOptions}
            searchable
            value={form.values.labType}
            onChange={handleCategoryChange}
            error={form.errors.labType as string}
            required
            mb="md"
          />
          {subCategoryOptions.length > 0 && (
            <Select
              label="Sub Category"
              placeholder="Select sub category"
              data={subCategoryOptions}
              searchable
              value={form.values.subCategory}
              onChange={handleSubCategoryChange}
              error={form.errors.subCategory as string}
              mb="md"
            />
          )}
          {nestedSubCategoryOptions.length > 0 && (
            <Select
              label="Topic"
              placeholder="Select topic"
              data={nestedSubCategoryOptions}
              searchable
              value={form.values.nestedSubCategory}
              onChange={(value) => form.setFieldValue('nestedSubCategory', value || '')}
              error={form.errors.nestedSubCategory as string}
              mb="md"
            />
          )}

          <Box mt="xl">
            <LabPricingForm
              initialPricing={pricing}
              onChange={setPricing}
            />
          </Box>
          <Group justify="flex-end" mt="xl">
            <Button variant="default" onClick={() => router.push(ROUTE_PATHS.LABS_LIST)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting}>
              Create Lab
            </Button>
          </Group>
        </form>
      </Box>
    </Container>
  );
}

export default LabCreationPage;