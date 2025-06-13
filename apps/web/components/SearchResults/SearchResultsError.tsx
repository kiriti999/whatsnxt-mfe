import React from 'react';
import { Container, Center, Stack, Title, Text } from '@mantine/core';

export function SearchResultsError() {
    return (
        <Container size="xl" py="xl">
            <Center h={400}>
                <Stack align="center">
                    <Title order={3} c="dimmed">Error loading results</Title>
                    <Text c="dimmed">Please try again later</Text>
                </Stack>
            </Center>
        </Container>
    );
}