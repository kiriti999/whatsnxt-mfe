'use client';

import React, { useEffect, useState } from 'react';
import { Container, Title, Grid, Card, Text, Badge, Button, Group, Loader, Center, Stack } from '@mantine/core';
import { IconPlus, IconCode, IconCloud, IconBrandNextjs, IconServer, IconBox } from '@tabler/icons-react';
import Link from 'next/link';
import { Lab } from '../../types/lab';

export const LabList = () => {
  const [labs, setLabs] = useState<Lab[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLabs = async () => {
      try {
        const response = await fetch('/api/lab/list');
        const result = await response.json();
        if (result.success) {
          setLabs(result.data);
        }
      } catch (error) {
        console.error('Error fetching labs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLabs();
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'programming': return <IconCode size={24} />;
      case 'cloud': return <IconCloud size={24} />;
      case 'framework': return <IconBrandNextjs size={24} />;
      case 'kubernetes': return <IconServer size={24} />;
      case 'architecture': return <IconBox size={24} />;
      default: return <IconCode size={24} />;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'programming': return 'blue';
      case 'cloud': return 'orange';
      case 'framework': return 'violet';
      case 'kubernetes': return 'cyan';
      case 'architecture': return 'grape';
      default: return 'gray';
    }
  };

  return (
    <Container size="xl" py="xl">
      <Group justify="space-between" mb="xl">
        <Title order={2}>My Labs</Title>
        <Button
          component={Link}
          href="/lab/create"
          variant="filled"
          c="white"
          leftSection={<IconPlus size={16} />}
        >
          Create New Lab
        </Button>
      </Group>

      {loading ? (
        <Center h={200}>
          <Loader />
        </Center>
      ) : labs.length === 0 ? (
        <Center h={200}>
          <Stack align="center">
            <Text size="lg" c="dimmed">No labs found</Text>
            <Button component={Link} href="/lab/create" variant="light">
              Create your first lab
            </Button>
          </Stack>
        </Center>
      ) : (
        <Grid>
          {labs.map((lab) => (
            <Grid.Col key={lab.id} span={{ base: 12, sm: 6, md: 4 }}>
              <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
                <Card.Section withBorder inheritPadding py="xs">
                  <Group justify="space-between">
                    <Badge color={getColor(lab.type)} variant="light">
                      {lab.type}
                    </Badge>
                    {getIcon(lab.type)}
                  </Group>
                </Card.Section>

                <Group mt="md" mb="xs" justify="space-between">
                  <Text fw={500}>{lab.title}</Text>
                </Group>

                <Text size="sm" c="dimmed" lineClamp={3} mb="md" h={60}>
                  {lab.description}
                </Text>

                <Button variant="light" color="blue" fullWidth mt="md" radius="md">
                  Start Lab
                </Button>
              </Card>
            </Grid.Col>
          ))}
        </Grid>
      )}
    </Container>
  );
};
