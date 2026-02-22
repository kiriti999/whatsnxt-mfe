import { Box } from "@mantine/core";
import {
  fetchGATrendingContent,
  fetchStructuredTutorials,
  fetchTrendingArticles,
} from "../fetcher/blogServerQuery";
import { fetchCourses } from "../fetcher/courseServerQuery";
import { fetchPublishedLabs } from "../fetcher/labServerQuery";
import Home from "./_component/home/home";

async function Page() {
  // Fetch all data in parallel; GA trending runs alongside others
  const [data, fallbackArticles, tutorialsData, labs, gaResult] = await Promise.all([
    fetchCourses(30, 0),
    fetchTrendingArticles(1, 15, "both"),
    fetchStructuredTutorials(1, 16),
    fetchPublishedLabs(8),
    fetchGATrendingContent(8, "all"),
  ]);

  // Prefer GA-ordered articles (by real page views); fall back to time-based
  const articles = gaResult.articles.length >= 4 ? gaResult.articles : fallbackArticles;

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

