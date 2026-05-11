"use client";

import { MainBanner } from "@whatsnxt/core-ui";
import dynamic from "next/dynamic";
import Link from "next/link";
import React from "react";
import PartyTownScripts from "../../../components/PartyTownScripts";
import { POPULAR_DESIGN_THEME_CHIPS } from "../../../lib/faangSystemDesignTopics";

const DynamicComponent = dynamic(() =>
  import("../../../components/MicroFrontEnd").then((mfe) => mfe),
);

interface HomeProps {
  data: {
    courses: any[];
    total: number;
  };
  articles: [];
  tutorialsData: {
    tutorials: any[];
    total: number;
  };
  labs: any[];
  systemDesigns: any[];
  systemDesignStats?: {
    publishedCourses: number;
    publishedInterviewExperiences: number;
    completedPracticeSessions: number;
  };
}

const popularDesignThemes = POPULAR_DESIGN_THEME_CHIPS.map((t) => ({
  label: t.label,
  href: `/system-design/browse?topic=${encodeURIComponent(t.topicId)}`,
}));

function Home({ data, articles, tutorialsData, labs, systemDesigns, systemDesignStats }: HomeProps) {
  return (
    <div>
      <MainBanner stats={systemDesignStats} LinkComponent={Link} popularThemes={popularDesignThemes} />
      <DynamicComponent
        courses={data?.courses || []}
        total={data?.total || 0}
        articles={articles || []} // Access the articles array properly
        totalArticles={articles?.length || 0} // Match the prop name
        tutorials={tutorialsData?.tutorials || []}
        totalTutorials={tutorialsData?.total || 0}
        labs={labs || []}
        systemDesigns={systemDesigns || []}
      />
    </div>
  );
}

export default Home;
