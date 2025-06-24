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
  // Inject styles
  React.useEffect(() => {
    const styleId = 'trending-articles-carousel-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        .carousel-control[data-inactive] {
          opacity: 0;
          cursor: default;
        }
        
        .carousel-indicator[data-active] {
          width: 40px;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleReadMore = (slug: string) => {
    // Navigate to article detail page
    window.location.href = `/content/${slug}`;
  };

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {/* Header */}
        <Group justify="left" align="center">
          <Title order={2} size="h1" fw={600}>
            Trending Articles
          </Title>
          <Badge size="lg" variant="light" color="blue">
            {total} Articles
          </Badge>
        </Group>

        {/* Articles Carousel */}
        {articles.length > 0 ? (
          <Carousel
            withIndicators
            withControls
            height={460}
            slideSize={{ base: '100%', sm: '50%', md: '33.333333%' }}
            slideGap={{ base: 0, sm: 'md' }}
            controlsOffset="xs"
            controlSize={40}
            nextControlIcon={<IconChevronRight size={20} />}
            previousControlIcon={<IconChevronLeft size={20} />}
            emblaOptions={{
              loop: true,
              align: 'start',
              slidesToScroll: 1
            }}
            styles={{
              indicator: {
                width: rem(12),
                height: rem(4),
                transition: 'width 250ms ease',
                backgroundColor: 'var(--mantine-color-gray-4)',
              },
            }}
            classNames={{
              control: 'carousel-control',
              indicator: 'carousel-indicator',
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
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 200ms ease, box-shadow 200ms ease',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = 'var(--mantine-shadow-lg)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'var(--mantine-shadow-md)';
                  }}
                >
                  <Card.Section>
                    <Image onClick={() => handleReadMore(article.slug)}
                      src={article.imageUrl || '/placeholder-article.jpg'}
                      height={180}
                      alt={article.title}
                      fit="cover"
                      style={{ objectFit: 'cover' }}
                      fetchPriority='auto'
                    />
                  </Card.Section>

                  <Stack gap="xs" mt="sm" style={{ flex: 1 }}>
                    {/* Category Badge */}
                    <Badge variant="light" color="cyan" size="sm" w="fit-content">
                      {article.categoryName}
                    </Badge>

                    {/* Title */}
                    <Title order={5} lineClamp={2} fw={600} size="sm" my={'xs'} onClick={() => handleReadMore(article.slug)}>
                      {article.title}
                    </Title>

                    {/* Description - optional if you want to show it */}
                    {article.description && (
                      <Text size="sm" c="dimmed" lineClamp={2} m={0}>
                        {createExcerpt(article.description)}
                      </Text>
                    )}

                    {/* Author and Date */}
                    <Group gap="xs" mt="auto" mb="xs">
                      <Avatar size="xs" radius="xl" color="cyan">
                        <IconUser size={rem(12)} />
                      </Avatar>
                      <Text size="xs" c="dimmed" truncate style={{ maxWidth: '120px' }}>
                        {article.author}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {formatDate(article.updatedAt)}
                      </Text>
                    </Group>

                    {/* Read More Button */}
                    <Button
                      variant="light"
                      size="xs"
                      fullWidth
                      radius="md"
                      mb={10}
                      onClick={() => handleReadMore(article.slug)}
                      styles={{
                        root: {
                          transition: 'all 200ms ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                          },
                        },
                      }}
                    >
                      Read More
                    </Button>
                  </Stack>
                </Card>
              </Carousel.Slide>
            ))}
          </Carousel>
        ) : (
          <Paper radius="md" p="xl" withBorder>
            <Center py="xl">
              <Stack align="center" gap="md">
                <IconEye size={48} style={{ color: 'var(--mantine-color-gray-5)' }} />
                <Title order={3} c="dimmed">
                  No trending articles available
                </Title>
                <Text c="dimmed" ta="center">
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