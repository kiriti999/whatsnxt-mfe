import React, { useEffect, useState, useCallback, Suspense } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Box, Button, Container, FileInput, Grid, Select, Text, TextInput, Title, LoadingOverlay, Loader, Switch, Alert, Group } from '@mantine/core';
import { useRouter } from 'next/navigation';
import { notifications } from '@mantine/notifications';
import { BlogFormProps } from '../../../types/blogs';
import { FormAPI, HistoryAPI } from '../../../apis/v1/blog';
import { getCategoryId } from '../../../utils/form';
import { IconUpload, IconAlertCircle, IconCheck } from '@tabler/icons-react';
import { RichTextEditor } from '../../RichTextEditor';
import { useDisclosure } from '@mantine/hooks';
import { MantineLoader } from '@whatsnxt/core-ui';
import { AISuggestions } from '../../../apis/v1/blog/aiSuggestions';
import Image from 'next/image';
import { uploadImage } from './util';
import { unifiedDeleteWebWorker } from '../../../utils/worker/assetManager';
import { useImageSafety } from '../../../hooks/useImageSafety';

const BlogForm: React.FC<BlogFormProps> = ({ categories, edit }) => {
  const [isVisible, { open, close }] = useDisclosure(false);
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [nestedSubCategories, setNestedSubCategories] = useState<any[]>([]);
  const [blogImage, setCourseImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [validationSuccess, setValidationSuccess] = useState<string | null>(null);
  const router = useRouter();
  const [wordCount, setWordCount] = useState(0);
  const [contentIsMarkdown, setContentIsMarkdown] = useState(false);

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
    formState: { errors, isDirty },
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      title: edit?.title || '',
      description: edit?.description || '',
      categoryName: edit?.categoryName || '',
      subCategory: edit?.subCategory || '',
      nestedSubCategory: edit?.nestedSubCategory || '',
      blogImagePreview: ''
    },
  });

  const titleValue = watch('title');
  const [questionText, setQuestionText] = useState("");
  const [isFetching, setIsFetching] = useState(false);

  const categoryValue = watch('categoryName');

  useEffect(() => {
    setQuestionText(titleValue);
  }, [titleValue]);

  // Preload AI model on component mount for better UX
  useEffect(() => {
    preloadModel().catch(console.warn);
  }, [preloadModel]);

  // Populate subcategories and nested subcategories when editing
  // Pre-fill the form with edit data if available
  useEffect(() => {
    if (edit) {
      setValue('title', edit.title);
      setValue('description', edit.description);
      setValue('categoryName', edit.categoryName);

      // Set the content format state based on stored value
      setContentIsMarkdown(edit.contentFormat === 'MARKDOWN');

      const selectedCategory = categories.find((cat) => cat.categoryName === edit.categoryName);
      if (selectedCategory?.subcategories) {
        const mappedSubCategories = selectedCategory.subcategories.map((sub) => ({
          value: sub.name,        // ✅ Already correct - uses 'name'
          label: sub.name,        // ✅ Already correct - uses 'name'
          subcategories: sub.subcategories,
        }));
        setSubCategories(mappedSubCategories);

        const selectedSubCategory = mappedSubCategories.find((sub) => sub.value === edit.subCategory);
        if (selectedSubCategory?.subcategories) {
          const mappedNestedSubCategories = selectedSubCategory.subcategories.map((nested) => ({
            value: nested.name,   // ✅ Already correct - uses 'name'
            label: nested.name,   // ✅ Already correct - uses 'name'
          }));
          setNestedSubCategories(mappedNestedSubCategories);
        }
      }

      if (edit.subCategory) {
        setValue('subCategory', edit.subCategory)
      }

      if (edit.nestedSubCategory) {
        setValue('nestedSubCategory', edit.nestedSubCategory)
      }

      // Set existing image preview if editing
      if (edit.imageUrl) {
        setImagePreview(edit.imageUrl);
      }
    }
  }, [edit, setValue]);

  // Update subcategories when a category is selected
  const handleCategoryChange = useCallback(
    (value: string) => {
      const selectedCategory = categories.find((cat) => cat.categoryName === value);
      const selectedCategoriesToUpdate = selectedCategory?.subcategories?.map((sub) => ({
        value: sub.name,        // ✅ Already correct - uses 'name'
        label: sub.name,        // ✅ Already correct - uses 'name'
        subcategories: sub.subcategories,
      })) || [];

      selectedCategoriesToUpdate.push({
        value: '',
        label: '',
        subcategories: []
      })

      setSubCategories(selectedCategoriesToUpdate)
      setNestedSubCategories([]); // Reset nested subcategories
    },
    [categories]
  );

  // Update nested subcategories when a subcategory is selected
  const handleSubCategoryChange = useCallback(
    (value: string) => {
      const selectedSubCategory = subCategories.find((sub) => sub.value === value);
      setNestedSubCategories(
        selectedSubCategory?.subcategories?.map((nested) => ({
          value: nested.name,   // ✅ Already correct - uses 'name'
          label: nested.name,   // ✅ Already correct - uses 'name'
        })) || []
      );
    },
    [subCategories]
  );

  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Validate image dimensions
  const validateImageDimensions = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(url);
        const minWidth = 750, minHeight = 422;
        const maxWidth = 6000, maxHeight = 6000;

        const isValidMin = img.width >= minWidth && img.height >= minHeight;
        const isValidMax = img.width <= maxWidth && img.height <= maxHeight;

        if (!isValidMin) {
          setValidationError(
            `Image dimensions too small. Min: ${minWidth}x${minHeight}px, Actual: ${img.width}x${img.height}px`
          );
        } else if (!isValidMax) {
          setValidationError(
            `Image dimensions too large. Max: ${maxWidth}x${maxHeight}px, Actual: ${img.width}x${img.height}px`
          );
        }

        resolve(isValidMin && isValidMax);
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        setValidationError('Invalid image file');
        resolve(false);
      };

      img.src = url;
    });
  };

  // Comprehensive file validation
  const validateFile = async (file: File): Promise<boolean> => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg'];

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      setValidationError(`Unsupported file format. Supported: ${allowedTypes.join(', ')}`);
      return false;
    }

    // Check file size
    if (file.size > maxSize) {
      setValidationError(
        `File too large: ${formatFileSize(file.size)}. Maximum allowed: ${formatFileSize(maxSize)}`
      );
      return false;
    }

    // Check image dimensions
    const dimensionsValid = await validateImageDimensions(file);
    return dimensionsValid;
  };

  const handleImageChange = async (file: File | null) => {
    // Clear previous states
    setValidationError(null);
    setValidationSuccess(null);
    clearError();

    if (!file) {
      setCourseImage(null);
      setImagePreview(null);
      return;
    }

    try {
      console.log('🔍 Starting validation and safety scan for:', file.name);

      // Step 1: Basic file validation
      const isValidFile = await validateFile(file);
      if (!isValidFile) {
        return; // Error already set by validateFile
      }

      // Step 2: Safety scanning
      console.log('🔍 Running AI safety scan...');
      const safetyResult = await scanImageClientSide(file);

      if (!safetyResult.safe) {
        setValidationError(
          `Image blocked by AI safety scan: ${safetyResult.blockedReasons.join(', ')}`
        );
        console.error('❌ Image failed safety check:', safetyResult);
        return;
      }

      // Step 3: All checks passed - set the image
      console.log('✅ Image passed all validation checks');
      setCourseImage(file);
      setValidationSuccess(`Image validated successfully (${formatFileSize(file.size)})`);

      // Step 4: Create preview
      const fileReader = new FileReader();
      fileReader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      fileReader.readAsDataURL(file);

    } catch (error) {
      console.error('❌ Image validation failed:', error);
      setValidationError(
        `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  };

  const handleFormSubmit = async (formData: any, e: any) => {
    e.preventDefault();
    let imageAssets = [] // store image assets image url for temp
    const bffApiUrl = process.env.NEXT_PUBLIC_BFF_HOST_IMAGEKIT_API;
    try {
      open();
      // Get categoryId for the selected category
      formData.categoryId = getCategoryId(categories, formData.categoryName);
      formData.subCategory = formData.subCategory || null; // Include subCategory if selected
      formData.nestedSubCategory = formData.nestedSubCategory || null; // Include nestedSubCategory if selected
      formData.published = false;

      // Set content format as string value instead of enum
      formData.contentFormat = contentIsMarkdown ? "MARKDOWN" : "HTML";

      let imageUrl = edit?.imageUrl || '';
      let cloudinaryAssets = edit?.cloudinaryAssets || [];

      // Only upload new image if one was selected
      if (blogImage) {
        // Upload image via worker
        const addToLocalStorage = false;
        const { secure_url, updatedAssets } = await uploadImage(blogImage, cloudinaryAssets, 'whatsnxt-blog', addToLocalStorage, bffApiUrl);
        imageUrl = secure_url
        cloudinaryAssets = updatedAssets;

        if (secure_url) {
          imageAssets = [...updatedAssets]
        }
      }

      // Construct payload with nested categories
      const payload = {
        ...formData,
        categoryName: formData.categoryName,
        subCategory: formData.subCategory,
        nestedSubCategory: formData.nestedSubCategory,
        contentFormat: formData.contentFormat,
        imageUrl,
        cloudinaryAssets,
        wordCount
      };

      // Call FormAPI for creating or updating blog
      const response = await (edit
        ? FormAPI.updateBlog(edit.id, payload)
        : FormAPI.createBlog(payload));
      if (response?.success) {
        if (edit) await HistoryAPI.publishDraft(edit.id, false);
        notifications.show({
          position: 'bottom-right',
          title: `Blog ${edit ? 'Updated' : 'Created'}`,
          message: `Blog successfully ${edit ? 'updated' : 'created'}`,
          color: 'green',
        });
        router.push('/history/table');
      } else {
        throw new Error('Blog creation failed.');
      }
    } catch (error: any) {
      notifications.show({
        position: 'bottom-right',
        title: 'Error',
        message: error?.message || 'An error occurred while saving the blog',
        color: 'red',
      });
      // Early return if no assets to clean up
      if (!imageAssets.length) {
        return;
      }
      await unifiedDeleteWebWorker({ assetsList: imageAssets, clearLocalStorage: true, bffApiUrl });
    } finally {
      imageAssets = [] // remove temp assests
      close();
    }
  };

  const handleWordCountChange = (count: number) => {
    console.log('wordCount ', count);
    setWordCount(count);
  };

  const fetchSuggestion = async () => {
    setIsFetching(true);
    try {
      const response = await AISuggestions.getSuggestionByChatGpt({ question: questionText });
      const suggestionText = response.data?.suggestion || "No suggestion available.";
      setValue('description', suggestionText);
      // Since ChatGPT generates markdown by default, set the format
      setContentIsMarkdown(true);
    } catch (error) {
      console.error("Error fetching suggestion:", error);
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <Suspense fallback={<MantineLoader />}>
      <Container size="lg" mb={'4rem'} pos='relative'>
        <LoadingOverlay visible={isVisible} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
        <Box>
          <Title my={'md'} order={2}>{edit ? 'Edit blog' : 'Create blog'}</Title>
          <form onSubmit={handleSubmit(handleFormSubmit)}>
            <Grid gutter="lg">
              {/* Title */}
              <Grid.Col span={12}>
                <TextInput
                  label={<Text fz={15}>Title <Text component="span" m={0} size='lg' c="red">*</Text></Text>}
                  placeholder="Enter blog title"
                  {...register('title', { required: 'Title is required', maxLength: 250 })}
                />
                {errors.title && <Text c="red">{errors.title.message}</Text>}

                <Button color="blue" onClick={fetchSuggestion} mt="xs">
                  {isFetching ? <Loader color="rgba(255, 255, 255, 1)" size="sm" /> : "Get AI Suggestions"}
                </Button>
              </Grid.Col>

              {/* Content Format Switch */}
              <Grid.Col span={12}>
                <Switch
                  label="Content is Markdown"
                  checked={contentIsMarkdown}
                  onChange={(event) => setContentIsMarkdown(event.currentTarget.checked)}
                  description="Toggle if content is Markdown instead of HTML"
                />
              </Grid.Col>

              {/* Description */}
              <Grid.Col span={12}>
                <Text size="sm" className='required'>Description</Text>
                <Controller
                  name="description"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <RichTextEditor content={value}
                      onChange={onChange}
                      onWordCountChange={handleWordCountChange} />
                  )}
                />
                {errors.description && <Text c="red">{errors.description.message}</Text>}
              </Grid.Col>

              {/* Categories */}
              <Grid.Col span={{ base: 12, lg: 9, md: 12 }}>
                <Controller
                  name="categoryName"
                  control={control}
                  rules={{ required: 'Category is required' }}
                  render={({ field }) => (
                    <Select
                      label={<Text fz={15}>Category <Text component="span" m={0} size='lg' c="red">*</Text></Text>}
                      placeholder="Select a category"
                      data={categories.map((cat) => ({ value: cat.categoryName, label: cat.categoryName }))}
                      value={field.value}
                      onChange={(value) => {
                        setValue('subCategory', '')
                        setValue('nestedSubCategory', '')
                        field.onChange(value);
                        handleCategoryChange(value);
                      }}
                    />
                  )}
                />
                {errors.categoryName && <Text c="red">{errors.categoryName.message}</Text>}
              </Grid.Col>

              {/* Subcategories */}
              {categoryValue && (
                <Grid.Col span={{ base: 12, lg: 9, md: 12 }}>
                  <Controller
                    name="subCategory"
                    control={control}
                    rules={{ required: 'SubCategory is required' }}
                    render={({ field }) => (
                      <Select
                        label={<Text fz={15}>Subcategory <Text component="span" m={0} size='lg' c="red">*</Text></Text>}
                        placeholder="Select a subcategory"
                        data={subCategories}
                        value={field.value}
                        onChange={(value) => {
                          field.onChange(value);
                          setValue('nestedSubCategory', '');
                          handleSubCategoryChange(value);
                        }}
                      />
                    )}
                  />
                  {errors.subCategory && <Text c="red">{errors.subCategory.message}</Text>}
                </Grid.Col>
              )}

              {/* Nested Subcategories */}
              {nestedSubCategories.length > 0 && (
                <Grid.Col span={{ base: 12, lg: 9, md: 12 }}>
                  <Controller
                    name="nestedSubCategory"
                    control={control}
                    render={({ field }) => (
                      <Select
                        label={<Text fz={15}>Nested category <Text component="span" m={0} size='lg' c="red">*</Text></Text>}
                        placeholder="Select a nested subcategory"
                        data={nestedSubCategories}
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                </Grid.Col>
              )}
            </Grid>

            {/* Blog Image Upload */}
            <Controller
              name="blogImagePreview"
              control={control}
              rules={{ required: edit ? false : 'Blog Image is required' }}
              render={({ field }) => (
                <div>
                  <FileInput
                    clearable
                    label={<Text size='sm' mt={'2rem'}>Blog Image <Text component="span" size='lg' c="red">*</Text></Text>}
                    placeholder={
                      isScanning ? "🔍 Scanning image..." :
                        isModelLoading ? "🤖 Loading AI model..." :
                          "Select blog image"
                    }
                    leftSection={
                      isScanning || isModelLoading ? (
                        <Loader size={16} />
                      ) : (
                        <IconUpload size={16} />
                      )
                    }
                    value={blogImage}
                    onChange={(e) => {
                      handleImageChange(e);
                      field.onChange(e);
                    }}
                    accept=".png,.jpg,.jpeg"
                    disabled={isScanning || isModelLoading}
                  />

                  {/* Status messages */}
                  {(validationError || scanError) && (
                    <Alert
                      icon={<IconAlertCircle size={16} />}
                      color="red"
                      mt="xs"
                      variant="light"
                    >
                      {validationError || scanError}
                    </Alert>
                  )}

                  {validationSuccess && !validationError && !scanError && (
                    <Alert
                      icon={<IconCheck size={16} />}
                      color="green"
                      mt="xs"
                      variant="light"
                    >
                      {validationSuccess}
                    </Alert>
                  )}

                  {/* Scanning status */}
                  {isScanning && (
                    <Group gap="xs" mt="xs">
                      <Loader size="xs" />
                      <Text size="xs" c="blue">
                        Running AI safety scan...
                      </Text>
                    </Group>
                  )}

                  {/* Model loading status */}
                  {isModelLoading && (
                    <Group gap="xs" mt="xs">
                      <Loader size="xs" />
                      <Text size="xs" c="gray">
                        Loading AI model in browser...
                      </Text>
                    </Group>
                  )}
                </div>
              )}
            />
            {errors.blogImagePreview && <Text c="red">{errors.blogImagePreview.message}</Text>}

            {/* Blog Image Technical Requirements */}
            <Box mt="lg" style={{ textAlign: 'left' }}>
              <Title order={5}>Blog Image Requirements</Title>
              <Text size="sm" mt="xs">
                <strong>Image formats:</strong> The file format must be .jpg, .jpeg, or .png.
              </Text>
              <Text size="sm" mt="xs">
                <strong>Image dimensions:</strong> Always design your blog image at the following pixel dimensions. The image design needs to be within the content safe area for maximum visibility.
              </Text>
              <Text size="sm" mt="xs">
                <strong>Minimum required dimensions:</strong> 750 × 422 pixels
              </Text>
              <Text size="sm" mt="xs">
                <strong>Maximum required dimensions:</strong> 6000 × 6000 pixels
              </Text>
              <Text size="sm" mt="xs">
                <strong>File size:</strong> Maximum 5MB
              </Text>
              <Text size="sm" mt="xs" c="blue">
                <strong>AI Safety:</strong> All images are automatically scanned for inappropriate content before upload.
              </Text>
            </Box>

            {/* Image Preview */}
            {imagePreview && !validationError && !scanError && (
              <Box mt="md">
                <Title order={5}>Image Preview:</Title>
                <Image
                  alt="blog image preview"
                  src={imagePreview}
                  width={300}
                  height={200}
                  sizes="(max-width: 480px) 300px, (max-width: 768px) 320px, 340px"
                  style={{
                    borderRadius: '8px',
                    border: '1px solid #e9ecef'
                  }}
                />
              </Box>
            )}

            <Button
              type="submit"
              mt="md"
              disabled={!isDirty || isScanning || isModelLoading || (validationError !== null) || (scanError !== null)}
            >
              {edit ? 'Update' : 'Create'}
            </Button>
          </form>
        </Box>
      </Container>
    </Suspense>
  );
};

export default BlogForm;