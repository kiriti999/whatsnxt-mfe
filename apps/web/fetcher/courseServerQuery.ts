// serverQuery.ts
import { CourseType } from '@whatsnxt/core-util';
import { serverFetcher } from './serverFetcher';

const BASEURL = process.env.BFF_HOST_COURSE_API as string;

export const fetchCourses = async (limit = 30, offset = 0) => {
  try {
    const response = await serverFetcher(BASEURL, `/courses/course?limit=${limit}&offset=${offset}`, {
      next: { revalidate: 300 }
    });

    // Ensure we always return a valid structure
    return response || { courses: [], total: 0 };
  } catch (error) {
    console.error('Error fetching courses:', error);
    return { courses: [], total: 0 };
  }
};

export const fetchPopularCourses = async () => {
  try {
    const response = await serverFetcher(BASEURL, '/courses/popularity') as any;
    return response?.enrolled || [];
  } catch (error) {
    console.error('Error fetching popular courses:', error);
    return [];
  }
};

// Retain existing export
export const fetchCategoriesByCount = async () => {
  try {
    const response = await serverFetcher(BASEURL, '/courses/categories/categoryByCount') as any;
    return response?.data?.categoriesCount || [];
  } catch (error) {
    console.error('Error fetching categories by count:', error);
    return [];
  }
};

export const fetchCategories = async () => {
  try {
    const response = await serverFetcher(BASEURL, '/courses/categories') as any;
    return response?.categories || [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};

export const fetchCourseBySlug = async (slug: string): Promise<CourseType | null> => {
  try {
    const response = await serverFetcher(BASEURL, `/courses/course/slug/${slug}`, {
      cache: 'no-store' // Prevent caching for admin review
    }) as any;
    return response.course as CourseType;
  } catch (error) {
    console.error('Error fetching course by slug:', error);
    return null;
  }
};

export const fetchCourseReviews = async (courseId: string, page = 1) => {
  try {
    const response = await serverFetcher(BASEURL, `/course/feedback/${courseId}/reviews?page=${page}`) as any;
    return { feedbackComments: response.feedbackComments, total: response.total };
  } catch (error) {
    console.error('Error fetching course reviews:', error);
    return { feedbackComments: [], total: 0 };
  }
};

export const fetchVideosBySection = async (sectionId: string) => {
  return await serverFetcher(BASEURL, `/video/${sectionId}`);
};

export const fetchLessonById = async (sectionId: string, lessonId: string) => {
  const videos = await fetchVideosBySection(sectionId) as any;
  return videos.find((item: any) => item._id === lessonId);
};

export const getEnrolledCourses = async () => {
  const response = await serverFetcher(BASEURL, `/courses/enrolled`);
  return response
}
