'use client'
import { useIsEnrolled } from "../../hooks/useIsEnrolled";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import CreateReviewComment from "../ReviewComment/actions/createReviewComment";
import { Box, Flex, Rating, Title, Text, Paper, Group, Button, Tooltip } from "@mantine/core";
import { FormatText } from "../Comments/helper";
import { IconEdit } from "@tabler/icons-react";
import { CourseFeedbackAPI } from '../../apis/v1/courses/feedback/feedback';

function UserFeedBack({ courseId, reviewComment, userId }: { courseId: string, reviewComment: any, userId: string }) {
    const { isEnrolled } = useIsEnrolled(courseId)
    const [rating, setRating] = useState(0);
    const [editMode, setEditMode] = useState(false)

    const [userReviewComment, setUserReviewComment] = useState(null);

    const { data: courseRating = { rating: 0 }, isPending } = useQuery({
        queryKey: ["user-rating", courseId],
        queryFn: () => CourseFeedbackAPI.getUserRating(courseId, userId)
    })

    useEffect(() => {
        if (courseRating) {
            setRating(courseRating.rating)
        }
    }, [courseRating])

    useEffect(() => {
        if (reviewComment) {
            setUserReviewComment(reviewComment)
        }
    }, [reviewComment])

    const ratingChanged = (v) => {
        setRating(v)
    }

    const cancelEditMode = () => {
        setEditMode(false);
    }

    return (
        <Paper withBorder py={'xl'}>
            <Group justify='center' mb={'lg'}>
                {userReviewComment && userReviewComment.is_editable && (
                    <Tooltip label='Edit feedback'>
                        <Button onClick={() => setEditMode(true)}
                            size='xs' leftSection={<IconEdit
                                size={16}
                            />}>Edit
                        </Button>
                    </Tooltip>
                )}
            </Group>

            {!isPending && (
                <Flex direction={"column"} justify={"center"} align={"center"} w={"100%"} maw={500} mx={"auto"}>
                    {isEnrolled && (
                        <>
                            <Title order={4}>How would you rate this course?</Title>
                            <Title order={5}>Select rating</Title>
                            <Rating
                                value={rating}
                                fractions={2}
                                size={34}
                                onChange={ratingChanged}
                                readOnly={userReviewComment && !editMode}
                            />
                        </>
                    )}

                    {!userReviewComment && rating !== 0 ? (
                        <CreateReviewComment courseId={courseId} rating={rating} cancelEditMode={cancelEditMode} setComments={setUserReviewComment} mode={"create"} />
                    ) : userReviewComment ? (
                        <Box w={"100%"}>
                            {!editMode ? (

                                <Flex gap={16} justify={"center"} pt={20}>
                                    <Text maw={"fit-content"} style={{ wordWrap: 'break-word', flex: " 1 1 0%" }}>
                                        {FormatText(userReviewComment?.content)}
                                    </Text>
                                </Flex>

                            ) : (
                                <CreateReviewComment
                                    courseId={courseId}
                                    rating={rating}
                                    setComments={setUserReviewComment}
                                    defaultValue={userReviewComment?.content}
                                    mode={"edit"}
                                    commentId={userReviewComment?._id}
                                    cancelEditMode={cancelEditMode}
                                />
                            )}
                        </Box>
                    ) : null}
                </Flex>
            )}
        </Paper>
    )
}

export default UserFeedBack