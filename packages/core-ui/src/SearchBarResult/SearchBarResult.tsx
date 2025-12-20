import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Anchor, Skeleton, Title, Box, Grid, Stack, Paper } from '@mantine/core';
import styles from './SearchBarResult.module.css';

export type SearchResultProps = {
  data: any[] | null;
  isLoading: boolean;
  search: string;
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  containerRef: React.RefObject<HTMLDivElement>;
};

export const SearchBarResult = ({ data, isLoading, search, show, setShow, containerRef }: SearchResultProps) => {

  if (!show || search.length <= 1) return null;

  return (
    <Box className={styles['search-results']} ref={containerRef}>
      <Paper shadow="md" radius="md" withBorder style={{ overflow: 'hidden', maxHeight: '80vh', overflowY: 'auto' }}>
        {isLoading ? (
          <Stack gap="xs" p="sm">
            {[...Array(3).keys()].map(i => (
              <Grid key={i} align="center">
                <Grid.Col span="content">
                  <Skeleton height={40} width={60} radius="sm" />
                </Grid.Col>
                <Grid.Col span="auto">
                  <Skeleton height={14} width="80%" radius="xl" />
                  <Skeleton height={10} width="60%" radius="xl" mt={6} />
                </Grid.Col>
              </Grid>
            ))}
          </Stack>
        ) : data && data.length > 0 ? (
          <Stack gap={0}>
            {data.map((content, i) => (
              <Anchor
                underline="never"
                component={Link}
                key={i}
                href={'/courses/' + content.slug}
                p="sm"
                display="block"
                onClick={() => setShow(false)}
                className={styles['result-item']}
                style={{
                  textDecoration: 'none',
                  borderBottom: i !== data.length - 1 ? '1px solid var(--mantine-color-gray-2)' : 'none',
                  color: 'inherit'
                }}
              >
                <Grid align="center" gutter="sm">
                  <Grid.Col span="content">
                    <Box w={60} h={40} style={{ overflow: 'hidden', borderRadius: '4px' }}>
                      <Image
                        src={content?.imageUrl || '/images/course-placeholder.jpg'}
                        alt={content.title}
                        width={60}
                        height={40}
                        style={{ height: '100%', width: '100%', objectFit: 'cover' }}
                      />
                    </Box>
                  </Grid.Col>
                  <Grid.Col span="auto">
                    <Title order={6} lineClamp={1} size="sm" fw={600}>
                      {content.title}
                    </Title>
                    {content.instructor && (
                      <Title order={6} size="xs" c="dimmed" fw={400}>
                        {content.instructor.name}
                      </Title>
                    )}
                  </Grid.Col>
                </Grid>
              </Anchor>
            ))}
          </Stack>
        ) : (
          <Box p="md" ta="center">
            <Title order={6} c="dimmed">
              No results found
            </Title>
          </Box>
        )}
      </Paper>
    </Box>
  );
};
