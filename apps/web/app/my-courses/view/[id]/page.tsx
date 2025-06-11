import React from 'react'
import { CoursesEnrolledAPI } from '../../../../api/v1/courses/enrolled/enrolled';
import { cookies } from 'next/headers';
import SingleCourses from '../../../_component/my-courses/my-course-view';

const getCourseVideo = async (courseId: string) => {
    const cookieStore = await cookies();

    const tokenKeyName = process.env.NEXT_PUBLIC_COOKIES_ACCESS_TOKEN
    const token = cookieStore.get(tokenKeyName)


    if (!token) {
        return { videos: [null] };
    }

    const params = { courseId }

    try {
        const response = await CoursesEnrolledAPI.getEnrolledVideo(token.value, params)
        const { videos } = response.data;
        return { videos };
    } catch (error) {
        return { videos: [] }
    }
};

async function Page(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const videos = await getCourseVideo(params.id)
    return (
        <SingleCourses videos={videos} />
    )
}

export default Page
