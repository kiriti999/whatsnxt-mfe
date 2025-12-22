import React, { cache } from 'react';
import { fetchCourseBySlug, fetchCourseReviews, fetchCourses } from '../../../fetcher/courseServerQuery';
import { CourseType } from '@whatsnxt/core-util';
import CourseSlug from '../../_component/courses/course-slug';
import { Metadata } from 'next';
import { generateMetadata as createMetadata } from '@whatsnxt/core-util';
import { notFound } from 'next/navigation';
import { Box } from '@mantine/core';


const fetchCourseData = cache(async (slug: string) => {
    try {

        const course = await fetchCourseBySlug(slug) as CourseType;

        return course;
    } catch (error) {
        console.error('Error fetching course:', error);
        return null;
    }
});

export async function generateMetadata({ params }): Promise<Metadata> {
    try {
        const { id: slug } = await params;
        console.log('Metadata Generation - Slug:', slug);

        const fetchResult = await fetchCourseData(slug);

        if (!fetchResult) {
            console.warn(`No course found for slug: ${slug}`);
            return {
                title: 'Course Not Found | whatsnxt.in',
                description: 'The requested course could not be found.'
            };
        }

        const metadata = createMetadata({
            title: `${fetchResult.courseName}` || 'whatsnxt.in',
            description: fetchResult.overview
                ? `${fetchResult.overview.substring(0, 150)}...`
                : undefined,
            type: 'article',
            siteName: 'whatsnxt.in',
            keywords: ['course', fetchResult.slug],
            author: 'whatsnxt.in',
            publishedDate: fetchResult.createdAt,
            modifiedDate: fetchResult.updatedAt,
            canonical: `https://www.whatsnxt.in/course/${slug}`,
        });

        return metadata;
    } catch (error) {
        console.error('Metadata Generation Error:', {
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : 'No stack trace'
        });
        return {
            title: 'Course | whatsnxt.in',
            description: 'Learn new skills with our comprehensive courses.'
        };
    }
}

async function Page({ params }) {
    try {
        const { id: slug } = await params;

        // Fetch course by slug
        const course = await fetchCourseData(slug);

        if (!course) {
            console.log('Course not found, showing 404');
            notFound(); // This will show the 404 page
        }

        const courseId = course._id;

        // Fetch course reviews with error handling
        let reviews = [];
        let reviewCount = 0;

        // Parallelize fetching of reviews (if needed) and similar courses
        // 1. Reviews Promise
        let reviewsPromise: Promise<any> = Promise.resolve({ feedbackComments: [], total: 0 });
        if (!course.reviews) {
            reviewsPromise = fetchCourseReviews(courseId, 1).catch(reviewError => {
                console.error('Error fetching reviews:', reviewError);
                return { feedbackComments: [], total: 0 };
            });
        }

        // 2. Similar Courses Promise
        const similarCoursesPromise = fetchCourses(5, 0).then(res => {
            return res?.courses?.filter((c: any) => c._id !== courseId).slice(0, 3) || [];
        }).catch(err => {
            console.error('Error fetching similar courses:', err);
            return [];
        });

        // Await all promises
        const [reviewData, similarCourses] = await Promise.all([
            course.reviews ? Promise.resolve(null) : reviewsPromise,
            similarCoursesPromise
        ]);

        // Process Reviews
        if (course.reviews) {
            reviews = course.reviews;
            reviewCount = course.reviewCount || reviews.length;
        } else if (reviewData) {
            reviews = reviewData.feedbackComments || [];
            reviewCount = reviewData.total || 0;
        }

        return (
            <Box my={{ base: '2rem', sm: '3rem', md: '4rem' }}>
                <CourseSlug
                    course={course}
                    reviews={reviews}
                    reviewCommentCount={reviewCount}
                    similarCourses={similarCourses}
                />
            </Box>
        );
    } catch (error) {
        console.error('Page rendering error:', error);
        notFound();
    }
}

export default Page;