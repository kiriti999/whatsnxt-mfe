import React from 'react';
import { fetchCourses } from '../fetcher/courseServerQuery';
import Home from './_component/home/home';
import { fetchTrendingArticles, fetchStructuredTutorials } from '../fetcher/blogServerQuery';
import { Box } from '@mantine/core';

async function Page() {
  // Fetch data for CourseMicroFrontEnd
  const [data, articles, tutorialsData] = await Promise.all([
    fetchCourses(30, 0),
    fetchTrendingArticles(1, 15, 'both'),
    fetchStructuredTutorials(1, 16)
  ]);
  return (
    <Box
      style={{
        backgroundImage: 'radial-gradient(circle, rgba(99, 102, 241, 0.13) 2px, transparent 2px)',
        backgroundSize: '25px 25px',
        minHeight: '100vh'
      }}
      py={{ base: '2rem', sm: '3rem', md: '4rem' }}
    >
      <Home data={data} articles={articles} tutorialsData={tutorialsData} />
    </Box>
  );
}

export default Page;
