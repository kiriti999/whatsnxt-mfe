import { Box } from "@mantine/core";
import { PAGINATION } from "@whatsnxt/constants";
import {
	fetchGATrendingContent,
	fetchStructuredTutorials,
	fetchTrendingArticles,
} from "../fetcher/blogServerQuery";
import { fetchCourses } from "../fetcher/courseServerQuery";
import { fetchPublishedLabs } from "../fetcher/labServerQuery";
import {
	fetchPublishedSystemDesigns,
	fetchSystemDesignPublicStats,
} from "../fetcher/systemDesignServerQuery";
import Home from "./_component/home/home";

/** Fresh lab list — avoid caching a stale slice from build / CDN */
export const dynamic = "force-dynamic";

async function Page() {
	// Fetch all data in parallel; GA trending runs alongside others
	const [
		data,
		fallbackArticles,
		tutorialsData,
		labs,
		gaResult,
		systemDesigns,
		systemDesignStats,
	] = await Promise.all([
		fetchCourses(30, 0),
		fetchTrendingArticles(1, 15, "both"),
		fetchStructuredTutorials(1, 16),
		fetchPublishedLabs(PAGINATION.HOMEPAGE_LABS_PREVIEW),
		fetchGATrendingContent(8, "all"),
		fetchPublishedSystemDesigns(8),
		fetchSystemDesignPublicStats(),
	]);

	// Prefer GA-ordered articles (by real page views); fall back to time-based
	const articles =
		gaResult.articles.length >= 4 ? gaResult.articles : fallbackArticles;

	return (
		<Box>
			<Home
				data={data}
				articles={articles}
				tutorialsData={tutorialsData}
				labs={labs}
				systemDesigns={systemDesigns}
				systemDesignStats={systemDesignStats}
			/>
		</Box>
	);
}

export default Page;
