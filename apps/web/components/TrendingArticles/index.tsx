"use client";

import React from 'react';
import {
  Container,
  Title,
  Card,
  Image,
  Text,
  Badge,
  Stack,
  Button,
  Avatar,
  Center,
  rem,
  Paper,
  Box,
  Group,
} from '@mantine/core';
import { Carousel } from '@mantine/carousel';
import { IconUser, IconEye, IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import '@mantine/carousel/styles.css';
import { createExcerpt } from '@whatsnxt/core-util';
import styles from './TrendingArticles.module.css';

interface Article {
  _id: string;
  title: string;
  slug: string;
  description: string;
  categoryName: string;
  imageUrl: string;
  author: string;
  updatedAt: string;
  listed: boolean;
  published: boolean;
}

interface TrendingArticlesProps {
  articles: Article[];
  total: number;
}

const TrendingArticles = ({ articles, total }: TrendingArticlesProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleReadMore = (slug: string) => {
    // Add validation
    if (!slug || slug === 'undefined') {
      console.warn('Invalid slug provided:', slug);
      window.location.href = 'https://www.whatsnxt.in/'; // fallback to home page
      return;
    }
    window.location.href = `/content/${slug}`;
  };

  const handleKeyDown = (event: React.KeyboardEvent, slug: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleReadMore(slug);
    }
  };

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {/* Enhanced Header with Gradient */}
        <Group justify="center" align="center" mb="md">
          <Box
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--mantine-color-indigo-6), var(--mantine-color-cyan-5))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)'
            }}
          >
            <IconEye size={20} color="white" />
          </Box>
          <div>
            <Group gap="sm">
              <Title
                order={4}
                fw={800}
                style={{
                  background: 'linear-gradient(135deg, var(--mantine-color-indigo-7) 0%, var(--mantine-color-cyan-6) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                Trending Articles
              </Title>
              <Badge
                size="md"
                variant="gradient"
                gradient={{ from: 'indigo', to: 'cyan', deg: 45 }}
                radius="xl"
                styles={{
                  root: {
                    textTransform: 'none',
                    fontWeight: 600
                  }
                }}
              >
                {total} Articles
              </Badge>
            </Group>
            <Text c="dimmed" size="sm" mt={4}>
              Discover the most popular content
            </Text>
          </div>
        </Group>

        {/* Articles Carousel */}
        {articles.length > 0 ? (
          <Carousel
            withControls
            height={480}
            slideSize={{ base: '100%', sm: '50%', md: '33.333333%' }}
            slideGap={{ base: 0, sm: 'md' }}
            controlsOffset="xs"
            controlSize={40}
            nextControlIcon={<IconChevronRight size={20} />}
            previousControlIcon={<IconChevronLeft size={20} />}
            draggable
            styles={{
              indicator: {
                width: rem(12),
                height: rem(4),
                transition: 'width 250ms ease',
                backgroundColor: '#cccccc', // Higher contrast than gray-4
              },
              control: {
                backgroundColor: '#ffffff',
                border: '1px solid #0066cc',
                color: '#0066cc',
                '&:hover': {
                  backgroundColor: '#0066cc',
                  color: '#ffffff',
                },
              },
            }}
            classNames={{
              control: styles.carouselControl,
              indicator: styles.carouselIndicator,
            }}
          >
            {articles.map((article) => (
              <Carousel.Slide key={article._id}>
                <Card
                  shadow="lg"
                  padding="0"
                  radius="lg"
                  h="100%"
                  withBorder
                  className={styles.trendingCard}
                  tabIndex={0}
                  role="article"
                  aria-label={`Article: ${article.title}`}
                  onKeyDown={(e) => handleKeyDown(e, article.slug)}
                  styles={{
                    root: {
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 24px rgba(99, 102, 241, 0.15)'
                      }
                    }
                  }}
                >
                  <Card.Section>
                    <Box style={{ position: 'relative', overflow: 'hidden' }}>
                      <Image
                        onClick={() => handleReadMore(article.slug)}
                        src={article.imageUrl || '/placeholder-article.jpg'}
                        height={180}
                        alt={`Cover image for article: ${article.title}`}
                        fit="cover"
                        className={styles.trendingImage}
                        fetchPriority='auto'
                        styles={{
                          root: {
                            transition: 'transform 0.3s ease',
                            '&:hover': {
                              transform: 'scale(1.05)'
                            }
                          }
                        }}
                      />
                    </Box>
                  </Card.Section>

                  <Stack gap="xs" mt="md" px="md" pb="md" className={styles.trendingContentStack}>
                    {/* Category Badge with gradient */}
                    <Badge
                      variant="light"
                      size="sm"
                      w="fit-content"
                      color="indigo"
                      radius="md"
                      styles={{
                        root: {
                          textTransform: 'uppercase',
                          fontWeight: 600,
                          fontSize: '0.7rem'
                        }
                      }}
                    >
                      {article.categoryName}
                    </Badge>

                    {/* Title with high contrast */}
                    <Title
                      order={5}
                      lineClamp={1}
                      fw={600}
                      size="sm"
                      my={'xs'}
                      className={styles.trendingTitleClickable}
                      onClick={() => handleReadMore(article.slug)}
                      tabIndex={0}
                      onKeyDown={(e) => handleKeyDown(e, article.slug)}
                    >
                      {article.title}
                    </Title>

                    {/* Description with improved contrast */}
                    {article.description && (
                      <Text
                        size="sm"
                        lineClamp={1}
                        m={0}
                        className={styles.trendingDescription}
                      >
                        {createExcerpt(article.description)}
                      </Text>
                    )}

                    {/* Author and Date with high contrast */}
                    <Group gap="xs" mt="auto" mb="xs">
                      <Avatar size="xs" radius="xl" className={styles.trendingAvatar}>
                        <IconUser size={rem(12)} color="#ffffff" />
                      </Avatar>
                      <Text
                        size="xs"
                        truncate
                        className={styles.trendingMeta}
                      >
                        {article.author}
                      </Text>
                      <Text
                        size="xs"
                        className={styles.trendingMeta}
                        suppressHydrationWarning
                      >
                        {formatDate(article.updatedAt)}
                      </Text>
                    </Group>

                    {/* Enhanced Read More Button */}
                    <Button
                      variant="gradient"
                      gradient={{ from: 'indigo', to: 'cyan', deg: 45 }}
                      size="xs"
                      fullWidth
                      radius="xl"
                      mb={12}
                      className={`${styles.trendingReadMore} ${styles.trendingButton}`}
                      onClick={() => handleReadMore(article.slug)}
                      styles={{
                        root: {
                          fontWeight: 600,
                          transition: 'all 0.2s ease'
                        }
                      }}
                    >
                      Read More →
                    </Button>
                  </Stack>
                </Card>
              </Carousel.Slide>
            ))}
          </Carousel>
        ) : (
          <Paper radius="md" p="xl" withBorder className={styles.trendingEmptyPaper}>
            <Center py="xl">
              <Stack align="center" gap="md">
                <IconEye
                  size={48}
                  className={styles.trendingEmptyIcon}
                />
                <Title
                  order={3}
                  className={styles.trendingEmptyTitle}
                >
                  No trending articles available
                </Title>
                <Text
                  ta="center"
                  className={styles.trendingEmptyText}
                >
                  Check back later for the latest trending content!
                </Text>
              </Stack>
            </Center>
          </Paper>
        )}
      </Stack>
    </Container>
  );
};

export default TrendingArticles;