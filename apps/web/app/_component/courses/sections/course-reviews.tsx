import React, { useEffect, useState } from 'react';
import { Avatar, Box, Button, Grid, Rating, Stack, Title, Text, Flex, Menu } from '@mantine/core';
import { RatingBars } from '@whatsnxt/core-ui';
import useAuth from '../../../../hooks/Authentication/useAuth';
import { CourseFeedbackAPI } from '../../../../apis/v1/courses/feedback/feedback';
import { formatRelativeTime, FormatText } from '../../../../components/Comments/helper';
import { IconDotsVertical } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import ReviewAction from './review-actions/actions';

const DISPLAY_LENGTH = 5;

const CourseReviews = ({
    course,
    courseReviews,
    setCourseReviews,
    reviewCommentCount,
    setValue,
    setRating,
    setIsRatingProvided,
    setCommentIndex,
}) => {
    const [reviewsPage, setReviewsPage] = useState(1);
    const [hasMoreReviews, setHasMoreReviews] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        setReviewsPage(2);
        if (!courseReviews?.length) return;
        if (reviewCommentCount === courseReviews.length) {
            setHasMoreReviews(false);
        }

        if (!user?.isAuthenticated) return;

        const { _id: userId } = user;

        for (let i = 0; i < courseReviews.length; i++) {
            const review = courseReviews[i];
            if (review.userId === userId) {
                setCommentIndex(i);
                setRating(review.rating);
                setIsRatingProvided(true);
                setValue('review', review.comments);
                break;
            }
        }
    }, [user?.isAuthenticated, courseReviews, reviewCommentCount, setValue, setCommentIndex, setRating, setIsRatingProvided]);

    const loadMore = async (e) => {
        e.preventDefault();

        const res = await CourseFeedbackAPI.getReviews(course._id, reviewsPage);
        if (courseReviews) {
            setReviewsPage(reviewsPage + 1);
            if (res.data.total <= courseReviews.length + res.data?.reviews.length) {
                setHasMoreReviews(false);
            }
            setCourseReviews([...courseReviews, ...res.data.reviews]);
        }
    };

    const flagComment = async (reviewId) => {
        await CourseFeedbackAPI.flagRating({ id: reviewId, userId: user._id });
        notifications.show({
            title: 'Comment flagged',
            message: 'Comment has been reported',
            color: 'green',
        });
    };

    return (
        <Box my={'xl'}>
            {(course.rating > 0 || courseReviews?.length > 0) && (
                <Box>
                    <Title order={3}>Ratings</Title>
                    <Box mt="md">
                        {/* Display the average rating if available */}
                        {course.rating > 0 && (
                            <Rating
                                defaultValue={course.rating}
                                fractions={2}
                                size={24}
                                readOnly
                                className="mt-1"
                            />
                        )}

                        {/* Display rating bars if reviews exist */}
                        {courseReviews?.length > 0 && (
                            <RatingBars course={course} courseReviews={courseReviews} />
                        )}
                    </Box>
                </Box>
            )}

            <Box my="xl">
                {courseReviews?.length > 0 && (
                    <>
                        <Title order={5}>{courseReviews.length} Reviews</Title>

                        {courseReviews.slice(0, DISPLAY_LENGTH).map(({ _id, email, rating, updatedAt, content, likedBy, disLikedBy }) => (
                            <Box key={_id} mb="xl">
                                <Stack>
                                    {/* Reviewer Information */}
                                    <Grid align="center">
                                        {/* Avatar */}
                                        <Grid.Col span={{ base: 2, sm: 1, md: 1 }}>
                                            <Avatar size="2.7rem" color="#fe4a55">
                                                {email?.charAt(0)?.toUpperCase() || '?'}
                                            </Avatar>
                                        </Grid.Col>

                                        {/* Reviewer Details */}
                                        <Grid.Col span={{ base: 8, sm: 10, md: 10 }}>
                                            <Flex direction="column">
                                                <Text m={0}>{email?.split('@')[0] || 'Author'}</Text>
                                                <Flex gap="xs" mt={2} wrap="wrap" align="center">
                                                    <Rating defaultValue={rating} fractions={2} size={14} readOnly />
                                                    <Text size="xs">{formatRelativeTime(updatedAt)}</Text>
                                                </Flex>
                                            </Flex>
                                        </Grid.Col>

                                        {/* Actions (Menu Button) */}
                                        <Grid.Col span={{ base: 2, sm: 1, md: 1 }} style={{ 'textAlign': 'right' }}>
                                            <Menu trigger="hover" openDelay={100} closeDelay={400} position="top">
                                                <Menu.Target>
                                                    <Button variant="transparent" p={0}>
                                                        <IconDotsVertical size={20} />
                                                    </Button>
                                                </Menu.Target>
                                                <Menu.Dropdown>
                                                    <Menu.Item onClick={() => flagComment(_id)}>Report</Menu.Item>
                                                </Menu.Dropdown>
                                            </Menu>
                                        </Grid.Col>
                                    </Grid>
                                </Stack>

                                {/* Review Content */}
                                < Stack my="md" >
                                    <Text>{FormatText(content)}</Text>
                                </Stack>

                                {/* Review Actions */}
                                <Stack mb="xl">
                                    <Flex gap="sm" align="baseline">
                                        <Text size="xs">Helpful?</Text>
                                        <ReviewAction reviewId={_id} likes={likedBy} dislikes={disLikedBy} />
                                    </Flex>
                                </Stack>
                            </Box>

                        ))}

                        {/* Load More Button */}
                        {hasMoreReviews && (
                            <Button size="xs" onClick={loadMore}>
                                Load More
                            </Button>
                        )}
                    </>
                )
                }
            </Box >

        </Box >
    );
};

export default CourseReviews;
