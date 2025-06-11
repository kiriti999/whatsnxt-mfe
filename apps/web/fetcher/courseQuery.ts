import { CourseType } from '@whatsnxt/core-util';

// Function to fetch courses with pagination
export const fetchCourses = async (limit = 30, offset = 0) => {
  try {
    console.log(' fetchCourses :: fetchCourses...')
    const response = await fetch(`/course/course?limit=${limit}&offset=${offset}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch courses: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('fetchCourses error:', error);
    throw error;
  }
};

// Function to fetch course by slug
export const fetchCourseBySlug = async (slug: string) => {
  try {
    const response = await fetch(`/course/course/slug/${slug}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch course by slug: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.course as CourseType;
  } catch (error) {
    console.error('fetchCourseBySlug error:', error);
    throw error;
  }
};

// Function to fetch course reviews
export const fetchCourseReviews = async (courseId: string, page = 1) => {
  try {
    const response = await fetch(`/course/feedback/${courseId}/reviews?page=${page}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch course reviews: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return { reviews: data.reviews, total: data.total };
  } catch (error) {
    console.error('fetchCourseReviews error:', error);
    throw error;
  }
};

// Function to fetch popular courses
export const fetchPopularCourses = async () => {
  try {
    const response = await fetch('/course/popularity');

    if (!response.ok) {
      throw new Error(`Failed to fetch popular courses: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.enrolled;
  } catch (error) {
    console.error('fetchPopularCourses error:', error);
    throw error;
  }
};

// Function to fetch course categories by count
export const fetchCategoriesByCount = async () => {
  try {
    const response = await fetch('/course/categories/categoryByCount');

    if (!response.ok) {
      throw new Error(`Failed to fetch categories by count: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.categories;
  } catch (error) {
    console.error('fetchCategoriesByCount error:', error);
    throw error;
  }
};

// Function to fetch videos by section ID
export const fetchVideosBySection = async (sectionId: string) => {
  try {
    const response = await fetch(`/video/${sectionId}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch videos by section: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('fetchVideosBySection error:', error);
    throw error;
  }
};