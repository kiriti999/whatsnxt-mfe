'use client';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import CourseOverview from './sections/course-overview';
import CourseDescription from './sections/course-description';
import CourseReviews from './sections/course-reviews';
import Instructor from './sections/instructor';
import CourseCurriculum from '../../../components/CourseCurriculum/CourseCurriculum';
import { Box, Grid, GridCol, Title } from '@mantine/core';
import InterviewComponent from './sections/interview-questions';
import Image from 'next/image';

const CourseSlugDetails = ({ course, courseReviews, setCourseReviews, reviewCommentCount, isCourseReviewMode }) => {

    const { setValue } = useForm({
        mode: 'onBlur',
        defaultValues: { review: '' },
        resetOptions: {
            keepDirtyValues: true,
            keepErrors: true,
        },
    });

    // Shared state for reviews
    const [rating, setRating] = useState(0);
    const [isRatingProvided, setIsRatingProvided] = useState(false);
    const [commentIndex, setCommentIndex] = useState(-1);

    return (
        <>
            <CourseOverview overview={course.overview} courseName={course.courseName} />

            {isCourseReviewMode && course?.imageUrl && (
                <Grid>
                    <GridCol span={{ base: 12, md: 6, lg: 4 }}>
                        <Box my="md">
                            <Title order={5} mb="sm">Image Preview:</Title>
                            <Image
                                width={500}
                                height={500}
                                src={course.imageUrl}
                                alt="Image Preview"
                                className="image-preview"
                            />
                        </Box>
                    </GridCol>
                </Grid>
            )}

            <CourseCurriculum
                courseId={course?._id}
                userId={course?.userId}
                videos={course?.videos}
                sections={course?.sections}
                duration={course.duration}
                totalVideos={course.totalVideos}
                slug={course?.slug}
                isPurchased={course?.isPurchased}
                author={{
                    _id: course?.userId?._id,
                    rate: course?.userId?.rate || 200,
                }}
                isCourseReviewMode={isCourseReviewMode}
            />

            {course?.topics && <CourseDescription courseTopics={course.topics} />}

            <Instructor name={course?.author} designation={course?.userId?.designation} about={course?.userId?.about} />

            {isCourseReviewMode && <InterviewComponent course={course} />}

            {!isCourseReviewMode && (
                <CourseReviews
                    course={course}
                    courseReviews={courseReviews}
                    setCourseReviews={setCourseReviews}
                    reviewCommentCount={reviewCommentCount}
                    setValue={setValue}
                    setRating={setRating}
                    setIsRatingProvided={setIsRatingProvided}
                    setCommentIndex={setCommentIndex}
                />
            )}
        </>
    );
};

export default CourseSlugDetails;
