import algoliasearch from "algoliasearch";

// Use the correct function name 'algoliasearch'
const algoliaClient = algoliasearch(
  process.env.ALGOLIA_APP_ID,
  process.env.ALGOLIA_SEARCH_ADMIN_KEY,
);

export { algoliaClient };
