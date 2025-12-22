import React from 'react';
import { fetchCourseBuilderData } from '../../../../../fetcher/courseBuilderServerQuery';
import CourseBuilder from '../../../../_component/trainer/CourseBuilder';

async function Page(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    let courseFetched = null;

    if (params.id) {
        try {
            courseFetched = await fetchCourseBuilderData(params.id);
        } catch (error) {
            console.error('Error in Page component while fetching course:', error);
        }
    }

    return (
        <CourseBuilder id={params.id} courseData={courseFetched} />
    );
}

export default Page;
