import React, { ReactElement } from "react";
import TopCourses from './TopCourses/TopCourses';
import type { CourseType } from '@whatsnxt/core-util';

export default function CoursesMicroFrontend({ courses, total }: { courses: CourseType[], total: number; }): ReactElement {
  return <TopCourses courses={courses || []} total={total || 0} />;
}
