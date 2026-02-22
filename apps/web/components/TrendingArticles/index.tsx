"use client";

import {
  Avatar,
  Badge,
  Box,
  Button,
  Center,
  Container,
  Group,
  Paper,
  rem,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconEye, IconUser } from "@tabler/icons-react";
import { CardComponent } from "@whatsnxt/core-ui";
import { createExcerpt } from "@whatsnxt/core-util";
import Image from "next/image";
import styles from "./TrendingArticles.module.css";

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

const MAX_ARTICLES = 8;

const TrendingArticles = ({ articles, total }: TrendingArticlesProps) => {
  const visibleArticles = articles.slice(0, MAX_ARTICLES);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getLink = (slug: string) =>
    !slug || slug === "undefined"
      ? "https://www.whatsnxt.in/"
      : `/content/${slug}`;

  return (
    <Container size="xl" my={'3.5rem'}>
      <Stack gap="lg">
        {/* Mobile: all centred, badge directly under heading */}
        <Stack align="center" gap={4} hiddenFrom="sm">
          <Text
            size="xs"
            fw={700}
            tt="uppercase"
            c="indigo"
            style={{ letterSpacing: "0.07em" }}
          >
            Latest Reading
          </Text>
          <Title order={5} ta="center" fw={700}>
            Trending Articles
          </Title>
          <Badge size="md" variant="light" color="indigo" radius="xl">
            {total} Articles
          </Badge>
        </Stack>

        {/* Desktop: centred title with badge pinned right */}
        <Box pos="relative" visibleFrom="sm">
          <Stack align="center" gap={2}>
            <Text
              size="xs"
              fw={700}
              tt="uppercase"
              c="indigo"
              style={{ letterSpacing: "0.07em" }}
            >
              Latest Reading
            </Text>
            <Title order={5} ta="center" fw={700}>
              Trending Articles
            </Title>
          </Stack>
          <Badge
            pos="absolute"
            right={0}
            top="50%"
            style={{ transform: "translateY(-50%)" }}
            size="md"
            variant="light"
            color="indigo"
            radius="xl"
          >
            {total} Articles
          </Badge>
        </Box>

        {articles.length > 0 ? (
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="lg">
            {visibleArticles.map((article) => (
              <CardComponent
                key={article._id}
                courseName={article.title}
                link={getLink(article.slug)}
                image={
                  <Box className={styles.imageContainer}>
                    {article.imageUrl && (
                      <Image
                        fill
                        className={styles.image}
                        alt={article.title}
                        src={article.imageUrl}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                    )}
                  </Box>
                }
              >
                <Badge
                  variant="light"
                  color="indigo"
                  size="xs"
                  tt="uppercase"
                  fw={600}
                  mb="xs"
                >
                  {article.categoryName}
                </Badge>

                {article.description && (
                  <Text size="xs" c="dimmed" lineClamp={2} mb="xs">
                    {createExcerpt(article.description)}
                  </Text>
                )}

                <Group gap="xs" mb="sm">
                  <Avatar size="xs" radius="xl" color="indigo">
                    <IconUser size={rem(10)} color="#ffffff" />
                  </Avatar>
                  <Text size="xs" c="dimmed" suppressHydrationWarning>
                    {formatDate(article.updatedAt)}
                  </Text>
                </Group>

                <Button
                  component="a"
                  href={getLink(article.slug)}
                  variant="filled"
                  color="indigo"
                  size="xs"
                  fullWidth
                  radius="md"
                >
                  Read More →
                </Button>
              </CardComponent>
            ))}
          </SimpleGrid>
        ) : (
          <Paper radius="md" p="xl" withBorder>
            <Center py="xl">
              <Stack align="center" gap="md">
                <IconEye size={48} color="var(--mantine-color-dimmed)" />
                <Title order={3} c="dimmed">
                  No trending articles available
                </Title>
                <Text ta="center" c="dimmed">
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
