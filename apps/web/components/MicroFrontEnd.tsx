import React, { ReactElement } from "react";
import TopCourses from './TopCourses/TopCourses';
import type { CourseType } from '@whatsnxt/core-util';
import TrendingArticles from './TrendingArticles';

interface MicroFrontendProps {
  courses: CourseType[];
  total: number;
  articles: any[]; // Add articles prop
  totalArticles: number; // Add totalArticles prop
}

export default function MicroFrontend({
  courses,
  total,
  articles,
  totalArticles
}: MicroFrontendProps): ReactElement {
  return (
    <>
      <TopCourses courses={courses || []} total={total || 0} />
      <TrendingArticles
        articles={articles || []}
        total={totalArticles || 0}
      />
    </>
  );
}