/**
 * StructuredTutorialForm Component
 * 
 * Multi-page tutorial form with REQUIRED section management.
 * Key differences from regular TutorialForm:
 * - Requires at least 1 section to be linked
 * - Each page must be assigned to a section
 * - Uses ContentSectionManager for section management
 */

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { notifications } from '@mantine/notifications';
import { useRouter } from 'next/navigation';
import {
  Alert,
  Box,
  Button,
  Container,
  FileInput,
  Grid,
  Group,
  Select,
  Stack,
  Text,
  TextInput,
  Title,
  LoadingOverlay,
  Loader,
  Paper,
  Divider,
  Badge,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconUpload, IconAlertCircle, IconCheck, IconPlus, IconTrash } from '@tabler/icons-react';
import { StructuredTutorialAPI, StructuredTutorialCreateInput, StructuredTutorialPage } from '../../../apis/v1/structuredTutorialApi';
import { RichTextEditor } from '../../RichTextEditor';
import { ContentSectionManager } from '../../sections/ContentSectionManager';
import { getCategoryId } from '../../../utils/form';
import { uploadImage } from './util';
import { useImageSafety } from '../../../hooks/useImageSafety';
import { validateFile, DEFAULT_VALIDATION_OPTIONS } from '../../../utils/imageValidation';
import { ImageRequirements } from './ImageRequirements';
import Pagination from '../../Common/Pagination';

interface Category {
  categoryName: string;
  subcategories?: any[];
}

interface StructuredTutorialFormProps {
  categories: Category[];
  edit?: any;
}

const StructuredTutorialForm: React.FC<StructuredTutorialFormProps> = ({ categories, edit }) => {
  const router = useRouter();
  const [isVisible, { open, close }] = useDisclosure(false);
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [nestedSubCategories, setNestedSubCategories] = useState<any[]>([]);
  const [tutorialImage, setTutorialImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [validationSuccess, setValidationSuccess] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pages, setPages] = useState<StructuredTutorialPage[]>(edit?.pages || [
    { title: '', description: '', sectionId: '', sectionOrder: 0 }
  ]);
  
  // CRITICAL: Section management state
  const [linkedSectionIds, setLinkedSectionIds] = useState<string[]>(edit?.linkedSectionIds || []);
  const [sectionError, setSectionError] = useState<string | null>(null);

  // Image safety hook
  const {
    scanImageClientSide,
    preloadModel,
    isScanning,
    isModelLoading,
    error: scanError,
    clearError
  } = useImageSafety();

  const {
    setValue,
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      title: edit?.title || '',
      categoryName: edit?.categoryName || '',
      subCategory: edit?.subCategory || '',
      nestedSubCategory: edit?.nestedSubCategory || '',
      tutorialImagePreview: ''
    },
  });

  const categoryValue = watch('categoryName');

  // Preload AI model
  useEffect(() => {
    preloadModel().catch(console.warn);
  }, [preloadModel]);

  // Handle category changes
  useEffect(() => {
    if (!categoryValue) return;
    
    const selectedCategory = categories.find((cat) => cat.categoryName === categoryValue);
    if (selectedCategory?.subcategories) {
      setSubCategories(selectedCategory.subcategories);
    }
  }, [categoryValue, categories]);

  // Validate sections before submission
  const validateSections = useCallback((): boolean => {
    // Check if at least 1 section is linked
    if (!linkedSectionIds || linkedSectionIds.length === 0) {
      setSectionError('Structured Tutorial must have at least 1 linked section');
      return false;
    }

    // Check if all pages have section assignments
    const pagesWithoutSections = pages.filter(page => !page.sectionId);
    if (pagesWithoutSections.length > 0) {
      setSectionError(`${pagesWithoutSections.length} page(s) are not assigned to a section`);
      return false;
    }

    // Check if all page sections are in linkedSectionIds
    for (const page of pages) {
      if (page.sectionId && !linkedSectionIds.includes(page.sectionId)) {
        setSectionError(`Page "${page.title}" is assigned to a section that is not linked to this tutorial`);
        return false;
      }
    }

    setSectionError(null);
    return true;
  }, [linkedSectionIds, pages]);

  // Handle image upload and validation
  const handleImageChange = async (file: File | null) => {
    clearError();
    setValidationError(null);
    setValidationSuccess(null);

    if (!file) {
      setTutorialImage(null);
      setImagePreview(null);
      return;
    }

    // Validate file
    const validation = validateFile(file, DEFAULT_VALIDATION_OPTIONS);
    if (!validation.isValid) {
      setValidationError(validation.error || 'Invalid file');
      return;
    }

    // Scan for safety
    try {
      const isSafe = await scanImageClientSide(file);
      if (!isSafe) {
        setValidationError('Image failed safety check. Please choose a different image.');
        return;
      }

      setTutorialImage(file);
      setImagePreview(URL.createObjectURL(file));
      setValidationSuccess('Image validated successfully');
    } catch (error) {
      setValidationError('Failed to validate image');
    }
  };

  // Handle page management
  const addPage = () => {
    setPages([...pages, { title: '', description: '', sectionId: '', sectionOrder: pages.length }]);
    setCurrentPage(pages.length);
  };

  const removePage = (index: number) => {
    if (pages.length <= 1) {
      notifications.show({
        title: 'Cannot Remove',
        message: 'At least one page is required',
        color: 'red',
      });
      return;
    }
    
    const newPages = pages.filter((_, i) => i !== index);
    setPages(newPages);
    if (currentPage >= newPages.length) {
      setCurrentPage(newPages.length - 1);
    }
  };

  const updatePage = (index: number, field: keyof StructuredTutorialPage, value: any) => {
    const newPages = [...pages];
    newPages[index] = { ...newPages[index], [field]: value };
    setPages(newPages);
  };

  // Handle form submission
  const onSubmit = async (formData: any) => {
    try {
      // Validate sections FIRST
      if (!validateSections()) {
        notifications.show({
          title: 'Validation Error',
          message: sectionError || 'Please fix section assignments before submitting',
          color: 'red',
        });
        return;
      }

      open(); // Show loading

      // Upload image if present
      let imageUrl = edit?.imageUrl || '';
      if (tutorialImage) {
        try {
          imageUrl = await uploadImage(tutorialImage);
        } catch (error) {
          close();
          notifications.show({
            title: 'Upload Failed',
            message: 'Failed to upload image',
            color: 'red',
          });
          return;
        }
      }

      // Prepare payload
      const payload: StructuredTutorialCreateInput = {
        title: formData.title,
        categoryName: formData.categoryName,
        subCategory: formData.subCategory,
        nestedSubCategory: formData.nestedSubCategory,
        imageUrl,
        pages,
        linkedSectionIds,
        cloudinaryAssets: [],
      };

      // Create or update
      if (edit) {
        await StructuredTutorialAPI.update(edit.id, payload);
        notifications.show({
          title: 'Success',
          message: 'Structured tutorial updated successfully',
          color: 'green',
        });
      } else {
        await StructuredTutorialAPI.create(payload);
        notifications.show({
          title: 'Success',
          message: 'Structured tutorial created successfully',
          color: 'green',
        });
      }

      close();
      router.push('/dashboard'); // Or wherever tutorials are listed
    } catch (error: any) {
      close();
      console.error('Form submission error:', error);
      notifications.show({
        title: 'Error',
        message: error?.message || 'Failed to save structured tutorial',
        color: 'red',
      });
    }
  };

  return (
    <Container size="lg" py="xl">
      <form onSubmit={handleSubmit(onSubmit)}>
        <LoadingOverlay visible={isVisible} />
        
        <Stack gap="md">
          <Title order={2}>
            {edit ? 'Edit' : 'Create'} Structured Tutorial
          </Title>

          {/* Section Management - REQUIRED */}
          <Paper shadow="sm" p="md" withBorder>
            <Stack gap="md">
              <Group justify="space-between">
                <div>
                  <Text fw={600} size="lg">Section Management</Text>
                  <Text size="sm" c="dimmed">Required: Link at least 1 section to this tutorial</Text>
                </div>
                {linkedSectionIds.length > 0 && (
                  <Badge color="green" size="lg">
                    {linkedSectionIds.length} section{linkedSectionIds.length > 1 ? 's' : ''} linked
                  </Badge>
                )}
              </Group>

              {sectionError && (
                <Alert color="red" icon={<IconAlertCircle />}>
                  {sectionError}
                </Alert>
              )}

              {/* ContentSectionManager will be integrated here when contentId is available */}
              <Text size="sm" c="dimmed" fs="italic">
                Note: Section management will be available after tutorial is created. 
                Please save the tutorial first, then edit to add sections.
              </Text>
            </Stack>
          </Paper>

          <Divider />

          {/* Basic Information */}
          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <TextInput
                label="Tutorial Title"
                placeholder="Enter tutorial title"
                required
                {...register('title', { required: 'Title is required' })}
                error={errors.title?.message}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              <Select
                label="Category"
                placeholder="Select category"
                data={categories.map(cat => cat.categoryName)}
                required
                {...register('categoryName', { required: 'Category is required' })}
                onChange={(value) => setValue('categoryName', value || '')}
                error={errors.categoryName?.message}
              />
            </Grid.Col>

            {subCategories.length > 0 && (
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Select
                  label="Sub Category"
                  placeholder="Select sub category"
                  data={subCategories}
                  {...register('subCategory')}
                  onChange={(value) => setValue('subCategory', value || '')}
                />
              </Grid.Col>
            )}
          </Grid>

          {/* Tutorial Image */}
          <Controller
            name="tutorialImagePreview"
            control={control}
            rules={{ required: edit ? false : 'Tutorial Image is required' }}
            render={({ field }) => (
              <div>
                <FileInput
                  clearable
                  label={<Text size="sm" mt="md">Tutorial Image <Text component="span" size="lg" c="red">*</Text></Text>}
                  placeholder={
                    isScanning ? "🔍 Scanning image..." :
                    isModelLoading ? "🤖 Loading AI model..." :
                    "Select tutorial image"
                  }
                  leftSection={
                    isScanning || isModelLoading ? <Loader size={16} /> : <IconUpload size={16} />
                  }
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={isScanning || isModelLoading}
                  error={errors.tutorialImagePreview?.message}
                />
                
                {validationError && (
                  <Alert color="red" icon={<IconAlertCircle />} mt="xs">
                    {validationError}
                  </Alert>
                )}
                
                {validationSuccess && !validationError && (
                  <Alert color="green" icon={<IconCheck />} mt="xs">
                    {validationSuccess}
                  </Alert>
                )}

                {imagePreview && (
                  <Box mt="md">
                    <img src={imagePreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '200px' }} />
                  </Box>
                )}

                <ImageRequirements />
              </div>
            )}
          />

          <Divider />

          {/* Tutorial Pages */}
          <Stack gap="md">
            <Group justify="space-between">
              <Title order={3}>Tutorial Pages ({pages.length})</Title>
              <Button
                leftSection={<IconPlus size={16} />}
                onClick={addPage}
                variant="light"
              >
                Add Page
              </Button>
            </Group>

            {/* Page Navigation */}
            <Pagination
              currentPage={currentPage}
              totalPages={pages.length}
              onPageChange={setCurrentPage}
            />

            {/* Current Page Editor */}
            <Paper shadow="sm" p="md" withBorder>
              <Stack gap="md">
                <Group justify="space-between">
                  <Text fw={600}>Page {currentPage + 1}</Text>
                  {pages.length > 1 && (
                    <Button
                      color="red"
                      variant="subtle"
                      size="sm"
                      leftSection={<IconTrash size={16} />}
                      onClick={() => removePage(currentPage)}
                    >
                      Remove Page
                    </Button>
                  )}
                </Group>

                <TextInput
                  label="Page Title"
                  placeholder="Enter page title"
                  required
                  value={pages[currentPage]?.title || ''}
                  onChange={(e) => updatePage(currentPage, 'title', e.target.value)}
                />

                <Select
                  label="Assign to Section"
                  placeholder="Select a section"
                  required
                  data={linkedSectionIds.map(id => ({ value: id, label: id }))} // TODO: Map to section titles
                  value={pages[currentPage]?.sectionId || ''}
                  onChange={(value) => updatePage(currentPage, 'sectionId', value || '')}
                  error={!pages[currentPage]?.sectionId ? 'Section assignment required' : undefined}
                />

                <div>
                  <Text size="sm" mb="xs">Page Content</Text>
                  <RichTextEditor
                    value={pages[currentPage]?.description || ''}
                    onChange={(value) => updatePage(currentPage, 'description', value)}
                  />
                </div>
              </Stack>
            </Paper>
          </Stack>

          {/* Submit Buttons */}
          <Group justify="flex-end" mt="xl">
            <Button variant="default" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={linkedSectionIds.length === 0}>
              {edit ? 'Update' : 'Create'} Tutorial
            </Button>
          </Group>
        </Stack>
      </form>
    </Container>
  );
};

export default StructuredTutorialForm;
