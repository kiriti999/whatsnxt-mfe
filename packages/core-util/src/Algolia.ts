"use client"
import algoliasearch, { SearchIndex, SearchResponse } from 'algoliasearch';
import useSWR from 'swr';

// Types for better type safety
export type IndexType = 'blog' | 'course' | 'tutorial';
export type AlgoliaRecord = Record<string, any> & {
    _id?: string;
    id?: string;
    objectID?: string;
};

export interface CategoryResult {
    name: string;
    count: number;
}

export interface SearchOptions {
    searchableAttributes?: string[];
    additionalSearchOptions?: Record<string, any>;
}

export interface UseAlgoliaSearchResult<T> {
    data: T[];
    totalHits: number;
    totalPages: number;
    error?: any;
    isLoading: boolean;
    isValidating: boolean;
    mutate: any;
}

// Index name mapping with proper typing
const INDEX_NAMES: Record<IndexType, string> = {
    blog: process.env.NEXT_PUBLIC_ALGOLIA_BLOG_INDEX_NAME || '',
    tutorial: process.env.NEXT_PUBLIC_ALGOLIA_TUTORIAL_INDEX_NAME || '',
    course: process.env.NEXT_PUBLIC_ALGOLIA_COURSE_INDEX_NAME || '',
} as const;

// Validate environment variables
const validateEnvVars = () => {
    const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
    const adminKey = process.env.ALGOLIA_SEARCH_ADMIN_KEY;

    if (!appId || !adminKey) {
        throw new Error('Missing required Algolia environment variables');
    }

    return { appId, adminKey };
};

// Create a single client instance with error handling
let client: ReturnType<typeof algoliasearch> | null = null;

const getClient = () => {
    if (!client) {
        const { appId, adminKey } = validateEnvVars();
        client = algoliasearch(appId, adminKey);
    }
    return client;
};

/**
 * Get Algolia index by type or custom index name
 */
export const getAlgoliaIndex = (indexType: IndexType | string): SearchIndex => {
    const indexName = (indexType in INDEX_NAMES)
        ? INDEX_NAMES[indexType as IndexType]
        : indexType;

    if (!indexName) {
        throw new Error(`Invalid or missing index name for: ${indexType}`);
    }

    return getClient().initIndex(indexName);
};

/**
 * Search by keyword with dynamic index support
 */
async function algoliaSearchByKeyword<T = unknown>(
    indexName: IndexType | string,
    keyword: string,
    page = 0,
    hitsPerPage = 10,
    options: SearchOptions = {}
): Promise<SearchResponse<T>> {
    try {
        const searchIndex = getAlgoliaIndex(indexName);

        // Set searchable attributes if provided
        if (options.searchableAttributes && options.searchableAttributes.length > 0) {
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
    } catch (error) {
        console.error('algoliaSearchByKeyword error:', error);
        throw error;
    }
}

/**
 * Hook for Algolia search with dynamic index support
 */
function useAlgoliaSearch<T = unknown>(
    indexName: IndexType | string,
    search: string,
    page = 0,
    hitsPerPage = 4,
    options?: SearchOptions
): UseAlgoliaSearchResult<T> {
    const { data, error, isLoading, isValidating, mutate } = useSWR(
        [indexName, search, page, hitsPerPage, options],
        async ([index, searchTerm, p, hpp, opts]: [
            IndexType | string,
            string,
            number,
            number,
            SearchOptions?
        ]) => {
            if (!searchTerm.trim()) {
                return { hits: [], nbHits: 0, nbPages: 0 };
            }
            return algoliaSearchByKeyword<T>(index, searchTerm, p, hpp, opts || {});
        },
        {
            revalidateOnFocus: false,
            dedupingInterval: 2000,
        }
    );

    return {
        data: data?.hits ?? [],
        totalHits: data?.nbHits ?? 0,
        totalPages: data?.nbPages ?? 0,
        error,
        isLoading,
        isValidating,
        mutate,
    };
}

/**
 * Get category list from specified index
 */
async function algoliaGetCategoryList(indexName: IndexType | string): Promise<CategoryResult[]> {
    try {
        const searchIndex = getAlgoliaIndex(indexName);

        const { hits } = await searchIndex.search<{ category?: string }>('', {
            attributesToRetrieve: ['category'],
            hitsPerPage: 1000, // Get more results for comprehensive category list
        });

        const result: any[] = [];
        const indexMapping: Record<string, number> = {};
        let indicator = 0;

        // Remove duplicate values and count occurrences
        hits.forEach((hit) => {
            const category = hit.category;
            if (!category || typeof category !== 'string') return;

            const value = category.toLowerCase();

            if (indexMapping[value] !== undefined) {
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
    } catch (error) {
        console.error('algoliaGetCategoryList error:', error);
        throw error;
    }
}

/**
 * Get recent entries from specified index
 */
async function algoliaGetRecentEntries<T = unknown>(
    indexName: IndexType | string,
    limit = 5,
    sortBy = 'date'
): Promise<SearchResponse<T>> {
    try {
        const searchIndex = getAlgoliaIndex(indexName);

        await searchIndex.setSettings({
            ranking: [`desc(${sortBy})`],
        });

        const response = await searchIndex.search<T>('', {
            hitsPerPage: limit,
        });

        return response;
    } catch (error) {
        console.error('algoliaGetRecentEntries error:', error);
        throw error;
    }
}

/**
 * Index a record to specified index
 */
export async function indexRecord(
    record: Readonly<AlgoliaRecord>,
    indexName: IndexType | string
): Promise<any> {
    try {
        if (!record) {
            throw new Error('Record is required');
        }

        const data: AlgoliaRecord = {
            objectID: record._id || record.id || record.objectID,
            ...record,
        };

        if (!data.objectID) {
            throw new Error('Record must have an _id, id, or objectID field');
        }

        const index = getAlgoliaIndex(indexName);
        const algoliaResponse = await index.saveObject(data);
        return algoliaResponse;
    } catch (error) {
        console.error('indexRecord error:', error);
        throw error;
    }
}

/**
 * Delete object from specified index
 */
async function deleteIndex(id: string, indexName: IndexType | string): Promise<any> {
    try {
        if (!id || typeof id !== 'string') {
            throw new Error('Valid ID is required');
        }

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
): Promise<any> {
    try {
        if (!Array.isArray(records) || records.length === 0) {
            throw new Error('Records array is required and cannot be empty');
        }

        // Validate all records have proper IDs
        const validatedRecords = records.map((record, idx) => {
            const objectID = record._id || record.id || record.objectID;
            if (!objectID) {
                throw new Error(`Record at index ${idx} must have an _id, id, or objectID field`);
            }
            return {
                objectID,
                ...record,
            };
        });

        const index = getAlgoliaIndex(indexName);
        const algoliaResponse = await index.saveObjects(validatedRecords);
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
): Promise<any> {
    try {
        if (!Array.isArray(ids) || ids.length === 0) {
            throw new Error('IDs array is required and cannot be empty');
        }

        // Validate all IDs are strings
        const validIds = ids.filter(id => id && typeof id === 'string');
        if (validIds.length !== ids.length) {
            console.warn('Some invalid IDs were filtered out');
        }

        if (validIds.length === 0) {
            throw new Error('No valid IDs provided');
        }

        const index = getAlgoliaIndex(indexName);
        const algoliaResponse = await index.deleteObjects(validIds);
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