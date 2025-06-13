import React from 'react';
import { Paper, Group, Box, Text, Select } from '@mantine/core';
import { SORT_OPTIONS } from './types';

interface SearchResultsHeaderProps {
    searchQuery: string;
    coursesCount: number;
    currentSort: string;
    onSortChange: (value: string | null) => void;
}

export function SearchResultsHeader({
    searchQuery,
    coursesCount,
    currentSort,
    onSortChange
}: SearchResultsHeaderProps) {
    return (
        <Paper shadow="xs" p="md" radius="md" mb="lg">
            <Group justify="space-between" align="top" wrap="nowrap">
                <Box>
                    {searchQuery && (
                        <Text size="md">
                            Search results for: <strong>"{searchQuery}"</strong>
                        </Text>
                    )}
                    <Text c="dimmed" size="sm">
                        Found <strong>{coursesCount}</strong> courses
                    </Text>
                </Box>

                <Select
                    value={currentSort}
                    onChange={onSortChange}
                    data={SORT_OPTIONS}
                    placeholder="Sort by"
                    w={200}
                />
            </Group>
        </Paper>
    );
}