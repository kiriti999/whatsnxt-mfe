"use client"
import algoliasearch from 'algoliasearch';
import useSWR from 'swr';

// Types for better type safety
export type IndexType = 'blog' | 'course' | 'tutorial';
export type AlgoliaRecord = Record<string, any>;

// Index name mapping
const INDEX_NAMES = {
    blog: process.env.NEXT_PUBLIC_ALGOLIA_BLOG_INDEX_NAME as string,
    tutorial: process.env.NEXT_PUBLIC_ALGOLIA_TUTORIAL_INDEX_NAME as string,
    course: process.env.NEXT_PUBLIC_ALGOLIA_COURSE_INDEX_NAME as string,
} as const;

// Create a single client instance
const client = algoliasearch(
    process.env.NEXT_PUBLIC_ALGOLIA_APP_ID as string,
    process.env.ALGOLIA_SEARCH_ADMIN_KEY as string,
);

/**
 * Get Algolia index by type or custom index name
 */
export const getAlgoliaIndex = (indexType: IndexType | string) => {
    const indexName = typeof indexType === 'string' && indexType in INDEX_NAMES
        ? INDEX_NAMES[indexType as IndexType]
        : indexType;

    return client.initIndex(indexName);
};

/**
 * Search by keyword with dynamic index support
 */
async function algoliaSearchByKeyword<T = unknown>(
    indexName: IndexType | string,
    keyword: string,
    page = 0,
    hitsPerPage = 10,
    options: {
        searchableAttributes?: string[];
        additionalSearchOptions?: any;
    } = {}
) {
    const searchIndex = getAlgoliaIndex(indexName);

    // Set searchable attributes if provided
    if (options.searchableAttributes) {
        await searchIndex.setSettings({
            searchableAttributes: options.searchableAttributes
        });
    }

    const response = await searchIndex.search<T>(keyword, {
        page,
        hitsPerPage,
        ...options.additionalSearchOptions,
    });

    return response;
}

/**
 * Hook for Algolia search with dynamic index support
 */
function useAlgoliaSearch<T = unknown>(
    indexName: IndexType | string,
    search: string,
    page = 0,
    hitsPerPage = 4,
    options?: {
        searchableAttributes?: string[];
        additionalSearchOptions?: any;
    }
) {
    const { data, ...rest } = useSWR(
        [indexName, search, page, hitsPerPage, options],
        ([index, searchTerm, p, hitsPerPage, opts]) =>
            algoliaSearchByKeyword<T>(index, searchTerm, p, hitsPerPage, opts)
    );

    return {
        data: data?.hits ?? [],
        totalHits: data?.nbHits ?? 0,
        totalPages: data?.nbPages ?? 0,
        ...rest,
    };
}

/**
 * Get category list from specified index
 */
async function algoliaGetCategoryList(indexName: IndexType | string) {
    const searchIndex = getAlgoliaIndex(indexName);

    const { hits } = await searchIndex.search('', {
        attributesToRetrieve: ['category'],
    });

    const result: { name: string; count: number }[] = [];
    const indexMapping: Record<string, number> = {};
    let indicator = 0;

    // Remove duplicate values and count occurrences
    hits.forEach(({ category }: any) => {
        if (!category) return;

        const value = category.toLowerCase();

        if (Number.isInteger(indexMapping[value])) {
            result[indexMapping[value]].count += 1;
        } else {
            indexMapping[value] = indicator;
            result.push({
                name: category,
                count: 1,
            });
            indicator += 1;
        }
    });

    return result.sort((a, b) => b.count - a.count);
}

/**
 * Get recent entries from specified index
 */
async function algoliaGetRecentEntries(
    indexName: IndexType | string,
    limit = 5,
    sortBy = 'date'
) {
    const searchIndex = getAlgoliaIndex(indexName);

    await searchIndex.setSettings({
        ranking: [`desc(${sortBy})`],
    });

    const response = await searchIndex.search('', {
        hitsPerPage: limit,
    });

    return response;
}

/**
 * Index a record to specified index
 */
export async function indexRecord(record: Readonly<AlgoliaRecord>, indexName: IndexType | string) {
    try {
        const data = {
            objectID: record._id || record.id,
            ...record,
        };

        const index = getAlgoliaIndex(indexName);
        const algoliaResponse = await index.saveObject(data);
        return algoliaResponse;
    } catch (error) {
        console.log('algolia.js:: error: ', error);
        throw error;
    }
}

/**
 * Delete object from specified index
 */
async function deleteIndex(id: string, indexName: IndexType | string) {
    try {
        const index = getAlgoliaIndex(indexName);
        console.log('algolia.js:: deleteIndex:: id:', id);

        const algoliaResponse = await index.deleteObject(id);
        console.log('algolia.js:: deleteIndex:: success:', algoliaResponse);
        return algoliaResponse;
    } catch (error) {
        console.error('algolia.js:: deleteIndex:: error:', error);
        throw error;
    }
}

/**
 * Batch operations for better performance
 */
async function batchIndexPosts(
    records: AlgoliaRecord[],
    indexName: IndexType | string
) {
    try {
        const index = getAlgoliaIndex(indexName);
        const algoliaResponse = await index.saveObjects(records);
        console.log('algolia.js:: batchIndexPosts:: success:', algoliaResponse);
        return algoliaResponse;
    } catch (error) {
        console.error('algolia.js:: batchIndexPosts:: error:', error);
        throw error;
    }
}

async function batchDeletePosts(
    ids: string[],
    indexName: IndexType | string
) {
    try {
        const index = getAlgoliaIndex(indexName);
        const algoliaResponse = await index.deleteObjects(ids);
        console.log('algolia.js:: batchDeletePosts:: success:', algoliaResponse);
        return algoliaResponse;
    } catch (error) {
        console.error('algolia.js:: batchDeletePosts:: error:', error);
        throw error;
    }
}

export {
    algoliaSearchByKeyword,
    algoliaGetCategoryList,
    algoliaGetRecentEntries,
    deleteIndex,
    useAlgoliaSearch,
    batchIndexPosts,
    batchDeletePosts,
};