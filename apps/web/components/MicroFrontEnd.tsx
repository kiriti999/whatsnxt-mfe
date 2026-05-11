import { Footer } from "@whatsnxt/core-ui";
import type { CourseType } from "@whatsnxt/core-util";
import React, { type ReactElement } from "react";
import TopCourses from "./TopCourses/TopCourses";
import TopLabs from "./TopLabs/TopLabs";
import TopTutorials from "./TopTutorials/TopTutorials";
import TopSystemDesign from "./TopSystemDesign/TopSystemDesign";
import TrendingArticles from "./TrendingArticles";
import { LearningStatsStrip, type SystemDesignPublicStats } from "./SystemDesign/LearningStatsStrip";

interface MicroFrontendProps {
  courses: CourseType[];
  total: number;
  articles: any[];
  totalArticles: number;
  tutorials: any[];
  totalTutorials: number;
  labs: any[];
  systemDesigns: any[];
  systemDesignStats?: SystemDesignPublicStats;
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
  systemDesignStats,
}: MicroFrontendProps): ReactElement {
  return (
    <>
      {courses && courses.length > 0 && <TopCourses courses={courses || []} total={total || 0} />}

      <TopTutorials tutorials={tutorials || []} total={totalTutorials || 0} />

      <TopLabs labs={labs || []} />

      {systemDesignStats && <LearningStatsStrip stats={systemDesignStats} />}

      <TopSystemDesign systemDesigns={systemDesigns || []} />

      <TrendingArticles articles={articles || []} total={totalArticles || 0} />
      <Footer />
    </>
  );
}
