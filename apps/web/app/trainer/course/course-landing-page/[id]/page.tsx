import React from 'react'
import { Metadata } from 'next';
import { fetchCourseBuilderData } from '../../../../../fetcher/courseBuilderServerQuery';
import CourseLandingPage from '../../../../_component/trainer/CourseLandingPage';

export const metadata: Metadata = {
    title: "Course landing page"
}


async function Page(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    let courseFetched = null;

    if (params.id) {
        // Fetch the course data on the server
        try {
            courseFetched = await fetchCourseBuilderData(params.id);
            console.log(' Landing Page :: courseFetched:', courseFetched)
        } catch (error) {
            console.error('CourseLandingPage:: Error fetching course:', error);
        }
    }
    return (
        <CourseLandingPage id={params.id} courseData={courseFetched} />
    )
}

export default Page
