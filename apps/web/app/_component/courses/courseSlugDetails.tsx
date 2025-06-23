'use client';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import CourseOverview from './sections/course-overview';
import CourseDescription from './sections/course-description';
import CourseReviews from './sections/course-reviews';
import Instructor from './sections/instructor';
import CourseCurriculum from '../../../components/CourseCurriculum/CourseCurriculum';
import { Box, Title } from '@mantine/core';
import InterviewComponent from './sections/interview-questions';

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

            {isCourseReviewMode && course?.courseImageUrl && (
                <Box my="md" className='col-lg-3 col-md-6'>
                    <Title order={5}>Image Preview:</Title>
                    <img src={course.courseImageUrl} alt="Image Preview" className="image-preview" />
                </Box>
            )}

            <Instructor name={course?.author} designation={course?.userId?.designation} about={course?.userId?.about} />

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
