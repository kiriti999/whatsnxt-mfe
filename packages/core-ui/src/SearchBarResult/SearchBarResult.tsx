import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Anchor, Skeleton, Title, Box, Grid, Stack } from '@mantine/core';
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

  return (
    <Box className={styles['search-results']} ref={containerRef}>
      {data && search.length > 1 && show && (
        <>
          {isLoading ? (
            <Stack gap="xs" p="sm">
              {[...Array(3).keys()].map(i => (
                <Skeleton key={i} height={50} />
              ))}
            </Stack>
          ) : (
            <Box bg="gray.0">
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
                    style={{
                      textDecoration: 'none',
                      borderBottom: i !== data.length - 1 ? '1px solid var(--mantine-color-gray-2)' : 'none'
                    }}
                  >
                    <Grid align="center" gutter="sm">
                      <Grid.Col span="content">
                        <Box w={50} h={32.5}>
                          <Image
                            src={content?.imageUrl}
                            alt="Course thumbnail"
                            width={50}
                            height={32.5}
                            style={{ height: 'auto', width: '100%', objectFit: 'cover' }}
                          />
                        </Box>
                      </Grid.Col>
                      <Grid.Col span="auto">
                        <Title order={6} lineClamp={2} size="sm">
                          {content.title}
                        </Title>
                      </Grid.Col>
                    </Grid>
                  </Anchor>
                ))}
              </Stack>
            </Box>
          )}
          {!isLoading && data.length === 0 && (
            <Box p="sm" ta="center">
              <Title order={6} c="dimmed">
                No search results available
              </Title>
            </Box>
          )}
        </>
      )}
    </Box>
  );
};
