
import algoliasearch from 'algoliasearch';

export const getAlgoliaIndex = () => {
  const client = algoliasearch(
    process.env.NEXT_PUBLIC_ALGOLIA_APP_ID,
    process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_ADMIN_KEY,
  );
  return client.initIndex(process.env.NEXT_PUBLIC_ALGOLIA_BLOG_INDEX_NAME);
};
