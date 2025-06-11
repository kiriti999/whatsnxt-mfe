import React from 'react';
import { fetchCourses } from '../fetcher/courseServerQuery';
import Home from './_component/home/home';

async function Page() {
  // Fetch data for CourseMicroFrontEnd
  const data = await fetchCourses(30, 0);
  return (
    <Home data={data} />
  );
}

export default Page;
