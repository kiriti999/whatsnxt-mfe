import React from 'react'
import { CoursesEnrolledAPI } from '../../api/v1/courses/enrolled/enrolled';
import { cookies } from 'next/headers';
import MyCourses from '../_component/my-courses/my-courses';

const getEnrolledCourses = async () => {
    const cookieStore = await cookies();
    const tokenKeyName = process.env.NEXT_PUBLIC_COOKIES_ACCESS_TOKEN

    const token = cookieStore.get(tokenKeyName)
    if (!token) {
        return { enrolled: [] };
    }

    try {
        const response = await CoursesEnrolledAPI.getEnrolled(token.value)
        console.log('🚀 ~ getEnrolledCourses ~ response:', response.data)

        const { enrolled, total } = response.data;
        return { enrolled, total };
    } catch (error) {
        console.error('Error fetching enrolled courses:', error);
        return { enrolled: [] };
    }
};

async function Page() {
    const { enrolled, total } = await getEnrolledCourses()
    return (
        <MyCourses enrolled={enrolled} total={total} />
    )
}

export default Page
