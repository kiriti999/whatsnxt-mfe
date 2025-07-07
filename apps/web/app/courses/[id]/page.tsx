import React, { cache } from 'react';
import { fetchCourseBySlug, fetchCourseReviews } from '../../../fetcher/courseServerQuery';
import { CourseType } from '@whatsnxt/core-util';
import CourseSlug from '../../_component/courses/course-slug';
import { Metadata } from 'next';
import { generateMetadata as createMetadata } from '@whatsnxt/core-util';
import { notFound } from 'next/navigation';
import { Box } from '@mantine/core';

export const dynamic = 'force-dynamic';

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

        try {
            const reviewData = await fetchCourseReviews(courseId, 1);
            reviews = reviewData.feedbackComments || [];
            reviewCount = reviewData.total || 0;
        } catch (reviewError) {
            console.error('Error fetching reviews:', reviewError);
            // Continue without reviews rather than failing the whole page
        }

        return (
            <Box my={{ base: '2rem', sm: '3rem', md: '4rem' }}>
                <CourseSlug
                    course={course}
                    reviews={reviews}
                    reviewCommentCount={reviewCount}
                />
            </Box>
        );
    } catch (error) {
        console.error('Page rendering error:', error);
        notFound();
    }
}

export default Page;