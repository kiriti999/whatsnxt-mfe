"use client"

import { useSearchParams } from 'next/navigation';
import React from 'react';
import SearchTrainerPage from '../../components/Trainer/TrainerSearchPage';
import TrainerSearchPageComponent from '../../components/Trainer/TrainerSearchPageComponent';
import { Box } from '@mantine/core';

function SearchTrainer() {
    const searchParam = useSearchParams();
    const query = searchParam.get("query");
    const pageQuery = searchParam.get("page");

    // Convert page to number if it's a string, otherwise default to 1
    const page = Array.isArray(pageQuery) ? parseInt(pageQuery[0], 10) : (pageQuery ? parseInt(pageQuery, 10) : 1);

    return (
        <Box my={'xl'}>
            <TrainerSearchPageComponent />
            {query && typeof query === 'string' && <SearchTrainerPage query={query} page={isNaN(page) ? 1 : page} />}
        </Box>
    );
}

export default SearchTrainer;