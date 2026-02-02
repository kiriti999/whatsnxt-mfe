import React, { useEffect, useState, useCallback, Suspense } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Box, Button, Container, FileInput, Grid, Select, Text, TextInput, Title, LoadingOverlay, Loader, Switch, Alert, Group, Modal, Stack, Anchor } from '@mantine/core';
import { useRouter } from 'next/navigation';
import { notifications } from '@mantine/notifications';
import { BlogFormProps } from '../../../types/blogs';
import { FormAPI, HistoryAPI } from '../../../apis/v1/blog';
import { getCategoryId } from '../../../utils/form';
import { IconUpload, IconAlertCircle, IconCheck } from '@tabler/icons-react';
import { LexicalEditor } from '../../StructuredTutorial/Editor/LexicalEditor';
import { useDisclosure } from '@mantine/hooks';
import { MantineLoader } from '@whatsnxt/core-ui';
import { AISuggestions } from '../../../apis/v1/blog/aiSuggestions';
import Image from 'next/image';
import { uploadImage } from './util';
import { unifiedDeleteWebWorker } from '../../../utils/worker/assetManager';
import { useImageSafety } from '../../../hooks/useImageSafety';
import { validateFile, formatFileSize, DEFAULT_VALIDATION_OPTIONS } from '../../../utils/imageValidation';
import { ImageRequirements } from './ImageRequirements';

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
  const [apiKeyModalOpened, { open: openApiKeyModal, close: closeApiKeyModal }] = useDisclosure(false);
  const [apiKey, setApiKey] = useState('');
  const [apiKeyError, setApiKeyError] = useState('');
  const [selectedAI, setSelectedAI] = useState('openai');
  const [selectedModel, setSelectedModel] = useState('gpt-4o');

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

      const validationOptions = {
        ...DEFAULT_VALIDATION_OPTIONS.BLOG_TUTORIAL,
        setValidationError // Add the setValidationError function to options
      };

      const isValid = await validateFile(file, validationOptions);

      if (!isValid) {
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

      formData.contentFormat = "JSON";

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
    if (!questionText.trim()) {
      notifications.show({
        position: 'bottom-right',
        color: 'orange',
        title: 'Empty Question',
        message: 'Please enter a question first',
      });
      return;
    }

    setIsFetching(true);
    try {
      const response = await AISuggestions.getSuggestionByAI({
        question: questionText,
        aiModel: selectedAI,
        modelVersion: selectedModel
      });

      if (response.status === 200 && response.data?.suggestion) {
        const suggestionText = response.data.suggestion;
        setValue('description', suggestionText);
        // Since AI generates markdown by default, set the format
        notifications.show({
          position: 'bottom-right',
          color: 'green',
          title: 'Success',
          message: `AI suggestions loaded successfully using ${response.data.model || selectedAI}`,
        });
      } else {
        // Non-200 response, show modal
        const errorMsg = response.data?.message || response.data?.error || 'API request failed. Please provide your API key.';
        setApiKeyError(errorMsg);
        openApiKeyModal();
      }
    } catch (error: any) {
      console.error("Error fetching suggestion:", error);

      // Extract error message from various possible locations
      let errorMessage = 'Failed to fetch AI suggestions. Please provide your API key.';

      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      // Only override with generic messages if no specific backend message was provided
      if (!error?.response?.data?.message && !error?.response?.data?.error) {
        if (error?.response?.status === 429) {
          errorMessage = 'API rate limit exceeded. Please provide your own API key to continue.';
        } else if (error?.response?.status === 401) {
          errorMessage = error?.message || 'Authentication failed. Please provide a valid API key.';
        } else if (error?.response?.status === 500 && !error?.message) {
          errorMessage = 'Server error. The API account may be inactive or have billing issues. Please provide your own API key.';
        }
      }

      setApiKeyError(errorMessage);
      openApiKeyModal();
    } finally {
      setIsFetching(false);
    }
  };

  const saveApiKey = async () => {
    if (!apiKey.trim()) {
      setApiKeyError('Please enter a valid API key');
      return;
    }

    try {
      const response = await AISuggestions.saveAIConfig({
        apiKey,
        aiModel: selectedAI,
        modelVersion: selectedModel
      });
      if (response.status === 200 || response.status === 201) {
        notifications.show({
          position: 'bottom-right',
          color: 'green',
          title: 'API Key Saved',
          message: response.data?.message || 'Your API key has been saved successfully',
        });
        setApiKey('');
        setApiKeyError('');
        closeApiKeyModal();

        // Retry fetching suggestion
        fetchSuggestion();
      } else {
        const errorMsg = response.data?.message || response.data?.error || 'Failed to save API key';
        setApiKeyError(errorMsg);
      }
    } catch (error: any) {
      console.error('Error saving API key:', error);

      let errorMessage = 'Failed to save API key. Please try again.';

      // Prioritize backend error messages
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error?.message) {
        errorMessage = error.message;
        // Only add helpful context for route not found, don't replace the message
        if (error.message.includes('Route') && error.message.includes('not found')) {
          errorMessage = `${error.message}. Please contact support.`;
        }
      }

      // Only use generic messages if no backend message is available
      if (!error?.response?.data?.message && !error?.response?.data?.error && !error?.message) {
        if (error?.response?.status === 404) {
          errorMessage = 'API endpoint not found. This feature may not be available yet.';
        } else if (error?.response?.status === 401) {
          errorMessage = 'Invalid API key. Please check and try again.';
        }
      }

      setApiKeyError(errorMessage);
    }
  };

  return (
    <Suspense fallback={<MantineLoader />}>
      <Container size="lg" mb={'4rem'} pos='relative'>
        <LoadingOverlay visible={isVisible} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />

        {/* API Key Modal */}
        <Modal
          opened={apiKeyModalOpened}
          onClose={closeApiKeyModal}
          title="Configure AI Assistant"
          centered
          size="lg"
        >
          <Stack gap="md">
            {apiKeyError && (
              <Alert color="red" variant="light">
                {apiKeyError}
              </Alert>
            )}

            <Text size="sm" fw={500}>
              Add your own AI API key securely to overcome rate limits and get better performance.
            </Text>

            <Select
              label="Select AI Provider"
              placeholder="Choose AI provider"
              value={selectedAI}
              onChange={(value) => {
                setSelectedAI(value || 'openai');
                // Set default model for each provider
                if (value === 'openai') setSelectedModel('gpt-4o');
                else if (value === 'anthropic') setSelectedModel('claude-3-5-sonnet-20241022');
                else if (value === 'gemini') setSelectedModel('gemini-1.5-flash');
              }}
              data={[
                { value: 'openai', label: 'OpenAI (ChatGPT)' },
                { value: 'anthropic', label: 'Anthropic (Claude)' },
                { value: 'gemini', label: 'Google (Gemini)' },
              ]}
            />

            <Select
              label="Select Model Version"
              placeholder="Choose model"
              value={selectedModel}
              onChange={(value) => setSelectedModel(value || 'gpt-4o')}
              data={
                selectedAI === 'openai' ? [
                  { value: 'gpt-4o', label: 'GPT-4o (Latest)' },
                  { value: 'gpt-4o-mini', label: 'GPT-4o Mini (Faster)' },
                  { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
                  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo (Cheapest)' },
                ] : selectedAI === 'anthropic' ? [
                  { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet (Latest)' },
                  { value: 'claude-3-5-haiku-20241022', label: 'Claude 3.5 Haiku (Fast)' },
                  { value: 'claude-3-opus-20240229', label: 'Claude 3 Opus (Most Capable)' },
                ] : [
                  { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash (Fast)' },
                  { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro (Advanced)' },
                  { value: 'gemini-2.0-flash-exp', label: 'Gemini 2.0 Flash (Experimental)' },
                ]
              }
            />

            {selectedAI === 'openai' && (
              <Text size="xs" c="dimmed">
                Get your key: <Anchor href="https://platform.openai.com/api-keys" target="_blank">OpenAI API Keys</Anchor>
              </Text>
            )}
            {selectedAI === 'anthropic' && (
              <Text size="xs" c="dimmed">
                Get your key: <Anchor href="https://console.anthropic.com/settings/keys" target="_blank">Anthropic API Keys</Anchor>
              </Text>
            )}
            {selectedAI === 'gemini' && (
              <Text size="xs" c="dimmed">
                Get your key: <Anchor href="https://aistudio.google.com/app/apikey" target="_blank">Google AI Studio</Anchor>
              </Text>
            )}

            <TextInput
              label="Your API Key"
              placeholder={`Paste your ${selectedAI === 'openai' ? 'sk-...' : selectedAI === 'anthropic' ? 'sk-ant-...' : 'AI...'} key here`}
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setApiKeyError('');
              }}
              error={apiKeyError}
            />

            <Group justify="flex-end">
              <Button variant="outline" onClick={closeApiKeyModal}>
                Cancel
              </Button>
              <Button onClick={saveApiKey} disabled={!apiKey.trim()}>
                Save Configuration
              </Button>
            </Group>
          </Stack>
        </Modal>

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

              {/* Description */}
              <Grid.Col span={12}>
                <Text size="sm" className='required'>Description</Text>
                <Controller
                  name="description"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <LexicalEditor
                      value={value}
                      onChange={onChange}
                    />
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
            <ImageRequirements />

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