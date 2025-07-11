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
  // Inject accessible styles with proper contrast ratios
  React.useEffect(() => {
    const styleId = 'trending-articles-accessible-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        /* High contrast carousel controls */
        .carousel-control[data-inactive] {
          opacity: 0;
          cursor: default;
        }
        
        .carousel-indicator[data-active] {
          width: 40px;
        }
        
        /* Enhanced focus states for accessibility */
        .trending-card:focus-within {
          outline: 2px solid #0066cc;
          outline-offset: 2px;
        }
        
        .trending-button:focus {
          outline: 2px solid #0066cc;
          outline-offset: 2px;
        }
        
        /* High contrast text improvements */
        .trending-title {
          color: #1a1a1a !important;
          font-weight: 600;
        }
        
        .trending-description {
          color: #333333 !important; /* Better than dimmed for contrast */
        }
        
        .trending-meta {
          color: #555555 !important; /* High contrast for meta text */
        }
        
        .trending-category-badge {
          background-color: #e6f3ff !important;
          color: #0066cc !important;
          border: 1px solid #0066cc !important;
        }
        
        .trending-total-badge {
          background-color: #e6f3ff !important;
          color: #0066cc !important;
          border: 1px solid #0066cc !important;
        }
        
        /* Empty state high contrast */
        .trending-empty-title {
          color: #333333 !important;
        }
        
        .trending-empty-text {
          color: #555555 !important;
        }
        
        .trending-empty-icon {
          color: #666666 !important;
        }
        
        /* Button hover states with high contrast */
        .trending-read-more:hover {
          background-color: #0052a3 !important;
          color: #ffffff !important;
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
            style={{ color: 'var(--trending-title-color, #1a1a1a)' }}
          >
            Trending Articles
          </Title>
          <Badge
            size="lg"
            variant="outline"
            className="trending-total-badge"
            styles={{
              root: {
                backgroundColor: '#e6f3ff',
                color: '#0066cc',
                border: '1px solid #0066cc',
                fontWeight: 600,
              }
            }}
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
            emblaOptions={{
              loop: true,
              align: 'center',
              dragFree: true,
              slidesToScroll: 1
            }}
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
                  className="trending-card"
                  tabIndex={0}
                  role="article"
                  aria-label={`Article: ${article.title}`}
                  onKeyDown={(e) => handleKeyDown(e, article.slug)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 200ms ease, box-shadow 200ms ease',
                    cursor: 'pointer',
                    border: '0.75px solid #d1d5db', // Higher contrast border
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0, 102, 204, 0.25), 0 10px 10px -5px rgba(0, 102, 204, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = 'var(--mantine-shadow-md)';
                  }}
                >
                  <Card.Section>
                    <Image
                      onClick={() => handleReadMore(article.slug)}
                      src={article.imageUrl || '/placeholder-article.jpg'}
                      height={180}
                      alt={`Cover image for article: ${article.title}`}
                      fit="cover"
                      style={{ objectFit: 'cover' }}
                      fetchPriority='auto'
                    />
                  </Card.Section>

                  <Stack gap="xs" mt="sm" style={{ flex: 1 }}>
                    {/* Category Badge with high contrast */}
                    <Badge
                      variant="outline"
                      size="sm"
                      w="fit-content"
                      className="trending-category-badge"
                      styles={{
                        root: {
                          backgroundColor: '#e6f3ff',
                          color: '#0066cc',
                          border: '1px solid #0066cc',
                          fontWeight: 500,
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
                      className="trending-title"
                      onClick={() => handleReadMore(article.slug)}
                      style={{
                        color: '#1a1a1a',
                        cursor: 'pointer',
                      }}
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
                        className="trending-description"
                        style={{ color: '#333333' }} // Much better contrast than dimmed
                      >
                        {createExcerpt(article.description)}
                      </Text>
                    )}

                    {/* Author and Date with high contrast */}
                    <Group gap="xs" mt="auto" mb="xs">
                      <Avatar size="xs" radius="xl" style={{ backgroundColor: '#0066cc' }}>
                        <IconUser size={rem(12)} color="#ffffff" />
                      </Avatar>
                      <Text
                        size="xs"
                        truncate
                        style={{
                          maxWidth: '120px',
                          color: '#555555' // High contrast for meta text
                        }}
                        className="trending-meta"
                      >
                        {article.author}
                      </Text>
                      <Text
                        size="xs"
                        className="trending-meta"
                        style={{ color: '#555555' }}
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
                      className="trending-read-more trending-button"
                      onClick={() => handleReadMore(article.slug)}
                      styles={{
                        root: {
                          backgroundColor: '#0066cc',
                          color: '#ffffff',
                          fontWeight: 600,
                          transition: 'all 200ms ease',
                          border: 'none',
                          '&:hover': {
                            backgroundColor: '#0052a3',
                            transform: 'translateY(-2px)',
                          },
                          '&:focus': {
                            outline: '2px solid #0066cc',
                            outlineOffset: '2px',
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
          <Paper radius="md" p="xl" withBorder style={{ borderColor: '#d1d5db' }}>
            <Center py="xl">
              <Stack align="center" gap="md">
                <IconEye
                  size={48}
                  className="trending-empty-icon"
                  style={{ color: '#666666' }} // Much better contrast than gray-5
                />
                <Title
                  order={3}
                  className="trending-empty-title"
                  style={{ color: '#333333' }} // High contrast instead of dimmed
                >
                  No trending articles available
                </Title>
                <Text
                  ta="center"
                  className="trending-empty-text"
                  style={{ color: '#555555' }} // High contrast instead of dimmed
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