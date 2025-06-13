"use client"

import React from 'react';
import { Center, Container, Stack, Title, Text } from '@mantine/core';
import { useSearchResults } from './hooks/useSearchResults';
import { SearchResultsError } from './SearchResultsError';
import { SearchResultsGrid } from './SearchResultsGrid';
import { SearchResultsHeader } from './SearchResultsHeader';
import { SearchResultsLoading } from './SearchResultsLoading';
import { SearchResultsPagination } from './SearchResultsPagination';
import { sortCourses } from './sortCourses';
import { SearchResultsProps } from './types';


export default function SearchResults({ coursesPopularity }: SearchResultsProps) {
    const {
        data,
        isLoading,
        error,
        searchQuery,
        sortQuery,
        currentPage,
        handleSortChange,
        handlePagination
    } = useSearchResults(coursesPopularity);

    if (isLoading) return <SearchResultsLoading />;
    if (error) return <SearchResultsError />;
    if (!data) return null;

    const sortedCourses = sortCourses(data.courses, sortQuery);
    const validCourses = sortedCourses.filter(course =>
        course.price !== undefined && course.price !== null
    );

    return (
        <Container size="xl" py="xl">
            <SearchResultsHeader
                searchQuery={searchQuery}
                coursesCount={validCourses.length}
                currentSort={sortQuery}
                onSortChange={handleSortChange}
            />

            {validCourses.length > 0 ? (
                <>
                    <SearchResultsGrid courses={validCourses} />
                    {data.totalPages > 1 && (
                        <SearchResultsPagination
                            totalPages={data.totalPages}
                            currentPage={currentPage}
                            onPageChange={handlePagination}
                        />
                    )}
                </>
            ) : (
                <Center h={200}>
                    <Stack align="center">
                        <Title order={3} c="dimmed">No courses found</Title>
                        <Text c="dimmed">Try adjusting your search criteria</Text>
                    </Stack>
                </Center>
            )}
        </Container>
    );
}