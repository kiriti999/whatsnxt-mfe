"use client"
import algoliasearch from 'algoliasearch';
import useSWR from 'swr';

const client = algoliasearch(
    process.env.NEXT_PUBLIC_ALGOLIA_APP_ID as string,
    process.env.ALGOLIA_SEARCH_ADMIN_KEY as string,
);

async function algoliaSearchByKeyword<T = unknown>(
    index: string,
    keyword: string,
    page = 0,
    hitsPerPage = 1,
) {
    const searchIndex = client.initIndex(index);
    await searchIndex.setSettings({ searchableAttributes: ['title'] });
    const response = await searchIndex.search<T>(keyword, {
        page: page,
        hitsPerPage: hitsPerPage,
    });
    return response;
}

function useAlgoliaSearch<T = unknown>(search: string, page = 0, hitsPerPage = 4) {
    const { data, ...rest } = useSWR(search, s => algoliaSearchByKeyword<T>(
        process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME as string,
        s,
        page,
        hitsPerPage,
    ).then((r) => r));

    return {
        data: data?.hits ?? [],
        ...rest,
    }
}

async function algoliaGetCategoryList(index: string) {
    const searchIndex = client.initIndex(index);

    const { hits } = await searchIndex.search('', {
        attributesToRetrieve: ['category'],
    });

    const result: { name: any; count: number; }[] = [];
    const indexMapping = {} as any;
    let indicator = 0;

    // remove duplicate values and memorize the count
    hits.forEach(({ item }: any) => {
        const value = item.toLowerCase();

        if (Number.isInteger(indexMapping[value])) {
            result[indexMapping[value]].count += 1;
        } else {
            indexMapping[value] = indicator;
            result.push({
                name: item,
                count: 1,
            });

            indicator += 1;
        }
    });

    return result.sort((a, b) => b.count - a.count);
}

async function algoliaGetRecentEntries(index: string, limit = 5) {
    const searchIndex = client.initIndex(index);

    searchIndex.setSettings({
        ranking: ['desc(date)'],
    });

    const response = await searchIndex.search('', {
        hitsPerPage: limit,
    });

    return response;
}

async function indexPost(record: Readonly<Record<string, any>>, indexName: string) {
    try {
        const index = client.initIndex(indexName);
        console.log('algolia.js:: indexPost:: post:', record);

        const algoliaResponse = await index.saveObject(record);
    } catch (error) {
        console.log('algolia.js:: error: ', error);
    }
}

async function deleteIndex(id: string, indexName: string) {
    try {
        const index = client.initIndex(indexName);
        console.log('algolia.js:: deleteIndex:: id:', id);

        const algoliaResponse = await index.deleteObject(id);
        console.log(
            'algolia.js:: deleteIndex:: algoliaResponse: ',
            algoliaResponse,
        );
    } catch (error) {
        console.log('algolia.js:: error: ', error);
    }
}


export {
    algoliaSearchByKeyword,
    algoliaGetCategoryList,
    algoliaGetRecentEntries,
    indexPost,
    deleteIndex,
    useAlgoliaSearch,
};
