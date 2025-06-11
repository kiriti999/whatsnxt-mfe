import React, { useEffect, useState, useCallback, Suspense } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Box, Button, Container, FileInput, Grid, Select, Text, TextInput, Title, LoadingOverlay, Loader, Switch } from '@mantine/core';
import { useRouter } from 'next/navigation';
import { notifications } from '@mantine/notifications';
import { BlogFormProps } from '../../../types/blogs';
import { CloudinaryAPI, FormAPI, HistoryAPI } from '../../../api/v1/blog';
import { getCategoryId } from '../../../utils/form';
import { IconUpload } from '@tabler/icons-react';
import { RichTextEditor } from '../../RichTextEditor';
import { useDisclosure } from '@mantine/hooks';
import { MantineLoader } from '@whatsnxt/core-ui';
import { AISuggestions } from '../../../api/v1/blog/aiSuggestions';
import Image from 'next/image';

const BlogForm: React.FC<BlogFormProps> = ({ categories, edit }) => {
  const [isVisible, { open, close }] = useDisclosure(false);
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [nestedSubCategories, setNestedSubCategories] = useState<any[]>([]);
  const [blogImage, setCourseImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const router = useRouter();
  const [wordCount, setWordCount] = useState(0);
  const [contentIsMarkdown, setContentIsMarkdown] = useState(false);

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

  const handleFormSubmit = async (formData: any, e: any) => {
    e.preventDefault();
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
      const cloudinaryAssets = edit?.cloudinaryAssets || [];

      if (blogImage) {
        console.log(`Uploading...`)
        const fileUploadResData = await CloudinaryAPI.uploadFormImage(blogImage, 'image')
        console.log(' handleFormSubmit :: fileUploadResData:', fileUploadResData)
        imageUrl = fileUploadResData?.secure_url;
        cloudinaryAssets.push({
          publicId: fileUploadResData?.public_id,
          type: fileUploadResData?.resource_type,
          url: fileUploadResData.url,
          secureUrl: imageUrl,
          format: fileUploadResData.format
        })
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
          title: `Blog ${edit ? 'Updated' : 'Created'}`,
          message: `Blog successfully ${edit ? 'updated' : 'created'}`,
          color: 'green',
        });
        router.push('/history/table');
      } else {
        throw new Error('Blog creation failed.');
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'An error occurred while saving the blog',
        color: 'red',
      });
    } finally {
      close();
    }
  };

  const handleImageChange = (file: File | null) => {
    setCourseImage(file);

    if (file) {
      const fileReader = new FileReader();
      fileReader.onload = (e) => {
        setImagePreview(e.target?.result as string); // Set image preview
      };
      fileReader.readAsDataURL(file); // Read the file as a data URL
    } else {
      setImagePreview(null); // Reset preview if no file is selected
    }
  };

  const handleWordCountChange = (count: number) => {
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
          <Title mb={'lg'} order={2}>{edit ? 'Edit blog' : 'Create blog'}</Title>
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
                <Text size="sm">Description</Text>
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

            <Controller
              name="blogImagePreview"
              control={control}
              rules={{ required: edit ? false : 'Blog Image is required' }}
              render={({ field }) => (
                <FileInput
                  clearable
                  label={<Text size='sm' mt={'2rem'}>Blog Image <Text component="span" size='lg' c="red">*</Text></Text>}
                  placeholder="Select course image"
                  leftSection={<IconUpload size={16} />}
                  value={blogImage}
                  onChange={(e) => {
                    handleImageChange(e);
                    field.onChange(e);
                  }}
                  accept=".png,.jpg,.jpeg"
                />
              )}
            />
            {errors.blogImagePreview && <Text c="red">{errors.blogImagePreview.message}</Text>}

            {/* Course Image Technical Requirements */}
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
            </Box>

            {/* Image Preview */}
            {imagePreview && (
              <Box mt="md">
                <Title order={5}>Image Preview:</Title>
                <Image
                  alt="blog image preview"
                  src={imagePreview}
                  width={300}
                  height={200}
                  sizes="(max-width: 480px) 300px, (max-width: 768px) 320px, 340px"
                />
              </Box>
            )}

            <Button type="submit" mt="md" disabled={!isDirty}>
              {edit ? 'Update' : 'Create'}
            </Button>
          </form>
        </Box>
      </Container>
    </Suspense>
  );
};

export default BlogForm;
