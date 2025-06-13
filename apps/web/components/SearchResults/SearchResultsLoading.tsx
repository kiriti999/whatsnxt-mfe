import React from 'react';
import { Container, Center, Loader } from '@mantine/core';

export function SearchResultsLoading() {
    return (
        <Container size="xl" py="xl">
            <Center h={400}>
                <Loader size="lg" />
            </Center>
        </Container>
    );
}