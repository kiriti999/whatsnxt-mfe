import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Skeleton } from '@mantine/core';
import { Autocomplete, Group, Text, Container, Anchor, Box, Paper } from '@mantine/core';
import { useAlgoliaSearch } from '@whatsnxt/core-util';
import { useSearchContext } from '../../context/SearchContext';



const SearchForm = () => {
  const { indexType } = useSearchContext();
  const [search, setSearch] = useState('');
  const { data, isLoading } = useAlgoliaSearch(indexType, search);
  const [show, setShow] = useState(true);

  const inputRef = useRef<HTMLFormElement | null>(null);
  const searchResultsContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: any) => {
      if (
        !inputRef?.current?.contains(e.target) &&
        !searchResultsContainerRef?.current?.contains(e.target)
      )
        setShow(false);
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const router = useRouter();

  const handleSearch = (e: any) => {
    e.preventDefault();
    router.push(`/search/${search}`);
    setShow(false);
  };

  const onChange = (query: string) => {
    setSearch(query);
    setShow(true);
  };

  const autocompleteData = data.map((content: any) => ({
    value: content.title,
    label: content.title,
    image: content?.imageUrl,
    slug: content.slug,
  }));

  const filteredData = autocompleteData.filter((item: { value: string; }) =>
    item.value.toLowerCase().includes(search.toLowerCase())
  );

  const handleItemClick = () => {
    setShow(false);
  };

  return (
    <Container >
      <Box style={{ width: '100%', zIndex: '999' }} component="form" ref={inputRef} onSubmit={handleSearch}>
        <Autocomplete
          variant="filled"
          radius="md"
          data={[]}
          value={search}
          onChange={onChange}
          placeholder="Search"
          autoComplete="off"
          maxDropdownHeight={300}
          filter={() => []}  // This ensures the default dropdown does not show
        />
      </Box>

      {search.length > 2 && show && (
        <Box ref={searchResultsContainerRef} style={{ position: 'relative', zIndex: 999 }}>
          <Paper shadow="sm" p="md" style={{ position: 'absolute', width: '100%', margin: '0 auto', top: '5px', zIndex: 999 }}>
            {isLoading ? (
              <Box>
                {/* Loading skeleton */}
                <Skeleton height={50} width="100%" mb="sm" />
                <Skeleton height={50} width="100%" mb="sm" />
              </Box>
            ) : (
              <Box>
                {filteredData.length === 0 ? (
                  <Text size="sm" c="dimmed">
                    No search result available.
                  </Text>
                ) : (
                  <Box>
                    {filteredData.map((item: any) => (
                      <Anchor
                        component={Link}
                        href={'/content/' + item.slug}
                        key={item.slug}
                        onClick={handleItemClick}
                        style={{
                          display: 'block',
                          padding: '12px 16px',
                          borderRadius: '8px',
                          marginBottom: '8px',
                          textDecoration: 'none',
                          backgroundColor: '#f9f9f9',
                          transition: 'background-color 0.2s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e6f7ff')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f9f9f9')}
                      >
                        <Group justify="apart">
                          <Text size="sm" fw={500} c="dark">
                            {item.value}
                          </Text>
                        </Group>
                      </Anchor>
                    ))}
                  </Box>
                )}
              </Box>
            )}
          </Paper>
        </Box>
      )}
    </Container>
  );
};

export default SearchForm;
