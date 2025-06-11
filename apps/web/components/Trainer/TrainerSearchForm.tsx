import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TextInput, Button, Box, Title } from '@mantine/core';

function TrainerSearchForm() {
  const router = useRouter();
  const [search, setSearch] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (!search) return;
    router.push(`/search-trainers?query=${search}`);
  };

  return (
    <Box>
      <Title order={4}>Search Trainer</Title>
      <p>Find a trainer by name or their skills.</p>
      <form onSubmit={handleSearch}>
        <TextInput
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or skills..."
          size="md"
          radius={'md'}
        />
        <Button mt={'xs'} type="submit" variant='filled' color="red">Search Trainer</Button>
      </form>
    </Box>
  );
}

export default TrainerSearchForm;
