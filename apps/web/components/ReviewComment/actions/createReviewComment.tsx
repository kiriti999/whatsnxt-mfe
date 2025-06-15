import { Box, Button, Flex, InputLabel, Text, Textarea } from "@mantine/core"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation";
import useAuth from "../../../hooks/Authentication/useAuth";
import { useIsEnrolled } from "../../../hooks/useIsEnrolled";
import { CourseFeedbackAPI } from '../../../api/v1/courses/feedback/feedback';
import { notifications } from '@mantine/notifications';

const validationOptions = {
  comment: {
    required: 'Input filed is required',
    minLength: {
      value: 2,
      message: 'Min 2 Characters required',
    },
  },
};

function CreateReviewComment({ courseId, setComments, rating, defaultValue = "", mode, commentId = "", cancelEditMode }) {
  const { user } = useAuth();
  const router = useRouter();

  const { isEnrolled } = useIsEnrolled(courseId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      comment: defaultValue,
    },
    resetOptions: {
      keepDirtyValues: false, // user-interacted input will be retained
      keepErrors: true, // input errors will be retained with value update
    },
  });

  const onSubmit = async (value) => {
    if (!user?.email) {
      router.push('/auth/authentication');
      return;
    }

    if (mode === "edit") {
      const updatedRating = await CourseFeedbackAPI.updateRating(courseId, {
        userId: user?._id,
        rating
      })

      if (updatedRating.status === 200) {
        notifications.show({
          position: 'bottom-right',
          color: 'green',
          title: 'Rating',
          message: 'Rating updated',
        });
      }

      const updatedComment = await CourseFeedbackAPI.updateComment({
        content: value.comment,
        commentId
      })

      if (updatedComment.status === 200) {
        notifications.show({
          position: 'bottom-right',
          color: 'green',
          title: 'Review',
          message: 'Review updated',
        });
      }

      setComments(updatedComment);
      cancelEditMode();
      return;
    }

    const newComment = await CourseFeedbackAPI.addReview(courseId, {
      content: value.comment,
      author: user?._id,
      email: user?.email,
      courseId,
    })

    if (newComment.status === 201) {
      notifications.show({
        position: 'bottom-right',
        color: 'green',
        title: 'Review',
        message: 'Review submitted',
      });
    }

    const newRating = await CourseFeedbackAPI.addRating(courseId, {
      rating,
      courseId
    })

    if (newRating.status === 200) {
      notifications.show({
        position: 'bottom-right',
        color: 'green',
        title: 'Rating',
        message: 'Rating submitted',
      });
    }

    setComments(newComment.data);
    reset({ comment: "" });
  }

  return (
    <Box w={"100%"} pt={40}>
      {user && isEnrolled && <form onSubmit={handleSubmit(onSubmit)}>
        <InputLabel>Provide your feed back for this course</InputLabel>
        <Textarea autosize minRows={1} maxRows={3} size="xs" {...register('comment', validationOptions.comment)} placeholder="Use @username to tag" />
        {errors.comment && (
          <Text size="sm" c={'red'}>
            {errors.comment.message}
          </Text>
        )}
        <Flex justify={"end"} gap={8}>
          {mode === "edit" && (
            <Button bg={"#fe4a55"} type="button" mt="5" size='sm' onClick={cancelEditMode}>
              Cancel
            </Button>
          )}
          <Button disabled={!!errors?.comment?.message} type="submit" mt="5" size='sm'>
            {mode === "create" ? "Submit" : "Edit"}
          </Button>
        </Flex>
      </form>}
    </Box>
  )
}

export default CreateReviewComment