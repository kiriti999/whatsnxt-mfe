import React from 'react'
import SearchResults from '../../components/SearchResults';
import { fetchPopularCourses } from '../../fetcher/courseServerQuery';

export const dynamic = 'force-dynamic'
async function Page() {
    const coursesPopularity = await fetchPopularCourses()
    return (
        <div>
            {<SearchResults coursesPopularity={coursesPopularity} />}
        </div>
    )
}

export default Page
