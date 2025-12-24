import { courseApiClient } from '@whatsnxt/core-util';

export const CourseAPI = {
    createCourseName: async function (payload) {
        const response = await courseApiClient.post('/courses/course', payload);
        return response;
    },
    deleteCourse: async function (id) {
        const response = await courseApiClient.delete(`/courses/course/${id}`);
        return response;
    },
    publishAllVideosInSection: async function (sectionId, payload) {
        const response = await courseApiClient.post(`/courses/course/sections/${sectionId}/videos/publishAll`, payload);
        return response;
    },
    publishVideo: async function (sectionId, videoId, payload) {
        const response = await courseApiClient.post(`/courses/course/sections/${sectionId}/videos/${videoId}/publish`, payload);
        return response;
    },
    publishCourse: async function (courseId, payload) {
        const response = await courseApiClient.post(`/courses/course/${courseId}/publish`, payload);
        return response;
    },
    getCourseByStatus: async function (status = "all", offset = 0, limit = 10) {
        const response = await courseApiClient.get(`/courses/course/status?limit=${limit}&offset=${offset}&status=${status}`);
        return response;
    },
    getInstructorCourses: async function (instructorId: string) {
        const response = await courseApiClient.get(`/courses/course/instructor/${instructorId}`);
        return response;
    },
};