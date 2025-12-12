"use client";

import React from 'react';
import {
  Container,
  Title,
  Card,
  Image,
  Text,
  Badge,
  Group,
  Stack,
  Button,
  Avatar,
  Center,
  rem,
  Paper,
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
        {/* Header with improved contrast */}
        <Group justify="left" align="center">
          <Title
            order={2}
            size="h1"
            fw={600}
            className={styles.trendingTitle}
          >
            Trending Articles
          </Title>
          <Badge
            size="lg"
            variant="outline"
            className={styles.trendingTotalBadge}
          >
            {total} Articles
          </Badge>
        </Group>

        {/* Articles Carousel */}
        {articles.length > 0 ? (
          <Carousel
            withControls
            height={460}
            slideSize={{ base: '100%', sm: '50%', md: '33.333333%' }}
            slideGap={{ base: 0, sm: 'md' }}
            controlsOffset="xs"
            controlSize={40}
            nextControlIcon={<IconChevronRight size={20} />}
            previousControlIcon={<IconChevronLeft size={20} />}
            loop
            align="center"
            dragFree
            slidesToScroll={1}
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
                  shadow="md"
                  padding="md"
                  radius="md"
                  py={0}
                  withBorder
                  h="100%"
                  className={styles.trendingCard}
                  tabIndex={0}
                  role="article"
                  aria-label={`Article: ${article.title}`}
                  onKeyDown={(e) => handleKeyDown(e, article.slug)}
                >
                  <Card.Section>
                    <Image
                      onClick={() => handleReadMore(article.slug)}
                      src={article.imageUrl || '/placeholder-article.jpg'}
                      height={180}
                      alt={`Cover image for article: ${article.title}`}
                      fit="cover"
                      className={styles.trendingImage}
                      fetchPriority='auto'
                    />
                  </Card.Section>

                  <Stack gap="xs" mt="sm" className={styles.trendingContentStack}>
                    {/* Category Badge with high contrast */}
                    <Badge
                      variant="outline"
                      size="sm"
                      w="fit-content"
                      className={styles.trendingCategoryBadge}
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
                        lineClamp={2}
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

                    {/* Read More Button with high contrast */}
                    <Button
                      variant="filled"
                      size="xs"
                      fullWidth
                      radius="md"
                      mb={10}
                      className={`${styles.trendingReadMore} ${styles.trendingButton}`}
                      onClick={() => handleReadMore(article.slug)}
                    >
                      Read More
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