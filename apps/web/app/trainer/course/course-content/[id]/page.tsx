import React from 'react';
import { Metadata } from 'next';
import { fetchCourseBuilderData } from '../../../../../fetcher/courseBuilderServerQuery';
import CourseContentPage from '../../../../_component/trainer/CourseContent';

export const metadata: Metadata = {
    title: 'Course Content Editor',
    description: 'Create and manage structured course content including sections, comparisons, and collapsibles',
};

export const dynamic = 'force-dynamic';

async function Page(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    let courseFetched = null;

    if (params.id) {
        try {
            courseFetched = await fetchCourseBuilderData(params.id);
            console.log('Course Content Page :: courseFetched:', courseFetched);
        } catch (error) {
            console.error('CourseContentPage:: Error fetching course:', error);
        }
    }

    return <CourseContentPage id={params.id} courseData={courseFetched} />;
}

export default Page;
