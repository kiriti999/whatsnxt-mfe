import React from 'react'
import AlgoliaSearchComponent from '../../components/Algolia-search/algolia-search'
import { serverFetcher } from '../../fetcher/serverFetcher'


async function Page() {
    const { enrolled: coursesPopularity } = await fetch('/courses/popularity')
    return (
        <div>
            {<AlgoliaSearchComponent coursesPopularity={coursesPopularity} />}
        </div>
    )
}

export default Page
