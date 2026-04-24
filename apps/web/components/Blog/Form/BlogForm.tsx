import React, { useEffect, useState, useCallback, Suspense, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { ActionIcon, Box, Button, Container, FileInput, Flex, Grid, Group, Paper, SegmentedControl, Select, Switch, Text, TextInput, Title, Loader, Alert, Tooltip } from '@mantine/core';
import { useRouter } from 'next/navigation';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import { BlogFormProps } from '../../../types/blogs';
import { FormAPI, HistoryAPI } from '../../../apis/v1/blog';
import { AISuggestions } from '../../../apis/v1/blog/aiSuggestions';
import { getCategoryId } from '../../../utils/form';
import { IconUpload, IconAlertCircle, IconCheck, IconSparkles, IconWand, IconLayoutGrid } from '@tabler/icons-react';
import { LexicalEditor } from '../../StructuredTutorial/Editor/LexicalEditor';
import type { LexicalEditorHandle } from '../../StructuredTutorial/Editor/LexicalEditor';
import { lexicalToHtml } from '../../../utils/lexicalToHtml';
import { useDisclosure } from '@mantine/hooks';
import { MantineLoader, CategorySearch } from '@whatsnxt/core-ui';
import type { CategoryPath } from '@whatsnxt/core-ui';
import { AISuggestionButton } from '../../Common/AISuggestionButton';
import Image from 'next/image';
import { uploadImage } from './util';
import { useImageSafety } from '../../../hooks/useImageSafety';
import { validateFile, formatFileSize, DEFAULT_VALIDATION_OPTIONS } from '../../../utils/imageValidation';
import { ImageRequirements } from './ImageRequirements';
import { FullPageOverlay } from '@/components/Common/FullPageOverlay';
import { DiagramTypePicker } from '../../Visualizer/DiagramTypePicker';
import type { DiagramType } from '../../Visualizer/types';
import { wrapSvgsForLexical } from '../../../utils/wrapSvgsForLexical';

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
  const [includeDiagram, setIncludeDiagram] = useState(false);
  const [diagramMode, setDiagramMode] = useState<'auto' | 'manual'>('auto');
  const [selectedDiagramType, setSelectedDiagramType] = useState<DiagramType | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [aiGeneratedAsset, setAiGeneratedAsset] = useState<{
    imageUrl: string;
    pngImageUrl?: string;
    cloudinaryAsset: { public_id: string; url: string; secure_url: string; format: string; resource_type: string };
  } | null>(null);
  const editorRef = useRef<LexicalEditorHandle>(null);
  const lastLoadedId = useRef<string | null>(null);
  // Helper function to get initial description from edit data
  const getInitialDescription = useCallback((editData: any) => {
    if (editData?.lexicalState) {
      try {
        let lexicalStateStr: string;
        let parsed: any;

        if (typeof editData.lexicalState === 'string') {
          lexicalStateStr = editData.lexicalState;
          parsed = JSON.parse(lexicalStateStr);
        } else {
          parsed = editData.lexicalState;
          lexicalStateStr = JSON.stringify(parsed);
        }

        // Check if lexicalState has actual content (not just empty paragraphs)
        const hasContent = parsed?.root?.children?.some((child: any) => {
          // Check if child has children (content) OR if it's a decorator node / leaf node with content
          return (child.children && child.children.length > 0) ||
            (child.type !== 'paragraph') || // Non-paragraphs (like code blocks) might be empty but valid
            (child.getTextContent && child.getTextContent().trim().length > 0);
        });

        // Simplified check: if it has root and children, it's likely valid. 
        // We shouldn't be too aggressive in discarding it if the alternative is raw HTML.
        if (parsed?.root) {
          return lexicalStateStr;
        }
      } catch (e) {
        console.warn('❌ BlogForm: Failed to parse lexicalState:', e);
      }
    }
    return editData?.description || '';
  }, []);

  const [description, setDescription] = useState<string>(() => {
    return getInitialDescription(edit);
  });

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

  const categoryValue = watch('categoryName');

  // Preload AI model on component mount for better UX
  useEffect(() => {
    preloadModel().catch(console.warn);
  }, [preloadModel]);

  // Populate subcategories and nested subcategories when editing
  // Pre-fill the form with edit data if available
  useEffect(() => {
    if (edit) {
      // Sync description state if it's the first time we're loading this specific edit data
      if (edit.id !== lastLoadedId.current) {
        setValue('title', edit.title);
        setValue('categoryName', edit.categoryName);

        const initialDesc = getInitialDescription(edit);
        setDescription(initialDesc);
        setValue('description', edit.description || '');

        lastLoadedId.current = edit.id;

        // Set the content format state based on stored value
        const selectedCategory = categories.find((cat) => cat.categoryName === edit.categoryName);
        let mappedSubCategories: any[] = [];

        if (selectedCategory?.subcategories) {
          mappedSubCategories = selectedCategory.subcategories.map((sub) => ({
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
        } else if (mappedSubCategories && mappedSubCategories.length > 0 && mappedSubCategories[0].value) {
          // Auto-select first subcategory if edit doesn't have one
          setValue('subCategory', mappedSubCategories[0].value);
        }

        if (edit.nestedSubCategory) {
          setValue('nestedSubCategory', edit.nestedSubCategory)
        }

        // Set existing image preview if editing
        if (edit.imageUrl) {
          setImagePreview(edit.imageUrl);
        }

        // Restore diagram toggle state if editing
        if (edit.includeDiagram) {
          setIncludeDiagram(true);
          const mode = (edit.diagramMode as 'auto' | 'manual') || 'auto';
          setDiagramMode(mode);
          setSelectedDiagramType((edit.diagramType as DiagramType) || null);
        }
      }
    }
  }, [edit, setValue, getInitialDescription, categories]);

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

      // Auto-select the first subcategory if available
      if (selectedCategoriesToUpdate.length > 0 && selectedCategoriesToUpdate[0].value) {
        setValue('subCategory', selectedCategoriesToUpdate[0].value);
        handleSubCategoryChange(selectedCategoriesToUpdate[0].value);
      }
    },
    [categories, setValue]
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

  const handleGenerateAIImage = useCallback(async () => {
    const title = watch('title');
    if (!title?.trim()) {
      notifications.show({
        position: 'bottom-right',
        color: 'orange',
        title: 'Missing Title',
        message: 'Please enter a blog title first',
      });
      return;
    }

    setIsGeneratingImage(true);
    setValidationError(null);
    setValidationSuccess(null);

    try {
      // Find existing publicId to overwrite it instead of creating orphans
      let existingPublicId = aiGeneratedAsset?.cloudinaryAsset?.public_id;
      if (!existingPublicId && edit?.cloudinaryAssets?.length) {
        existingPublicId = edit.cloudinaryAssets[0].public_id;
      }
      // If publicId includes the folder name, strip it because the backend handles it or leave it if backend handles it
      // Our backend handles `whatsnxt-tutorial/` cleanly.

      const response = await AISuggestions.generateTutorialImage({ 
        title, 
        publicId: existingPublicId 
      });

      if (response?.data?.success && response.data.imageUrl) {
        setImagePreview(response.data.imageUrl);
        setAiGeneratedAsset({
          imageUrl: response.data.imageUrl,
          pngImageUrl: response.data.pngImageUrl,
          cloudinaryAsset: response.data.cloudinaryAsset,
        });
        setCourseImage(null);
        setValidationSuccess('AI image generated and uploaded to Cloudinary');
        notifications.show({
          position: 'bottom-right',
          color: 'green',
          title: 'Image Generated',
          message: 'AI-generated image is ready. It will be used as the blog image.',
        });
      } else {
        const errorMsg = response?.data?.message || 'Failed to generate image';
        setValidationError(errorMsg);
      }
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (error as Error)?.message ||
        'Failed to generate AI image';
      setValidationError(errorMessage);
    } finally {
      setIsGeneratingImage(false);
    }
  }, [watch]);

  const handleImageChange = async (file: File | null) => {
    // Clear previous states
    setValidationError(null);
    setValidationSuccess(null);
    setAiGeneratedAsset(null);
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
    const bffApiUrl = process.env.NEXT_PUBLIC_BFF_HOST_CLOUDINARY_API;
    try {
      open();
      // Get categoryId for the selected category
      formData.categoryId = getCategoryId(categories, formData.categoryName);
      formData.subCategory = formData.subCategory || null; // Include subCategory if selected
      formData.nestedSubCategory = formData.nestedSubCategory || null; // Include nestedSubCategory if selected
      formData.published = false;

      // Convert Lexical editor content to HTML and capture JSON state
      // Use Lexical's native $generateHtmlFromNodes (via editorRef) which properly
      // handles ExcalidrawNode SVGs and other decorator nodes, with fallback to
      // the custom lexicalToHtml converter.
      formData.description = editorRef.current?.getHtml() || lexicalToHtml(description);
      formData.contentFormat = 'LEXICAL';
      try {
        formData.lexicalState = JSON.parse(description);
      } catch (e) {
        formData.lexicalState = null;
      }

      let imageUrl = edit?.imageUrl || '';
      let cloudinaryAssets = edit?.cloudinaryAssets || [];

      // Only upload new image if one was selected
      if (blogImage) {
        // Upload image via worker
        const addToLocalStorage = false;
        const { secure_url, asset } = await uploadImage(blogImage, 'whatsnxt', addToLocalStorage, bffApiUrl);

        if (secure_url && asset) {
          imageUrl = secure_url;
          cloudinaryAssets = [asset];
        }
      } else if (aiGeneratedAsset) {
        // Use AI-generated image that was already uploaded
        imageUrl = aiGeneratedAsset.imageUrl;
        cloudinaryAssets = [aiGeneratedAsset.cloudinaryAsset];
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
        wordCount,
        includeDiagram,
        diagramMode: includeDiagram ? diagramMode : null,
        diagramType: includeDiagram && diagramMode === 'manual' ? selectedDiagramType : null,
        ...(aiGeneratedAsset?.pngImageUrl && { pngImageUrl: aiGeneratedAsset.pngImageUrl }),
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
      const isConflict = error?.status === 409 || error?.response?.status === 409;
      if (isConflict) {
        modals.open({
          title: 'Duplicate Title Detected',
          centered: true,
          children: (
            <Box>
              <Text size="sm" mb="md">{error?.message || 'A blog with a similar title already exists.'}</Text>
              <Text size="xs" c="dimmed">Please change your title and try again.</Text>
              <Group justify="flex-end" mt="md">
                <Button onClick={() => modals.closeAll()}>OK</Button>
              </Group>
            </Box>
          ),
        });
      } else {
        notifications.show({
          position: 'bottom-right',
          title: 'Error',
          message: error?.message || 'An error occurred while saving the blog',
          color: 'red',
        });
      }
    } finally {
      close();
    }
  };

  const handleWordCountChange = (count: number) => {
    console.log('wordCount ', count);
    setWordCount(count);
  };

  return (
    <Suspense fallback={<MantineLoader />}>
      <Container size="lg" mb={'4rem'} pos='relative'>
        <FullPageOverlay visible={isVisible} />

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
              </Grid.Col>

              {/* AI Diagram Toggle */}
              <Grid.Col span={12}>
                <Switch
                  label="Include AI Diagram"
                  description="AI will generate a visual diagram alongside the blog content"
                  checked={includeDiagram}
                  onChange={(e) => {
                    setIncludeDiagram(e.currentTarget.checked);
                    if (!e.currentTarget.checked) {
                      setSelectedDiagramType(null);
                      setDiagramMode('auto');
                    }
                  }}
                  thumbIcon={<IconSparkles size={12} />}
                  size="md"
                />
              </Grid.Col>

              {/* Diagram Mode + Type Picker */}
              {includeDiagram && (
                <Grid.Col span={12}>
                  <SegmentedControl
                    value={diagramMode}
                    onChange={(val) => {
                      setDiagramMode(val as 'auto' | 'manual');
                      if (val === 'auto') setSelectedDiagramType(null);
                    }}
                    data={[
                      {
                        value: 'auto',
                        label: (
                          <Flex align="center" gap={6}>
                            <IconWand size={16} />
                            <span>AI Auto</span>
                          </Flex>
                        ),
                      },
                      {
                        value: 'manual',
                        label: (
                          <Flex align="center" gap={6}>
                            <IconLayoutGrid size={16} />
                            <span>Choose Type</span>
                          </Flex>
                        ),
                      },
                    ]}
                    mb="md"
                  />

                  {diagramMode === 'auto' && (
                    <Paper p="md" withBorder radius="md">
                      <Flex align="center" gap="sm">
                        <IconSparkles size={20} color="#7c3aed" />
                        <Box>
                          <Text size="sm" fw={600}>AI will choose the best diagram type</Text>
                          <Text size="xs" c="dimmed">
                            Based on your blog title and content, AI will automatically select and generate the most suitable diagram
                          </Text>
                        </Box>
                      </Flex>
                    </Paper>
                  )}

                  {diagramMode === 'manual' && (
                    <DiagramTypePicker
                      selectedType={selectedDiagramType}
                      onSelect={setSelectedDiagramType}
                    />
                  )}
                </Grid.Col>
              )}

              {/* Description */}
              <Grid.Col span={12}>
                <Flex align="center" gap={4} mb={4}>
                  <Text size="sm" className='required'>Description</Text>
                  <AISuggestionButton
                    prompt={() => titleValue || ''}
                    onSuggestion={(suggestion) => {
                      const processed = includeDiagram
                        ? wrapSvgsForLexical(suggestion)
                        : suggestion;
                      setValue('description', processed);
                      setDescription(processed);
                    }}
                    extraParams={includeDiagram ? {
                      diagramContext: {
                        includeDiagram,
                        diagramMode,
                        diagramType: diagramMode === 'manual' ? selectedDiagramType : undefined,
                      },
                    } : undefined}
                  />
                </Flex>
                <LexicalEditor
                  ref={editorRef}
                  value={description}
                  onChange={setDescription}
                  onWordCountChange={handleWordCountChange}
                  placeholder="Write your blog content here..."
                />
                {errors.description && <Text c="red">{errors.description.message}</Text>}
              </Grid.Col>

              {/* Find My Category Search */}
              <Grid.Col span={{ base: 12, lg: 9, md: 12 }}>
                <CategorySearch
                  categories={categories}
                  onSelect={(path: CategoryPath) => {
                    setValue('categoryName', path.category);
                    setValue('subCategory', path.subCategory);
                    setValue('nestedSubCategory', path.nestedSubCategory);
                    handleCategoryChange(path.category);
                    if (path.subCategory) {
                      handleSubCategoryChange(path.subCategory);
                    }
                  }}
                />
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
                      searchable
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
                        searchable
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
                        searchable
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
              rules={{ required: (edit || aiGeneratedAsset) ? false : 'Blog Image is required' }}
              render={({ field }) => (
                <div>
                  <FileInput
                    clearable
                    label={
                      <Flex align="center" gap={4} mt="2rem">
                        <Text size="sm">
                          Blog Image{' '}
                          <Text component="span" size="lg" c="red">*</Text>
                        </Text>
                        <Tooltip label="Generate image with AI" withArrow>
                          <ActionIcon
                            variant="subtle"
                            color="violet"
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleGenerateAIImage();
                            }}
                            disabled={isGeneratingImage || isScanning || isModelLoading}
                          >
                            {isGeneratingImage ? <Loader size={14} /> : <IconSparkles size={16} />}
                          </ActionIcon>
                        </Tooltip>
                      </Flex>
                    }
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

                  {/* AI image generation status */}
                  {isGeneratingImage && (
                    <Group gap="xs" mt="xs">
                      <Loader size="xs" />
                      <Text size="xs" c="violet">
                        Generating image with AI...
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
              disabled={(!isDirty && !edit) || isScanning || isModelLoading || (validationError !== null) || (scanError !== null)}
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