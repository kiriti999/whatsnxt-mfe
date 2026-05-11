import { Footer } from "@whatsnxt/core-ui";
import type { CourseType } from "@whatsnxt/core-util";
import React, { type ReactElement } from "react";
import TopCourses from "./TopCourses/TopCourses";
import TopLabs from "./TopLabs/TopLabs";
import TopTutorials from "./TopTutorials/TopTutorials";
import TopSystemDesign from "./TopSystemDesign/TopSystemDesign";
import TrendingArticles from "./TrendingArticles";

interface MicroFrontendProps {
  courses: CourseType[];
  total: number;
  articles: any[];
  totalArticles: number;
  tutorials: any[];
  totalTutorials: number;
  labs: any[];
  systemDesigns: any[];
}

export default function MicroFrontend({
  courses,
  total,
  articles,
  totalArticles,
  tutorials,
  totalTutorials,
  labs,
  systemDesigns,
}: MicroFrontendProps): ReactElement {
  return (
    <>
      {courses && courses.length > 0 && <TopCourses courses={courses || []} total={total || 0} />}

      <TopTutorials tutorials={tutorials || []} total={totalTutorials || 0} />

      <TopLabs labs={labs || []} />

      <TopSystemDesign systemDesigns={systemDesigns || []} />

      <TrendingArticles articles={articles || []} total={totalArticles || 0} />
      <Footer />
    </>
  );
}
