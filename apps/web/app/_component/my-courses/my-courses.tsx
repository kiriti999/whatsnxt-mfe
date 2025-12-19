"use client"
/* eslint-disable @next/next/no-img-element */

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { CardComponent } from '@whatsnxt/core-ui';
import { List, Progress, Rating, Text, ThemeIcon, Modal, Button, Box, Textarea, Title, Menu, Grid, Image, Container, Flex } from '@mantine/core';
import { useHover, useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import { IconBook, IconDotsVertical } from '@tabler/icons-react';
import Pagination from '../../../components/pagination/pagination';
import useAuth from "../../../hooks/Authentication/useAuth";
import { CourseFeedbackAPI } from '../../../apis/v1/courses/feedback/feedback';
import useCourseRefund from '../../../hooks/useCourseRefund';
import Refund from '../../../components/Refund';

type Lesson = {
  section_id: string;
  lesson_id: string;
  [key: string]: any; // Include any additional properties
};

type Course = {
  courseName: string;
  imageUrl: string;
  slug: string;
  paidType?: 'video' | 'live'; // Assuming these are the only options
  lessons?: number;
  duration?: string;
  overview: string;
  [key: string]: any; // Include any additional properties
};

type CourseCardProps = {
  course: Course;
  lessonsWatched: number;
  lessons: Lesson[];
  commentData: any;
  ratingData: any;
};

// Component to render a single course
const CourseCard = ({ course, lessonsWatched, lessons, commentData, ratingData }: CourseCardProps) => {
  const { user } = useAuth();
  const totalLessons = lessons.length;
  const courseProgressPercentage = lessonsWatched === 0 ? 0 : Math.ceil((lessonsWatched / totalLessons) * 100);
  const sectionId = totalLessons ? lessons[0].section_id : "";
  const lessonId = totalLessons ? lessons[0].lesson_id : "";
  const courseId = course._id;
  const courseLink = sectionId && lessonId ? `/courses/${course.slug}/section/${sectionId}/lesson/${lessonId}` : "";

  const [commentId, setCommetId] = useState('');

  const [courseRating, setCourseRating] = useState(ratingData?.[0]?.rating)
  const [courseReview, setCourseReview] = useState(commentData?.[0]?.content)
  const [rating, setRating] = useState(ratingData?.[0]?.rating)
  const [review, setReview] = useState(commentData?.[0]?.content)

  const [isReviewed, setIsReviewd] = useState(false);
  const { hovered, ref } = useHover();
  const [opened, { open, close }] = useDisclosure(false);
  const [showReviewTextBox, setShowReviewTextBox] = useState(false);
  const [isEditing, setIsEditing] = useState(true);

  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);

  useEffect(() => {
    if (ratingData?.[0]?.rating || commentData?.[0]?.content) {
      setIsReviewd(true);
      setShowReviewTextBox(true)
      setIsEditing(false);
      setCommetId(commentData?.[0]?._id);
    }
  }, []);

  const handleEditClick = () => {
    setIsEditing(true);
  }

  const handleRatingChange = (curRating) => {
    setRating(curRating);
    setShowReviewTextBox(true);
  }

  const handleClose = () => {
    setRating(courseRating);
    setReview(courseReview);
    if (!isReviewed) {
      setShowReviewTextBox(false);
      setIsEditing(true);
    } else {
      setIsEditing(false);
    }
    close();
  }

  const handleReviewSubmit = async () => {
    try {
      if (isReviewed) {
        await CourseFeedbackAPI.updateRating(courseId, {
          userId: user?._id,
          rating
        })
        const updatedComment = await CourseFeedbackAPI.updateComment({
          content: review,
          commentId: commentId
        })
      } else {
        const newComment = await CourseFeedbackAPI.addReview(courseId, {
          content: review,
          author: user?._id,
          email: user?.email,
          courseId,
        });
        const ratingResp = await CourseFeedbackAPI.addRating(courseId, {
          rating,
          courseId
        });
        setCommetId(newComment._id);
      }
      notifications.show({
        position: 'bottom-right',
        color: 'green',
        title: 'Review Submitted',
        message: 'Your review is submited',
      });
      setCourseRating(rating);
      setCourseReview(review);
      setIsEditing(false);
      setIsReviewd(true);
      close();
    } catch (error) {
      notifications.show({
        position: 'bottom-right',
        color: 'red',
        title: 'Review not Submitted',
        message: 'Unable to submit your review try again later.',
      });
      console.log("error submiting review", error.message);
    }
  }

  const handleDeleteClick = () => {
    modals.openConfirmModal({
      title: 'Confirm Deletion',
      centered: true,
      children: (
        <p>Are you sure you want to delete your review? This action cannot be undone.</p>
      ),
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          await CourseFeedbackAPI.deleteRating(courseId);
          await CourseFeedbackAPI.deleteComment({ commentId: commentId });

          // Reset states
          close();
          setCourseRating(0);
          setCourseReview('');
          setRating(0);
          setReview('');
          setIsEditing(true);
          setIsReviewd(false);
          setShowReviewTextBox(false);

          notifications.show({
            position: 'bottom-right',
            color: 'green',
            title: 'Review Deleted',
            message: 'Your review has been successfully deleted.',
          });
        } catch (error) {
          notifications.show({
            position: 'bottom-right',
            color: 'red',
            title: 'Error',
            message: 'An error occurred while deleting your review. Please try again.',
          });
        }
      },
    });
  };

  const { handleRefund, isRefundLoading, isRefundEligable } = useCourseRefund({
    userId: user?._id,
    buyerEmail: user?.email,
    courseId,
    courseName: course.courseName,
    setIsRefundModalOpen,
  });

  return (
    <>
      <Modal size={'auto'}
        opened={isRefundModalOpen}
        onClose={() => setIsRefundModalOpen(false)} // Close modal when clicking outside or on close button
        title={<Title order={4}>Course refund</Title>}
      >
        <Refund handleRefund={handleRefund} isRefundLoading={isRefundLoading} />
      </Modal>

      <CardComponent
        courseName={course.courseName}
        paidType={course.paidType}
        link={`/courses/${course.slug}`}
        image={
          <Image
            width={'100%'}
            height={500}
            src={course.imageUrl}
            alt={course.courseName}
          />
        }
      >
        <List size="sm" m={0} p={0}>
          {course.lessons > 0 && (
            <List.Item icon={<ThemeIcon size={24} radius="xl"><IconBook size={16} /></ThemeIcon>}>
              {course.lessons} Lessons
            </List.Item>
          )}
        </List>
        <Link href={courseLink}>
          <Progress.Root size={"xl"}>
            <Progress.Section value={courseProgressPercentage}>
              <Progress.Label fz={'xs'}>{courseProgressPercentage}% complete</Progress.Label>
            </Progress.Section>
          </Progress.Root>
        </Link>
        <Flex justify="space-between" align='flex-end'>
          <div>
            <Rating value={rating} readOnly fractions={2} size={18} mt={'xs'} />
            <Text ref={ref} onClick={open} style={{ cursor: 'pointer' }} component="span">
              {isReviewed ? (
                <>
                  {hovered ? <Text size='sm' component="span">Edit Review</Text> : <Text size='sm' component="span">Your Review</Text>}
                </>
              ) : (
                <Text size='sm' component="span">Add Review</Text>
              )}
            </Text>
          </div>
          {true && (
            <Menu openDelay={100} closeDelay={400} position="left">
              <Menu.Target>
                <Button variant="transparent" p={0}>
                  <IconDotsVertical size={20} />
                </Button>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item onClick={() => setIsRefundModalOpen(true)}>Get Refund</Menu.Item>
              </Menu.Dropdown>
            </Menu>
          )}
        </Flex>

        <Modal opened={opened} onClose={handleClose} title={isReviewed ? 'Edit Review' : 'Add Review'} centered>
          {isEditing ? (
            <Flex justify="center">
              <Box>
                <Text>How would you rate this course</Text>
                <Flex justify='center'>
                  <Rating defaultValue={rating} onChange={handleRatingChange} fractions={2} size={24} mt={'xs'} />
                </Flex>
                {showReviewTextBox &&
                  <>
                    <Textarea
                      placeholder="Tell us about the course"
                      label="Your Review"
                      autosize
                      minRows={2}
                      defaultValue={review}
                      onChange={(event) => setReview(event.target.value)}
                    />
                    <Flex gap='sm' mt="sm">
                      <Button onClick={handleReviewSubmit}>Submit Review</Button>
                      <Button onClick={handleClose}>Cancel</Button>
                    </Flex>
                  </>
                }
              </Box>
            </Flex>
          ) : (
            <>
              <Rating value={rating} readOnly fractions={2} size={18} mt={'xs'} />
              <Text className='mt-2 ml-1'>{review}</Text>
              <Flex justify='end' gap="md">
                <Button onClick={handleDeleteClick}>Delete</Button>
                <Button onClick={handleEditClick}>Edit</Button>
              </Flex>
            </>
          )}
        </Modal>
      </CardComponent>
    </>
  );
};

type EnrolledCourse = {
  _id: string;
  course: Course; // Reuse the `Course` type from the previous definition
  lessons_watched: number;
  lessons: Lesson[]; // Reuse the `Lesson` type from the previous definition,
  courseRatings: any;
  courseFeedback: any;
};

type MyCoursesProps = {
  enrolled: EnrolledCourse[]; // An array of enrolled courses
  total: number; // The total count of enrolled courses
};

const MyCourses = ({ enrolled, total }: MyCoursesProps) => {
  const [recordsPerPage] = useState(8);
  const [currentPage, setCurrentPage] = useState(1);
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = enrolled && enrolled.slice(indexOfFirstRecord, indexOfLastRecord);
  const nPages = Math.ceil(total / recordsPerPage);

  return (
    <Box py="xl">
      <Container>
        <Grid>
          {enrolled && enrolled.length > 0 ? (
            currentRecords.map((enrolledCourse) => (
              <Grid.Col
                key={enrolledCourse._id}
                span={{ base: 12, sm: 6, md: 4, lg: 4 }}
              >
                <CourseCard
                  course={enrolledCourse.course}
                  lessonsWatched={enrolledCourse.lessons_watched}
                  lessons={enrolledCourse.lessons}
                  commentData={enrolledCourse.courseFeedback}
                  ratingData={enrolledCourse.courseRatings}
                />
              </Grid.Col>
            ))
          ) : (
            <Grid.Col span={12}>
              <Title order={2} ta="center">
                No Courses Found
              </Title>
            </Grid.Col>
          )}
        </Grid>

        <Box mt="xl" ta="center">
          <Pagination
            nPages={nPages}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />
        </Box>
      </Container>
    </Box>
  );
};

export default MyCourses;