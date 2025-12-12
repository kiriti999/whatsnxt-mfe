import React from 'react';
import { fetchCourses } from '../fetcher/courseServerQuery';
import Home from './_component/home/home';
import { fetchTrendingArticles } from '../fetcher/blogServerQuery';
import { Box } from '@mantine/core';

export const dynamic = 'force-dynamic'
async function Page() {
  // Fetch data for CourseMicroFrontEnd
  const [data, articles] = await Promise.all([
    fetchCourses(30, 0),
    fetchTrendingArticles(1, 15, 'both')
  ]);
  console.log('data', data, 'articles', articles)
  return (
    <Box my={{ base: '2rem', sm: '3rem', md: '4rem' }}>
      <Home data={data} articles={articles} />
    </Box>
  );
}

export default Page;
