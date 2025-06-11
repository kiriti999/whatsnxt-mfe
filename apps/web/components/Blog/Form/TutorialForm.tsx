import React, { useEffect, useState, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { notifications } from '@mantine/notifications';
import { CategoryData } from '@/types/form';
import { useSaved } from '@/hooks/saved';
import { getCategoryId } from '@/utils/form';
import type { Category, Detail, Tutorial } from '@/types/form';
import { CloudinaryAPI, FormAPI, HistoryAPI } from '../../../api/v1/blog';
import Pagination from '../../Common/Pagination';
import { RichTextEditor } from '../../RichTextEditor';
import { useRouter } from 'next/navigation';
import { Alert, Box, Button, Container, FileInput, Grid, Group, Input, Select, Stack, Text, Title, LoadingOverlay } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { LoadingOverlay as CustomLoadingOverlay } from '@whatsnxt/core-ui';
import { TiptapManageContextProvider } from '../../../context/TiptapManageContext';
import AssetUploadProgress from '../../RichTextEditor/common/AssetUploadProgress';
import {
  cloudinaryAssetsUploadCleanup,
  cloudinaryAssetsUploadCleanupForUpdate,
} from '../../RichTextEditor/common';
import { IconUpload } from '@tabler/icons-react';
import Image from 'next/image';

interface TutorialFormProps {
  categories: Category[];
  edit?: {
    id: string;
    title: string;
    categoryName: string;
    subCategory: string;
    nestedSubCategory: string;
    tutorials: Tutorial[];
    imageUrl?: string;
    cloudinaryAssets: {
      publicId: string;
      type: string;
      url: string;
      secureUrl: string;
      format: string;
    }[] | null
  };
}

const TutorialForm: React.FC<TutorialFormProps> = (props) => {
  const { categories, edit } = props;
  const [visible, { open, close }] = useDisclosure(false);
  const [categoryData, setCategoryData] = useState<CategoryData>({
    imageUrl: '',
    text: '',
  });

  const [isAlert, setIsAlert] = useState(false);
  const [showAlertMessage, setShowAlertMessage] = useState<any>({});
  const [details, setDetails] = useState<Detail | null>(null);

  const [detailed, setDetailed] = useState<boolean>(true);
  const [description, setDescription] = useState<string>('');
  const [tutorials, setTutorials] = useState<Tutorial[]>([
    { title: '', description: '' },
  ]);
  const [active, setActive] = useState<number>(1);
  const [unsaved, setUnsaved] = useState<boolean>(true);
  const [isAssetsUploading, setIsAssetsUploading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [nestedSubCategories, setNestedSubCategories] = useState<any[]>([]);
  const [tutorialImage, setTutorialImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      tutorialName: '',
      title: details ? details.title : '',
      categoryName: details?.categoryName || '',
      subCategory: details?.subCategory || '',
      nestedSubCategory: details?.nestedSubCategory || '',
      tutorialImagePreview: ''
    },
    resetOptions: {
      keepDirtyValues: true,
      keepErrors: true,
    },
  });

  const router = useRouter();
  useSaved(unsaved);

  useEffect(() => {
    if (edit) {
      setDetails({
        title: edit.title,
        categoryId: getCategoryId(categories, edit.categoryName),
        categoryName: edit.categoryName,
        subCategory: edit?.subCategory || '',
        nestedSubCategory: edit?.nestedSubCategory || '',
        published: false,
      });
      setTutorials(edit.tutorials);
      setValue('tutorialName', edit.title);
      setValue('categoryName', edit.categoryName);
      setValue('subCategory', edit.subCategory);
      setValue('nestedSubCategory', edit.nestedSubCategory);

      const selectedCategory = categories.find((cat) => cat.categoryName === edit.categoryName);
      if (selectedCategory?.subcategories) {
        const mappedSubCategories = selectedCategory.subcategories.map((sub) => ({
          value: sub.name,
          label: sub.name,
          subcategories: sub.subcategories,
        }));
        setSubCategories(mappedSubCategories);

        const selectedSubCategory = mappedSubCategories.find((sub) => sub.value === edit.subCategory);
        if (selectedSubCategory?.subcategories) {
          const mappedNestedSubCategories = selectedSubCategory.subcategories.map((nested) => ({
            value: nested.name,
            label: nested.name,
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
  }, [edit]);

  const categoryValue = watch('categoryName');

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsAlert(false);
    }, 5000);
    return () => clearTimeout(timeout);
  }, [isAlert]);

  useEffect(() => {
    if (active > 0) {
      const activeTutorial = tutorials[active - 1];
      setValue('title', activeTutorial?.title || '');
      setDescription(activeTutorial?.description || '');
    }
  }, [tutorials, active, setValue]);

  const validationOptions = {
    tutorialName: { required: 'Tutorial name is required', maxLength: 250 },
    title: { required: 'Title is required', maxLength: 250 },
    description: { required: 'Description is required' },
  };

  const addTutorial = useCallback(
    handleSubmit((data) => {
      setUnsaved(true);
      const copy = [...tutorials];
      if (active > 0) {
        copy[active - 1] = {
          title: getValues('title'),
          description,
        };
      }
      copy.push({ title: '', description: '' });
      setActive(copy.length);
      setTutorials(copy);
    }),
    [tutorials, description, active, getValues]
  );

  const submitDetails = useCallback(() => {
    const categoryName: any = getValues('categoryName');
    setDetails({
      title: getValues('title'),
      categoryId: getCategoryId(categories, categoryName),
      categoryName: categoryName,
      subCategory: getValues('subCategory') || '',
      nestedSubCategory: getValues('nestedSubCategory') || '',
      published: false,
    });

    setDetailed(true);
    if (tutorials.length === 0) addTutorial();
  }, [categories, tutorials, getValues, addTutorial]);

  const deleteTutorial = useCallback(() => {
    if (tutorials.length === 1) return;
    setUnsaved(true);
    const copy = tutorials.filter((_, i) => i !== active - 1);
    setActive(copy.length);
    setTutorials(copy);
  }, [tutorials, active]);

  const navPage = useCallback(
    (page: number) => {
      if (active > 0) {
        const copy = [...tutorials];
        copy[active - 1] = { title: getValues('title'), description };
        setTutorials(copy);
      } else {
        submitDetails();
      }
      setActive(page);
    },
    [tutorials, description, active, getValues, submitDetails]
  );

  const checkValidationEachPage = (tutorials: Tutorial[]) => {
    const validationErrors: string[] = [];
    tutorials.forEach((tutorial, index) => {
      if (!tutorial.title) {
        validationErrors.push(`Page ${index + 1} title is required`);
      }
    });

    if (validationErrors.length > 0) {
      setValidationErrors(validationErrors);
      return true;
    }

    return false;
  };

  const checkCleanupCloudinaryAssets = (tutorials: Tutorial[]) => {
    let updatedTutorials: Tutorial[] = [];
    if (edit && edit.tutorials) {
      const maxLength = Math.max(edit?.tutorials?.length, tutorials?.length);
      for (let index = 0; index < maxLength; index++) {
        const oldContent = edit?.tutorials[index]?.description || null;
        const newContent = tutorials[index]?.description || null;
        const getList = cloudinaryAssetsUploadCleanupForUpdate({
          oldContent,
          newContent,
        });
        if (index < tutorials.length) {
          updatedTutorials.push({
            ...tutorials[index],
            cloudinaryAssets: getList,
          });
        }

      }

      return updatedTutorials;
    }

    updatedTutorials = tutorials.map((tutorial) => {
      const getList = cloudinaryAssetsUploadCleanup({
        content: tutorial.description,
      });
      return {
        ...tutorial,
        cloudinaryAssets: getList,
      }
    });

    return updatedTutorials;
  };

  const handleFormSubmit = useCallback(
    async (formData: any) => {
      const copyTutorial = [...tutorials];
      copyTutorial[active - 1] = { title: getValues('title'), description };
      setTutorials(copyTutorial);

      if (checkValidationEachPage(copyTutorial)) {
        return;
      }
      const updatedTutorialsList =
        checkCleanupCloudinaryAssets(copyTutorial);

      const categoryName: any = getValues('categoryName');

      let imageUrl = edit?.imageUrl || '';
      const cloudinaryAssets = edit?.cloudinaryAssets || [];

      if (tutorialImage) {
        console.log(`Uploading...`)
        const fileUploadResData = await CloudinaryAPI.uploadFormImage(tutorialImage, 'image')
        imageUrl = fileUploadResData?.secure_url;
        cloudinaryAssets.push({
          publicId: fileUploadResData?.public_id,
          type: fileUploadResData?.resource_type,
          url: fileUploadResData.url,
          secureUrl: imageUrl,
          format: fileUploadResData.format
        })
      }

      const details = {
        title: getValues('tutorialName'),
        description: formData.description,
        categoryId: getCategoryId(categories, categoryName),
        categoryName,
        subCategory: formData.subCategory,
        nestedSubCategory: formData.nestedSubCategory,
        imageUrl: imageUrl,
        published: false,
        cloudinaryAssets
      };

      setUnsaved(false);
      open();

      try {
        const payload = { ...details, tutorials: updatedTutorialsList };

        const response = edit
          ? await FormAPI.updateTutorial(edit.id, payload)
          : await FormAPI.createTutorial(payload);


        if (response.success) {
          if (edit) {
            await HistoryAPI.publishDraft(edit.id, false); // unpublish on edit
          }

          notifications.show({
            title: `Tutorial ${edit ? 'Updated' : 'Created'}`,
            message: `Tutorial successfully ${edit ? 'updated' : 'created'}`,
            color: 'green',
          });

          router.push('/history/table');

        }
        if (!response.success) {
          notifications.show({
            title: `Tutorial ${edit ? 'Update' : 'Create'} Error`,
            message: response[0]
              ? response[0].message
              : `Tutorial failed to ${edit ? 'update' : 'create'}`,
            color: 'red',
          });
        }
      } catch (error) {
        notifications.show({
          title: `Tutorial ${edit ? 'Update' : 'Create'} Error`,
          message: `${error.message}`,
          color: 'red',
        });
      } finally {
        close();
      }
    },
    [
      tutorials,
      description,
      active,
      details,
      detailed,
      edit,
      getValues,
      submitDetails,
      tutorialImage
    ]
  );

  // Update subcategories when a category is selected
  const handleCategoryChange = useCallback(
    (value: string) => {
      const selectedCategory = categories.find((cat) => cat.categoryName === value);
      const selectedCategoriesToUpdate = selectedCategory?.subcategories?.map((sub) => ({
        value: sub.name,
        label: sub.name,
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
          value: nested.name,
          label: nested.name,
        })) || []
      );
    },
    [subCategories]
  );

  const handleImageChange = (file: File | null) => {
    setTutorialImage(file);
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

  return (
    <Container>
      <LoadingOverlay visible={visible} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
      <Box>
        <Title order={2}>{edit ? 'Edit tutorial details' : 'Post a tutorial'}</Title>

        {isAlert && <Alert withCloseButton>{showAlertMessage.message}</Alert>}
        {validationErrors.length > 0 && (
          <Alert mb={'1em'} mt={'2px'} title="Validation Errors" color="red">
            {validationErrors.map((error, index) => (
              <div key={index}>{error}</div>
            ))}
          </Alert>
        )}

        < TiptapManageContextProvider
          isAssetsUploading={isAssetsUploading}
          setIsAssetsUploading={setIsAssetsUploading}
        >
          <CustomLoadingOverlay visible={visible}>
            <form onSubmit={handleSubmit(handleFormSubmit)}>
              <Stack gap={0} mt={'md'}>
                <Text fz={15}>Tutorial name <Text component="span" m={0} size='lg' c="red">*</Text></Text>
                <Input tabIndex={1}
                  placeholder="Enter tutorial name"
                  {...register('tutorialName', validationOptions.tutorialName)}
                />
                <Text className="text-danger">
                  {errors?.tutorialName &&
                    errors.tutorialName?.message?.toString()}
                  {errors.tutorialName &&
                    errors.tutorialName.type === 'maxLength' && (
                      <span>Max length exceeded</span>
                    )}
                </Text>
              </Stack>

              <Stack gap={'0.1rem'} mt={'md'}>
                <Text fz={15}>Title <Text component="span" m={0} size='lg' c="red">*</Text></Text>
                <Input tabIndex={2}
                  placeholder="Title"
                  {...register('title', validationOptions.title)}
                />
                <Text className="text-danger">
                  {errors?.title && errors.title?.message?.toString()}
                  {errors.title && errors.title.type === 'maxLength' && (
                    <span>Max length exceeded</span>
                  )}
                </Text>
              </Stack>

              {detailed && (
                <Stack gap={'0.1rem'} mt={'md'}>
                  <Text>Description</Text>
                  <div>
                    <AssetUploadProgress />
                  </div>
                  <RichTextEditor
                    content={description}
                    onChange={setDescription}
                  />
                </Stack>
              )}

              <Stack gap={0} mt={'md'} mb={'xs'}>
                <Grid gutter="lg">
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
                    {errors.categoryName && <Text c="red">{errors.categoryName?.message}</Text>}
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
                            label={<Text fz={15}>Nested Subcategory <Text component="span" m={0} size='lg' c="red">*</Text></Text>}
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
              </Stack>

              <Controller
                name="tutorialImagePreview"
                control={control}
                rules={{ required: edit ? false : 'Tutorial Image is required' }}
                render={({ field }) => (
                  <FileInput
                    clearable
                    label={<Text fz={15}>Tutorial Image <Text component="span" m={0} size='lg' c="red">*</Text></Text>}
                    placeholder="Select tutorial image"
                    leftSection={<IconUpload size={16} />}
                    value={tutorialImage}
                    onChange={(e) => {
                      handleImageChange(e);
                      field.onChange(e);
                    }}
                    accept=".png,.jpg,.jpeg"
                  />
                )}
              />
              {errors.tutorialImagePreview && <Text c="red">{errors.tutorialImagePreview.message}</Text>}

              {/* Course Image Technical Requirements */}
              <Box mt="lg" style={{ textAlign: 'left' }}>
                <Title order={5}>Tutorial Image Requirements</Title>
                <Text size="sm" mt="xs">
                  <strong>Image formats:</strong> The file format must be .jpg, .jpeg, or .png.
                </Text>
                <Text size="sm" mt="xs">
                  <strong>Image dimensions:</strong> Always design your tutorial image at the following pixel dimensions. The image design needs to be within the content safe area for maximum visibility.
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
                    alt="tutorial image preview"
                    width={300}
                    height={200}
                    sizes="(max-width: 480px) 300px, (max-width: 768px) 320px, 340px"
                    src={imagePreview}
                  />
                </Box>
              )}

              <Stack>
                <Pagination
                  disabled={isAssetsUploading}
                  nPages={tutorials.length}
                  currentPage={active}
                  setCurrentPage={navPage}
                />
              </Stack>

              <Stack mb={'xl'} mt={'xl'}>
                <Grid gutter={'xl'}>
                  <Grid.Col span={{ base: 12, sm: 6, md: !categoryData?.imageUrl && categoryData.text ? 4 : 12 }}>
                    <Stack mt={'0.5rem'}>
                      {tutorials.length > 0 && (
                        <>
                          <Group>
                            <Button fullWidth
                              type="button" onClick={deleteTutorial}>
                              Delete this page
                            </Button>
                          </Group>

                          <Group>
                            <Button fullWidth
                              disabled={isAssetsUploading}
                              type="button"
                              onClick={addTutorial}
                            >
                              Add new page
                            </Button>
                          </Group>
                        </>
                      )}

                      <Group>
                        <Button fullWidth
                          disabled={isAssetsUploading} type="submit">
                          {edit ? 'Update' : 'Create'}
                        </Button>
                      </Group>
                    </Stack>
                  </Grid.Col>

                </Grid>
              </Stack>

            </form>
          </CustomLoadingOverlay>
        </TiptapManageContextProvider>
      </Box>
    </Container>
  );
};

export default TutorialForm;
