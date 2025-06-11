// courseBuilderServerQuery.ts

import { serverFetcher } from './serverFetcher';


// Function to fetch course data for the course builder
export const fetchCourseBuilderData = async (id: string) => {
    try {
        // const response = await fetch(`/courses/course-builder/${id}`);
        const response = await serverFetcher(`/courses/course-builder/${id}`);
        return response;
    } catch (error) {
        console.error('courseBuilderServerQuery:: Error fetching course in course builder:', error);
        throw error;
    }
};
