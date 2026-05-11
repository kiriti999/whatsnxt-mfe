import type { ElementType } from 'react';
import React from 'react';
import {
  Badge,
  Box,
  Button,
  Container,
  Grid,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { HeroWithText } from '../HeroWithText';
import styles from './MainBanner.module.css';

/** Live counts from `/system-design/stats` — when passed, the hero shows CTAs + compact metrics. */
export type MainBannerStats = {
  publishedCourses: number;
  publishedInterviewExperiences: number;
  completedPracticeSessions: number;
};

/** Optional Next.js `Link` (or similar) for client-side navigation; defaults to `<a>`. */
export type MainBannerLinkComponent = ElementType<{
  href: string;
  prefetch?: boolean;
  children?: React.ReactNode;
}>;

export type MainBannerProps = {
  stats?: MainBannerStats | null;
  LinkComponent?: MainBannerLinkComponent;
  /** Curated topic chips; defaults to built-in slugs matching `/system-design/browse?topic=`. */
  popularThemes?: { label: string; href: string }[];
};

const TOPIC_CHIPS: { label: string; href: string }[] = [
  { label: 'Load balancing', href: '/system-design/browse?topic=load-balancing' },
  { label: 'Caching', href: '/system-design/browse?topic=caching' },
  { label: 'Messaging', href: '/system-design/browse?topic=message-queues' },
  { label: 'Sharding', href: '/system-design/browse?topic=sharding' },
  { label: 'CAP trade-offs', href: '/system-design/browse?topic=cap-theorem' },
  { label: 'Estimation', href: '/system-design/browse?topic=qps' },
];

function HeroInlineLink({
  href,
  LinkComponent,
  children,
}: {
  href: string;
  LinkComponent?: MainBannerLinkComponent;
  children: React.ReactNode;
}) {
  const style: React.CSSProperties = { textDecoration: 'none', display: 'inline-flex' };
  if (LinkComponent) {
    const L = LinkComponent;
    return (
      <L href={href} prefetch style={style}>
        {children}
      </L>
    );
  }
  return (
    <a href={href} style={style}>
      {children}
    </a>
  );
}

export const MainBanner = ({ stats, LinkComponent, popularThemes }: MainBannerProps) => {
  const showRich = Boolean(stats);
  const chips = popularThemes ?? TOPIC_CHIPS;

  return (
    <Box
      pt={'2.3rem'}
      style={{
        backgroundImage: `
          linear-gradient(to right, rgba(99, 102, 241, 0.06) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(99, 102, 241, 0.06) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
        borderRadius: 'var(--mantine-radius-lg)',
        position: 'relative',
        padding: '2rem 0',
        marginBottom: '0.8rem',
      }}
    >
      <Container fluid style={{ position: 'relative', zIndex: 1 }}>
        <Grid justify="center" align="center">
          <Grid.Col span={12}>
            <Stack gap="lg" align="center">
              {showRich && stats ? (
                <>
                  <Badge variant="light" color="cyan" size="lg" radius="sm" tt="uppercase" fw={700}>
                    Interview-ready learning
                  </Badge>
                  <div style={{ textAlign: 'center' }}>
                    {/* <Title order={2} fw={800} className={styles.richHeroTitle}>
                      Empower your learning journey
                    </Title> */}
                    {/* <Text
                      mt="md"
                      className={styles.richHeroSubhead}
                      c="dimmed"
                      ta="center"
                      mx="auto"
                    >
                      System design depth, hands-on labs, and interview stories — structured the way
                      big-tech loops expect: requirements, scale, APIs, trade-offs, and failure modes.
                    </Text> */}
                  </div>
                  {/* <Text className={styles.richHeroBody} c="dimmed" ta="center" mx="auto" px="md">
                    Discover courses in every genre — live or recorded — plus tutorials and reads to
                    grow your skills.
                  </Text> */}
                  <Group justify="center" gap="sm" wrap="wrap" px="md">
                    <HeroInlineLink href="/courses" LinkComponent={LinkComponent}>
                      <Button component="span" size="md" radius="md" variant="gradient" gradient={{ from: 'cyan', to: 'blue', deg: 105 }}>
                        Browse courses
                      </Button>
                    </HeroInlineLink>
                    <HeroInlineLink href="/system-design/topics" LinkComponent={LinkComponent}>
                      <Button component="span" variant="light" size="md" radius="md">
                        System design topics
                      </Button>
                    </HeroInlineLink>
                    <HeroInlineLink href="/interview-experiences" LinkComponent={LinkComponent}>
                      <Button component="span" variant="light" size="md" radius="md">
                        Interview experiences
                      </Button>
                    </HeroInlineLink>
                    <HeroInlineLink href="/labs" LinkComponent={LinkComponent}>
                      <Button component="span" variant="default" size="md" radius="md">
                        Hands-on labs
                      </Button>
                    </HeroInlineLink>
                  </Group>
                  <Stack gap="xs" align="center" w="100%" maw={1024}>
                    <Text size="xs" fw={700} tt="uppercase" c="gray" style={{ letterSpacing: '0.06em' }}>
                      Popular design systems
                    </Text>
                    <Group justify="center" gap="xs" wrap="wrap">
                      {chips.map((t) => (
                        <HeroInlineLink key={t.href} href={t.href} LinkComponent={LinkComponent}>
                          <Badge
                            component="span"
                            variant="outline"
                            color="cyan"
                            size="lg"
                            radius="md"
                            style={{ cursor: 'pointer' }}
                          >
                            {t.label}
                          </Badge>
                        </HeroInlineLink>
                      ))}
                    </Group>
                  </Stack>
                  <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md" w="100%" maw={920} px="md">
                    <Paper withBorder shadow="xs" p="md" radius="md" h="100%">
                      <Stack gap={4} justify="space-between" h={84}>
                        <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                          Published system design courses
                        </Text>
                        <Title order={3}>
                          {stats.publishedCourses.toLocaleString()}
                        </Title>
                      </Stack>
                    </Paper>
                    <Paper withBorder shadow="xs" p="md" radius="md" h="100%">
                      <Stack gap={4} justify="space-between" h={84}>
                        <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                          Interview experiences
                        </Text>
                        <Title order={3}>
                          {stats.publishedInterviewExperiences.toLocaleString()}
                        </Title>
                      </Stack>
                    </Paper>
                    <Paper withBorder shadow="xs" p="md" radius="md" h="100%">
                      <Stack gap={4} justify="space-between" h={84}>
                        <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                          Completed practice sessions
                        </Text>
                        <Title order={3}>
                          {stats.completedPracticeSessions.toLocaleString()}
                        </Title>
                      </Stack>
                    </Paper>
                  </SimpleGrid>
                </>
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <Title order={3} fw={700} className={styles.mainBannerTitle}>
                    Empower Your Learning Journey
                  </Title>
                  <HeroWithText />
                </div>
              )}
            </Stack>
          </Grid.Col>
        </Grid>
      </Container>
    </Box>
  );
};
