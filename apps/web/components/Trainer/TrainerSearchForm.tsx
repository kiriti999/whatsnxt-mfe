import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TextInput, Button, Box, Title, Card, Text, Center, Stack, ThemeIcon } from '@mantine/core';
import { IconSearch, IconUserSearch } from '@tabler/icons-react';

function TrainerSearchForm() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [focused, setFocused] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!search) return;
    router.push(`/search-trainers?query=${search}`);
  };

  return (
    <Center my={'6rem'} mb={'10rem'}>
      <Card
        shadow="md"
        padding="xl"
        radius="lg"
        withBorder
        w={{ base: '100%', sm: 600, md: 700 }}
        style={{ overflow: 'visible' }}
      >
        {/* Decorative header/icon */}
        <Box
          pos="absolute"
          top={-30}
          left="50%"
          style={{
            transform: 'translateX(-50%)',
            background: 'var(--mantine-color-body)',
            borderRadius: '50%',
            padding: 10,
            boxShadow: 'var(--mantine-shadow-sm)',
            border: '1px solid var(--mantine-color-gray-2)'
          }}
        >
          <ThemeIcon
            size={50}
            radius="50%"
            variant="gradient"
            gradient={{ from: 'indigo.5', to: 'cyan.5', deg: 45 }}
          >
            <IconUserSearch size={28} />
          </ThemeIcon>
        </Box>

        <Stack gap="lg" mt="md">
          <div style={{ textAlign: 'center' }}>
            <Title
              order={4}
              fw={900}
              style={{
                background: 'linear-gradient(45deg, var(--mantine-color-indigo-6), var(--mantine-color-cyan-6))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Find Your Perfect Trainer
            </Title>
            <Text c="dimmed" size={'1.08rem'} mt="xs" maw={500} mx="auto">
              Search by name, skills, or expertise to find the right mentor for your journey.
            </Text>
          </div>

          <form onSubmit={handleSearch}>
            <Stack gap="md">
              <TextInput
                size="md"
                radius="xl"
                placeholder="e.g. 'React Expert', 'John Doe', 'Machine Learning'"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leftSection={<IconSearch size={20} color="var(--mantine-color-dimmed)" />}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                style={{
                  transition: 'transform 0.2s ease',
                  transform: focused ? 'scale(1.02)' : 'scale(1)',
                }}
              />

              <Button
                type="submit"
                size="md"
                radius="xl"
                variant="gradient"
                gradient={{ from: 'indigo', to: 'cyan', deg: 45 }}
                fullWidth
                rightSection={<IconSearch size={18} />}
                style={{
                  transition: 'all 0.2s ease',
                }}
              >
                Search Trainers
              </Button>
            </Stack>
          </form>
        </Stack>
      </Card>
    </Center>
  );
}

export default TrainerSearchForm;
