'use client';

import { useSearchParams } from 'next/navigation';
import React from 'react';
import dynamic from 'next/dynamic';
import TrainerSearchPageComponent from '../../components/Trainer/TrainerSearchPageComponent';
import { Box } from '@mantine/core';
import { MantineLoader } from '@whatsnxt/core-ui';

// 👇 Lazy-load only the heavy SearchTrainerPage
const SearchTrainerPage = dynamic(
    () => import('../../components/Trainer/TrainerSearchPage'),
    {
        loading: () => <MantineLoader />,
        ssr: false,
    }
);

function SearchTrainer() {
    const searchParam = useSearchParams();
    const query = searchParam.get('query');
    const pageQuery = searchParam.get('page');

    const page = Array.isArray(pageQuery)
        ? parseInt(pageQuery[0], 10)
        : pageQuery
            ? parseInt(pageQuery, 10)
            : 1;

    return (
        <Box my="xl">
            <TrainerSearchPageComponent />
            {query && typeof query === 'string' && (
                <SearchTrainerPage query={query} page={isNaN(page) ? 1 : page} />
            )}
        </Box>
    );
}

export default SearchTrainer;
