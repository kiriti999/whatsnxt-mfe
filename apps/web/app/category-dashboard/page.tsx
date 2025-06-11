'use client';
import React, { Suspense, useEffect, useState } from 'react';
import {
  Container,
  Title,
  Box,
  Group,
  Text,
  ActionIcon,
  Stack,
  Paper
} from '@mantine/core';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import {
  Category,
  getArticleCountByCategory,
} from '../../store/slices/blogCategorySlice';
import { IconEdit } from '@tabler/icons-react';
import CategoryEditForm from './CategoryEditForm';
import { MantineLoader } from '@whatsnxt/core-ui';

const Categories = () => {
  const store = useSelector((store: RootState) => store.category);
  const dispatch = useDispatch<AppDispatch>();

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );

  const clearSelectedCategory = () => {
    setSelectedCategory(null);
    dispatch(getArticleCountByCategory());
  };

  const selectCategory = (category: Category) => {
    setSelectedCategory(category);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  useEffect(() => {
    dispatch(getArticleCountByCategory());
  }, [dispatch]);

  return (
    <Suspense fallback={<MantineLoader />}>
      <Box pt={20} pb={100}>
        <Container size="lg">
          <Stack gap="xl">
            {selectedCategory && (
              <CategoryEditForm
                category={selectedCategory}
                onClose={clearSelectedCategory}
              />
            )}

            <Title order={2} size="h2" fw={700} mb="lg">
              All categories:
            </Title>

            <Stack gap="sm">
              {store.categories.map((category) => (
                <Paper
                  key={category.categoryId}
                  p="md"
                  radius="md"
                  withBorder
                  style={{
                    transition: 'all 0.2s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'white';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                  }}
                >
                  <Group justify="space-between" align="center">
                    <Text size="md" fw={500}>
                      {category.categoryName}
                      <Text
                        component="span"
                        c="dimmed"
                        size="sm"
                        ml="xs"
                      >
                        ({category.count})
                      </Text>
                    </Text>

                    <ActionIcon
                      variant="subtle"
                      color="blue"
                      size="sm"
                      onClick={() => selectCategory(category)}
                      style={{
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#e7f5ff';
                        e.currentTarget.style.transform = 'scale(1.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    >
                      <IconEdit size={16} />
                    </ActionIcon>
                  </Group>
                </Paper>
              ))}
            </Stack>
          </Stack>
        </Container>
      </Box>
    </Suspense>
  );
};

export default Categories;