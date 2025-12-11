import React from 'react';
import { fetchLabById } from '../../../fetcher/labServerQuery';
import { LabRunner } from '../../../components/Lab/LabRunner';
import { Container, Title, Text, Button, Center, Stack } from '@mantine/core';
import Link from 'next/link';
import ArchitectureLabClient from '../../../components/architecture-lab/ArchitectureLabClient';

export const dynamic = 'force-dynamic';

export default async function LabPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lab = await fetchLabById(id);

  if (!lab) {
    return (
      <Container size="sm" py="xl">
        <Center h={400}>
          <Stack align="center">
            <Title order={2}>Lab Not Found</Title>
            <Text c="dimmed">The lab you are looking for does not exist or an error occurred.</Text>
            <Button component={Link} href="/labs">Back to Labs</Button>
          </Stack>
        </Center>
      </Container>
    );
  }

  // Transform data to match frontend interfaces
  const transformedLab = {
    ...lab,
    questions: lab.questions?.map((q: any) => ({
      ...q,
      id: q.id || q._id,
      text: q.text || q.question
    })) || []
  };

  if (lab.type === 'architecture') {
    return (
      <ArchitectureLabClient
        labId={id}
        labCreatorId={lab.createdBy}
        initialData={{
          masterGraph: lab.masterGraph,
          title: lab.title,
          questions: transformedLab.questions,
          status: lab.status,
          _id: id
        }}
        initialMode="student"
      />
    );
  }

  return <LabRunner lab={transformedLab} />;
}
