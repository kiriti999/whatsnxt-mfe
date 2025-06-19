import { courseApiClient } from '@whatsnxt/core-util';

export const TrainerAPI = {
    courseHistory: async function (page = null, id = null, search = null) {
        const url = `/courses/trainer/course-history?${page ? `page=${page}` : ''}${id ? `&id=${id}` : ''}${search ? `&search=${search}` : ''}`;
        const response = await courseApiClient.get(url);
        return response;
    },
    trainerCourses: async function (page = null, id = null, search = null) {
        const url = `/courses/trainer/trainer-courses?${page ? `page=${page}` : ''}${id ? `&id=${id}` : ''}${search ? `&search=${search}` : ''}`;
        const response = await courseApiClient.get(url);
        return response;
    },
    getSections: async function (page = null, id = null, search = null) {
        const url = `/courses/trainer/get-sections?${page ? `page=${page}` : ''}${id ? `&id=${id}` : ''}${search ? `&search=${search}` : ''}`;
        const response = await courseApiClient.get(url);
        return response;
    },
    getCourseNames: async function () {
        const response = await courseApiClient.get('/courses/trainer/get-course-names');
        return response;
    },
    getSectionByVideoId: async function (id) {
        const url = `/courses/trainer/get-sections-by-video?id=${id}`;
        const response = await courseApiClient.get(url);
        return response;
    },
    getNotification: async function (page = undefined) {
        const url = `/courses/trainer/notifications${page ? `?page=${page}` : ''}`;
        const response = await courseApiClient.get(url);
        return response;
    },
    getTrainers: async function () {
        const response = await courseApiClient.get('/courses/trainer/trainers');
        return response;
    },
    searchTrainers: async function (page, query) {
        const url = `/courses/trainer/search-trainers?${page ? `&page=${page}` : ''}${query ? `&query=${query}` : ''}`;
        const response = await courseApiClient.get(url);
        return response;
    },
    hireTrainer: async function (payload) {
        const response = await courseApiClient.post('/courses/trainer/hire-trainer', payload);
        return response;
    },
    updateBooking: async function (payload) {
        const response = await courseApiClient.post('/courses/trainer/update-booking', payload);
        return response;
    },
    getBooking: async function () {
        const response = await courseApiClient.get('/courses/trainer/get-bookings');
        return response;
    },
    checkout: async function (payload) {
        const response = await courseApiClient.post('/courses/trainer/checkout', payload);
        return response;
    },
};