import React from 'react'
import MyCourses from '../_component/my-courses/my-courses';
import { getEnrolledCourses } from '../../fetcher/courseServerQuery';

export const dynamic = 'force-dynamic';

async function Page() {
    const { enrolled, total } = await getEnrolledCourses()
    return (
        <MyCourses enrolled={enrolled} total={total} />
    )
}

export default Page
