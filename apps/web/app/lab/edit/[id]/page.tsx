import React from 'react';
import { fetchLabById } from '../../../../fetcher/labServerQuery';
import { LabForm } from '../../../../components/Lab/LabForm';
import { Container, Title, Text, Button, Center, Stack } from '@mantine/core';
import Link from 'next/link';


export default async function EditLabPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const lab = await fetchLabById(id);

    if (!lab) {
        return (
            <Container size="sm" py="xl">
                <Center h={400}>
                    <Stack align="center">
                        <Title order={2}>Lab Not Found</Title>
                        <Text c="dimmed">The lab you are trying to edit does not exist.</Text>
                        <Button component={Link} href="/labs">Back to Labs</Button>
                    </Stack>
                </Center>
            </Container>
        );
    }

    return <LabForm initialData={lab} />;
}
