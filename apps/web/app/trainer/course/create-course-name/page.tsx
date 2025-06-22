"use client";
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button, Select, Text, TextInput, Box, Title } from '@mantine/core';
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
    <Box className="pb-100">
      <div className="container">
        <div className="row">
          <div className="col-md-12 col-lg-12 mt-3">
            <Box className="border-box" p="md" mb="md">
              <form onSubmit={handleSubmit(handleCourseNameSubmit)}>
                {loading && <LoadingSpinner />}

                <Title order={4}>
                  What category best fits the knowledge you'll share?
                </Title>
                <Text>
                  If you're not sure about the right category, you can change it later.
                </Text>

                {categoryOptions.length > 0 && (
                  <Box mb="md">
                    <Controller
                      name="categoryName"
                      control={control}
                      rules={validationOptions.categoryName}
                      render={({ field }) => (
                        <Select
                          placeholder="Select category"
                          data={categoryOptions}
                          {...field}
                          onChange={(value, option) => {
                            field.onChange(value);
                            handleCategoryChange(option);
                          }}
                        />
                      )}
                    />
                    {errors?.categoryName && <Text c="red" size="md">Please select a category</Text>}
                  </Box>
                )}

                {categoryValue && subCategoryOptions.length > 0 && (
                  <Box mb='md'>
                    <Controller
                      name="subCategory"
                      control={control}
                      render={({ field }) => (
                        <Select
                          label="Optional"
                          placeholder="Select subCategory"
                          data={subCategoryOptions}
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
                  <Box mb='md'>
                    <Controller
                      name="nestedSubCategory"
                      control={control}
                      render={({ field }) => (
                        <Select
                          label="Optional"
                          placeholder="Select NestedSubCategory"
                          data={nestedSubCategoryOptions}
                          {...field}
                        />
                      )}
                    />
                  </Box>
                )}

                <Box mb="md">
                  <Title order={4}>
                    How about a course name?
                  </Title>
                  <Text>
                    It's ok if you can't think of a good title now. You can change it later.
                  </Text>
                  <TextInput
                    placeholder="Enter course name"
                    {...register('courseName', validationOptions.courseName)}
                  />
                  {errors.courseName && <Text c="red" size="md">{errors.courseName ? errors.courseName.message : null}</Text>}
                </Box>

                <Button
                  type="submit"
                  disabled={!isValid}
                  loading={loading}
                  leftSection={<IconChevronRight />}
                >
                  Continue
                </Button>
              </form>
            </Box>
          </div>
        </div>
      </div>
    </Box>
  );
};

export default CreateCourseName;