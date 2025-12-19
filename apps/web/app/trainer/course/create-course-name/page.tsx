"use client";
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button, Select, Text, TextInput, Box, Title, Container, Paper, Stack, Group } from '@mantine/core';
import { LoadingSpinner } from '@whatsnxt/core-ui';
import { notifications } from '@mantine/notifications';
import { CourseAPI } from '../../../../apis/v1/courses/course/course';
import { Controller, useForm } from 'react-hook-form';
import { CategoriesAPI } from '../../../../apis/v1/courses/categories';
import { Category, SubCategory } from '@whatsnxt/core-util';
import { useRouter } from 'next/navigation';
import useAuth from '../../../../hooks/Authentication/useAuth';
import { IconChevronRight } from '@tabler/icons-react';

const CreateCourseName = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [nestedSubCategories, setNestedSubCategories] = useState<SubCategory[]>([]);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    control,
    formState: { errors, isValid },
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      courseName: '',
      categoryName: '',
      subCategory: '',
      nestedSubCategory: '',
    },
    resetOptions: {
      keepDirtyValues: true,
      keepErrors: true,
    },
  });

  const categoryValue = watch('categoryName');

  const validationOptions = {
    courseName: {
      required: 'Course name is required',
      maxLength: {
        value: 1000,
        message: 'Course name must be less than 1000 characters',
      },
    },
    categoryName: {
      required: true,
    },
  };

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await CategoriesAPI.getCategories();
      return data?.categories || [];
    },
  });

  const handleCategoryChange = (option) => {
    if (option?.subcategories) {
      setSubCategories(option.subcategories);
    } else {
      setSubCategories([]);
    }
    // Reset nested subcategories when category changes
    setNestedSubCategories([]);
  };

  const handleSubCategoryChange = (option) => {
    if (option?.subcategories) {
      setNestedSubCategories(option.subcategories);
    } else {
      setNestedSubCategories([]);
    }
  };

  const handleCourseNameSubmit = async (course, e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { courseName, categoryName, subCategory, nestedSubCategory } = course;
      const response = await CourseAPI.createCourseName({
        author: user.name,
        courseName,
        categoryName,
        subCategoryName: subCategory,
        nestedSubCategoryName: nestedSubCategory
      });
      console.log('🚀 ~ handleCourseNameSubmit ~ response:', response);

      setLoading(false);
      notifications.show({
        position: 'bottom-right',
        title: 'Course name success',
        message: 'Course name created successfully',
        color: 'green',
      });
      reset();
      router.push(`/trainer/course/course-type-information/${response.data._id}`);
    } catch (error) {
      console.log('Error during form submission:', error);
      setLoading(false);
      notifications.show({
        position: 'bottom-right',
        title: 'Course Name Error',
        message: error?.response?.data?.message,
        color: 'red',
      });
    }
  };

  // Prepare category options
  const categoryOptions = categories && Array.isArray(categories)
    ? categories.map(({ categoryName, subcategories }) => ({
      value: categoryName,
      label: categoryName,
      subcategories,
    }))
    : [];

  // Prepare subcategory options
  const subCategoryOptions = subCategories && Array.isArray(subCategories)
    ? subCategories.map(({ name, subcategories }) => ({
      value: name,
      label: name,
      subcategories,
    }))
    : [];

  // Prepare nested subcategory options
  const nestedSubCategoryOptions = nestedSubCategories && Array.isArray(nestedSubCategories)
    ? nestedSubCategories.map((category) => ({
      value: category.name,
      label: category.name,
    }))
    : [];

  return (
    <Box className="pb-100" pt={80}>
      <Container size="md">
        <Paper shadow="md" radius="lg" p="xl" withBorder>
          <form onSubmit={handleSubmit(handleCourseNameSubmit)}>
            {loading && <LoadingSpinner />}

            <Stack gap="lg">
              <Box>
                <Title order={3} mb="xs">
                  What category best fits the knowledge you'll share?
                </Title>
                <Text c="dimmed" size="sm" mb="md">
                  If you're not sure about the right category, you can change it later.
                </Text>

                {categoryOptions.length > 0 && (
                  <Box mb="sm">
                    <Controller
                      name="categoryName"
                      control={control}
                      rules={validationOptions.categoryName}
                      render={({ field }) => (
                        <Select
                          label="Category"
                          placeholder="Select category"
                          data={categoryOptions}
                          size="md"
                          {...field}
                          onChange={(value, option) => {
                            field.onChange(value);
                            handleCategoryChange(option);
                          }}
                        />
                      )}
                    />
                    {errors?.categoryName && <Text c="red" size="xs" mt={4}>Please select a category</Text>}
                  </Box>
                )}

                {categoryValue && subCategoryOptions.length > 0 && (
                  <Box mb="sm">
                    <Controller
                      name="subCategory"
                      control={control}
                      render={({ field }) => (
                        <Select
                          label="Sub-category (Optional)"
                          placeholder="Select sub-category"
                          data={subCategoryOptions}
                          size="md"
                          {...field}
                          onChange={(value, option) => {
                            field.onChange(value);
                            handleSubCategoryChange(option);
                          }}
                        />
                      )}
                    />
                  </Box>
                )}

                {nestedSubCategoryOptions.length > 0 && (
                  <Box mb="sm">
                    <Controller
                      name="nestedSubCategory"
                      control={control}
                      render={({ field }) => (
                        <Select
                          label="Topic (Optional)"
                          placeholder="Select topic"
                          data={nestedSubCategoryOptions}
                          size="md"
                          {...field}
                        />
                      )}
                    />
                  </Box>
                )}
              </Box>

              <Box>
                <Title order={3} mb="xs">
                  How about a course name?
                </Title>
                <Text c="dimmed" size="sm" mb="md">
                  It's ok if you can't think of a good title now. You can change it later.
                </Text>
                <TextInput
                  placeholder="e.g. Master React in 30 Days"
                  size="md"
                  {...register('courseName', validationOptions.courseName)}
                  error={errors.courseName?.message}
                />
              </Box>

              <Group justify="flex-end" mt="xl">
                <Button
                  type="submit"
                  size="md"
                  disabled={!isValid}
                  loading={loading}
                  rightSection={<IconChevronRight size={18} />}
                >
                  Continue
                </Button>
              </Group>
            </Stack>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default CreateCourseName;