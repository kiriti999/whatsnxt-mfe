// courseBuilderServerQuery.ts

import { serverFetcher } from './serverFetcher';
const BASEURL = process.env.BFF_HOST_COURSE_API as string;

// Function to fetch course data for the course builder
export const fetchCourseBuilderData = async (id: string) => {
    try {
        // const response = await fetch(`/courses/course-builder/${id}`);
        const response = await serverFetcher(BASEURL, `/courses/course-builder/${id}`);
        return response;
    } catch (error) {
        console.error('courseBuilderServerQuery:: Error fetching course in course builder:', error);
        throw error;
    }
};
