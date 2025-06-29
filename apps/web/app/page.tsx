import React from 'react';
import { fetchCourses } from '../fetcher/courseServerQuery';
import Home from './_component/home/home';
import { fetchTrendingArticles } from '../fetcher/blogServerQuery';
import { Box } from '@mantine/core';

export const dynamic = 'force-dynamic'
async function Page() {
  // Fetch data for CourseMicroFrontEnd
  const data = await fetchCourses(30, 0);
  const articles = await fetchTrendingArticles(1, 15, 'both')
  return (
    <Box my={{ base: '2rem', sm: '3rem', md: '4rem' }}>
      <Home data={data} articles={articles} />
    </Box>
  );
}

export default Page;
