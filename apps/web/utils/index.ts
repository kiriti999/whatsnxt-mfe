/* eslint-disable turbo/no-undeclared-env-vars */
import type { CourseType } from '@whatsnxt/core-util';

export const addPopularityToCourses = (courses: CourseType[], coursesPopularity: any[]) => {
    if (!courses || !coursesPopularity) return [];

    return courses.map((course) => {
        const popularity = coursesPopularity.find(
            (popular: { courseId: any; }) => popular.courseId === course._id
        );
        course.popularity = popularity ? popularity.count : 0;
        return course;
    });
};
