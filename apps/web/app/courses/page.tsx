import React from 'react';
import CoursePage from '../_component/courses/courses-page';
import { fetchCourses, fetchPopularCourses, fetchCategoriesByCount } from '../../fetcher/courseServerQuery';
import { Box } from '@mantine/core';

export const dynamic = 'force-dynamic'
async function Page() {
  // Declare variables outside the try block
  let courses = [];
  let enrolled = [];
  let categories = [];

  try {
    const [coursesResult, enrolledResult, categoriesResult] = await Promise.all([
      fetchCourses(30, 0).catch((error) => {
        console.error('Error fetching courses:', error);
        return { courses: [] }; // Return fallback value
      }),
      fetchPopularCourses().catch((error) => {
        console.error('Error fetching popular courses:', error);
        return []; // Return fallback value
      }),
      fetchCategoriesByCount().catch((error) => {
        console.error('Error fetching categories:', error);
        return []; // Return fallback value
      }),
    ]);

    // Assign the results
    courses = coursesResult.courses || [];
    enrolled = enrolledResult || [];
    categories = categoriesResult || [];
  } catch (error) {
    console.error('A critical error occurred:', error);
  }

  // Render the page component with the data
  return (
    <Box my={{ base: '2rem', sm: '3rem', md: '4rem' }}>
      <CoursePage courses={courses} enrolled={enrolled} categories={categories} />
    </Box>
  );
}

export default Page;
