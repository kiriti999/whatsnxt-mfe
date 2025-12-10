"use client"

import React, { useEffect, useState } from 'react';
import { NotFoundComponent } from '@whatsnxt/core-ui';
import { type CourseType, type Review } from '@whatsnxt/core-util';
import styles from '../../../components/Courses/Course.module.css';
import { CoursesDetailsSidebar } from '../../../components/CoursesDetailsSidebar';
import CourseSlugDetails from './courseSlugDetails';
import useAuth from '../../../hooks/Authentication/useAuth';
import CourseApproval from './admin/course-approval-section'
import { Container, Grid, GridCol, Box } from '@mantine/core';
import SimilarCourses from './similar-courses';

export default function CourseSlug({ course, reviews, reviewCommentCount, similarCourses = [] }: CourseProps) {
  const [courseReviews, setCourseReviews] = useState(reviews);
  const [isCourseReviewMode, setisCourseReviewMode] = useState(false);
  const { user: loggedInUser } = useAuth();


  useEffect(() => {
    if (loggedInUser?.role == "admin") {
      setisCourseReviewMode(true)
    }
  }, [loggedInUser])

  useEffect(() => {
    setCourseReviews(reviews)
  }, [reviews]);


  if (!course) return <><NotFoundComponent goToLink='/' /></>

  return (
    <div>
      <div className='courses-details-area'>
        <Container size={'xl'}>
          <Grid>
            <Grid.Col span={{ base: 12, md: 12, lg: 8 }}>
              <div className={`${styles['courses-details-desc']}`}>
                <CourseSlugDetails course={course} courseReviews={courseReviews} setCourseReviews={setCourseReviews}
                  reviewCommentCount={reviewCommentCount} isCourseReviewMode={isCourseReviewMode} />
              </div>
            </Grid.Col>

            <GridCol span={{ base: 12, md: 12, lg: 4 }}>
              <CoursesDetailsSidebar
                {...course}
                courseData={course}
                loggedInUser={loggedInUser}
                isCourseReviewMode={isCourseReviewMode}
              />
            </GridCol>
          </Grid>

          {loggedInUser?.role == "admin" && (
            <CourseApproval course={course} />
          )}

          <SimilarCourses courses={similarCourses} />
        </Container>
      </div>

    </div>
  );
}

type CourseProps = {
  course: CourseType;
  reviews: Review[];
  reviewCommentCount: number;
  similarCourses?: any[];
}
