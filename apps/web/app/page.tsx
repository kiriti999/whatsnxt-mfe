import { Box } from "@mantine/core";
import React from "react";
import {
  fetchStructuredTutorials,
  fetchTrendingArticles,
} from "../fetcher/blogServerQuery";
import { fetchCourses } from "../fetcher/courseServerQuery";
import { fetchPublishedLabs } from "../fetcher/labServerQuery";
import Home from "./_component/home/home";

async function Page() {
  // Fetch data for CourseMicroFrontEnd
  const [data, articles, tutorialsData, labs] = await Promise.all([
    fetchCourses(30, 0),
    fetchTrendingArticles(1, 15, "both"),
    fetchStructuredTutorials(1, 16),
    fetchPublishedLabs(8),
  ]);
  return (
    <Box>
      <Home
        data={data}
        articles={articles}
        tutorialsData={tutorialsData}
        labs={labs}
      />
    </Box>
  );
}

export default Page;
