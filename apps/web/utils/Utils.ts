/* eslint-disable turbo/no-undeclared-env-vars */
import xior from 'xior';
import cookie from 'js-cookie';
import type { CourseType } from '@whatsnxt/core-util';

export const handleLogin = (token: any) => {
    setLoginCookie(process.env.NEXT_PUBLIC_COOKIES_ACCESS_TOKEN, token);
};

const setLoginCookie = (key, value: any) => {
    cookie.set(key, value, { sameSite: 'strict' });
};
export const removeCookie = (key) => {
    cookie.remove(key);
};

export const getCookieAccessToken = () => {
    return cookie.get(process.env.NEXT_PUBLIC_COOKIES_ACCESS_TOKEN)
};

export const getCookieUserInfo = () => {
    return cookie.get(process.env.NEXT_PUBLIC_COOKIES_USER_INFO)
}

export const fetchUser = async (token: any) => {
    try {
        const payload = { headers: { Authorization: token } };
        const url = `${axiosApi.baseUrl}/common/profile`;
        // const response = await AccountAPI.get(); // This is not working - dont use AccountAPI
        const response = await xior.get(url, payload);
        return response?.data?.profile;
    } catch (error) {
        console.log('auth.js:: fetchUser:: error: ', error);
    }
};

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

const formatPrice = (price: any, discount: any) => {
    return (price - (price * discount) / 100)
}

export const axiosApi = {
    baseUrl: process.env.NEXT_PUBLIC_BFF_HOST_API,
    version: process.env.NEXT_PUBLIC_BFF_VERSION,
    blogApiBaseUrl: process.env.NEXT_PUBLIC_BFF_BLOG_HOST
}

export const checkSuccessResponse = res => {
    return res?.status === 200 || res?.status === 201 || res?.success === true
}

export const getErrorMessageFromResponse = error => {
    if (error?.response && error?.response?.data) {

        if (error?.response?.data?.message) return error.response.data.message

        return error.response.data

    }
    return ''
}
