import React from 'react';
import { Center, Pagination } from '@mantine/core';

interface SearchResultsPaginationProps {
    totalPages: number;
    currentPage: number;
    onPageChange: (page: number) => void;
}

export function SearchResultsPagination({
    totalPages,
    currentPage,
    onPageChange
}: SearchResultsPaginationProps) {
    return (
        <Center mt="xl">
            <Pagination
                value={currentPage}
                onChange={onPageChange}
                total={totalPages}
                size="md"
                radius="md"
                withEdges
                siblings={1}
                boundaries={1}
                styles={{
                    control: {
                        '&[data-active]': {
                            backgroundImage: 'var(--mantine-gradient)',
                        },
                    },
                }}
            />
        </Center>
    );
}