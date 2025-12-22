import React from 'react'
import { fetchCourseBuilderData } from '../../../../../fetcher/courseBuilderServerQuery';
import CourseInterviewPage from '../../../../_component/trainer/CourseInterviewPage';


async function Page(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    let courseFetched = null;

    if (params.id) {
        // Fetch the course data on the server
        try {
            courseFetched = await fetchCourseBuilderData(params.id);
        } catch (error) {
            console.error('CourseInterviewPage:: Error fetching course:', error);
        }
    }
    const { courseType, courseName, teacherName } = courseFetched?.courseWithSections;

    return (
        <CourseInterviewPage id={params.id} courseType={courseType} courseName={courseName} teacherName={teacherName} />
    )
}

export default Page
