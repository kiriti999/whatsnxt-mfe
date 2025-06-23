import { IconThumbDown, IconThumbDownFilled, IconThumbUp, IconThumbUpFilled } from "@tabler/icons-react"
import { CourseFeedbackAPI } from "../../../../../apis/v1/courses/feedback/feedback";
import useAuth from "../../../../../hooks/Authentication/useAuth";
import { Box, Button } from "@mantine/core";
import { useState } from "react";

function ReviewAction({ reviewId, likes, dislikes }) {
    const { user } = useAuth();
    const [likedUsers, setLikedUsers] = useState<string[]>(likes);
    const [dislikedUsers, setDisikedUsers] = useState<string[]>(dislikes);

    const likeReview = async () => {
        const { data } = await CourseFeedbackAPI.toggleLike({ id: reviewId, userId: user._id });
        setLikedUsers(data.likedBy)
        setDisikedUsers(data.disLikedBy)
    }

    const toggleDislike = async () => {
        const { data } = await CourseFeedbackAPI.toggleDislike({ id: reviewId, userId: user._id });
        setLikedUsers(data.likedBy)
        setDisikedUsers(data.disLikedBy)
    }
    return (
        <Box>
            <Button
                variant={"transparent"}
                onClick={likeReview}
                px={0}
                pr={10}
            >
                {likedUsers.includes(user?._id) ? (
                    <IconThumbUpFilled size={20} />
                ) : (
                    <IconThumbUp size={20} />
                )}
                {likedUsers.length || ""}
            </Button>

            <Button
                variant={"transparent"}
                onClick={toggleDislike}
                px={0}
            >
                {dislikedUsers.includes(user?._id) ? (
                    <IconThumbDownFilled size={20} />
                ) : (
                    <IconThumbDown size={20} />
                )}
                {dislikedUsers.length || ""}
            </Button>
        </Box>
    )
}

export default ReviewAction;