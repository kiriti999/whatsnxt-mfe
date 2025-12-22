import React from 'react'
import { fetchCourseBuilderData } from '../../../../../fetcher/courseBuilderServerQuery';
import CourseTypeInformation from '../../../../_component/trainer/CourseTypeInformation';


async function Page(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    let courseFetched = null;

    if (params.id) {
        // Fetch the course data on the server
        try {
            courseFetched = await fetchCourseBuilderData(params.id);
        } catch (error) {
            console.error('CourseTypeInformation:: Error fetching course:', error);
        }
    }
    return (
        <CourseTypeInformation id={params.id} courseType={courseFetched?.courseWithSections?.courseType} />
    )
}

export default Page
