// serverQuery.ts
import { CourseType } from '@whatsnxt/core-util';
import { serverFetcher } from './serverFetcher';

export const fetchCourses = async (limit = 30, offset = 0) => {
  const response = await serverFetcher(`/courses/course?limit=${limit}&offset=${offset}`);
  return response;
};

export const fetchPopularCourses = async () => {
  const response = await serverFetcher('/course/popularity') as any;
  return response.enrolled;
};

export const fetchCategoriesByCount = async () => {
  const response = await serverFetcher('/course/categories/categoryByCount') as any;
  return response.categories;
};

export const fetchCourseBySlug = async (slug: string): Promise<CourseType> => {
  const response = await serverFetcher(`/courses/course/slug/${slug}`) as any;
  return response.course as CourseType;
};

export const fetchCourseReviews = async (courseId: string, page = 1) => {
  const response = await serverFetcher(`/course/feedback/${courseId}/reviews?page=${page}`) as any;
  return { feedbackComments: response.feedbackComments, total: response.total };
};

export const fetchVideosBySection = async (sectionId: string) => {
  return await serverFetcher(`/video/${sectionId}`);
};

export const fetchLessonById = async (sectionId: string, lessonId: string) => {
  const videos = await fetchVideosBySection(sectionId) as any;
  return videos.find((item: any) => item._id === lessonId);
};
