// serverQuery.ts
import { CourseType } from '@whatsnxt/core-util';
import { serverFetcher } from './serverFetcher';

const BASEURL = process.env.BFF_HOST_COURSE_API as string;
console.log('🚀 :: BASEURL:', BASEURL)
console.log('🚀 :: BASEURL:', BASEURL)
console.log('🚀 :: BASEURL:', BASEURL)
console.log('🚀 :: BASEURL:', BASEURL)
console.log('🚀 :: BASEURL:', BASEURL)
console.log('🚀 :: BASEURL:', BASEURL)
console.log('🚀 :: BASEURL:', BASEURL)

export const fetchCourses = async (limit = 30, offset = 0) => {
  const response = await serverFetcher(BASEURL, `/courses/course?limit=${limit}&offset=${offset}`, {
    next: { revalidate: 3600 }
  });
  return response;
};

export const fetchPopularCourses = async () => {
  const response = await serverFetcher(BASEURL, '/courses/popularity') as any;
  return response?.enrolled || [];
};

export const fetchCategoriesByCount = async () => {
  const response = await serverFetcher(BASEURL, '/courses/categories/categoryByCount') as any;
  console.log(' fetchCategoriesByCount :: response:', response)
  return response?.data?.categoriesCount || [];
};

export const fetchCourseBySlug = async (slug: string): Promise<CourseType> => {
  const response = await serverFetcher(BASEURL, `/courses/course/slug/${slug}`) as any;
  return response.course as CourseType;
};

export const fetchCourseReviews = async (courseId: string, page = 1) => {
  const response = await serverFetcher(BASEURL, `/course/feedback/${courseId}/reviews?page=${page}`) as any;
  return { feedbackComments: response.feedbackComments, total: response.total };
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
