import { useRouter } from "next/navigation";
import { notifications } from "@mantine/notifications";
import { ContentAPI } from "../../../../apps/web/apis/v1/blog/contentApi";

export const useAddComment = ({
  contentId,
  editMode,
  email,
  commentId,
  inputRef,
  handleEditNode,
  handleInsertNode,
  setCommentExpand,
  totalReply,
  reset,
  root
}: any) => {
  const router = useRouter();

  // payload` { contentId, email }
  const onAddComment = async (payload: any) => {
    try {
      if (!email) {
        router.push('/auth/authentication');
        return;
      }
      payload.email = email;
      payload.contentId = contentId;

      if (editMode) {
        payload.commentId = commentId;
        payload.comment = inputRef?.current?.innerText;

        const comment = await ContentAPI.editComment(payload);
        if (comment._id) {
          handleEditNode(commentId, 'name', inputRef?.current?.innerText);
        }
        setCommentExpand(commentId, false, 'E');
      } else {
        payload.parentId = root ? null : commentId;
        payload.content = payload.comment;

        const newComment = await ContentAPI.postComment(payload);
        if (newComment._id) {
          handleInsertNode(commentId, {
            insertedId: newComment._id,
            parents: newComment.parentId || null,
            text: newComment.content,
            email,
            likes: 0,
            dislikes: 0,
            hasLiked: false,
            hasDisliked: false,
            author: email.split('@')[0],
            totalReply: 0
          });

          handleEditNode(commentId, 'totalReply', totalReply + 1);
          setCommentExpand(commentId, false, 'I');
          reset();
        }
      }
    } catch (error) {
      console.log('onAddComment:: error: ', error);
    }
  };

  return onAddComment;
}

export const useEditComment = ({ email, commentId, setCommentExpand, inputRef }: any) => {
  const router = useRouter();

  const onEditComment = async (e: any) => {
    e.preventDefault();
    if (!email) {
      router.push('/auth/authentication');
      return;
    }
    setCommentExpand(commentId, true, 'E');
    // Move the cursor to the end of the comment input
    const editableElement = inputRef?.current;
    if (editableElement) {
      const range = document.createRange();
      const selection = window.getSelection();
      range.selectNodeContents(editableElement);
      range.collapse(false); // Collapse range to the end
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  };

  return onEditComment
}

export const useDeleteComment = ({ email, commentId, handleDeleteNode, contentId }: any) => {
  const router = useRouter();

  const onDeleteComment = async () => {
    if (!email) {
      router.push('/auth/authentication');
      return;
    }
    const response = await ContentAPI.deleteComment({ id: commentId, contentId, email });
    if (response) {
      handleDeleteNode(commentId);
    }
  };

  return onDeleteComment
}

export const getReactionActions = ({ email, handleEditNode, comment, setComments }: any) => {
  const { id } = comment || {};

  const likeComment = async () => {
    if (!email) return;

    // Send like request
    const data = await ContentAPI.likeComment({
      commentId: id,
      email,
    });

    // Use the actual data from the server response instead of trying to calculate
    const newLikes = data.likes;
    const newDislikes = data.dislikes;
    const newHasLiked = data.likedBy && data.likedBy.length > 0;
    const newHasDisliked = data.disLikedBy && data.disLikedBy.length > 0;

    // Update the UI with the actual server values
    handleEditNode(id, 'hasLiked', newHasLiked);
    handleEditNode(id, 'hasDisliked', newHasDisliked);
    handleEditNode(id, 'likes', newLikes);
    handleEditNode(id, 'dislikes', newDislikes);
  };

  const dislikeComment = async () => {
    if (!email) return;

    // Send dislike request
    const data = await ContentAPI.dislikeComment({
      commentId: id,
      email,
    });

    // Use the actual data from the server response
    const newLikes = data.likes;
    const newDislikes = data.dislikes;
    const newHasLiked = data.likedBy && data.likedBy.length > 0;
    const newHasDisliked = data.disLikedBy && data.disLikedBy.length > 0;

    // Update the UI with the actual server values
    handleEditNode(id, 'hasLiked', newHasLiked);
    handleEditNode(id, 'hasDisliked', newHasDisliked);
    handleEditNode(id, 'likes', newLikes);
    handleEditNode(id, 'dislikes', newDislikes);
  };

  const reportComment = async () => {
    if (!email) return;

    try {
      const { data, errors } = await ContentAPI.flagComment({ id, email });
      if (errors) {
        throw new Error(errors[0].message);
      }

      if (data) {
        const { _id, flags, hasFlagged } = data; // Use hasFlagged from server response

        setComments((prev: { items: any; }) => {
          let updatedItems = prev.items;

          // Remove comment from comments state if flags count is 5 or more 
          if (flags >= 5) {
            updatedItems = updatedItems.filter((item: { id: any; }) => item.id !== _id);
          } else {
            // Update the comment's flagged status
            updatedItems = updatedItems.map((item: { id: any; hasFlagged: boolean; }) => {
              if (item.id === _id) {
                item.hasFlagged = hasFlagged; // Use server response instead of checking array
              }
              return item;
            });
          }

          return { ...prev, items: updatedItems };
        });
      }

      notifications.show({
        position: 'bottom-right',
        title: 'Comment flagged',
        message: 'Comment has been reported',
        color: 'green',
      });
    } catch (error: any) {
      console.log('reportComment :: error:', error.message)
      notifications.show({
        position: 'bottom-right',
        title: 'Comment not flagged',
        message: `${error.message}` || 'Comment report has been failed',
        color: 'red',
      });
    }
  }

  return { likeComment, dislikeComment, reportComment }
}
