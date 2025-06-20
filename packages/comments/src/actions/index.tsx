import { useRouter } from 'next/navigation';
import { CommentAPI } from '../../../../apps/web/apis/v1/comment';

export const useAddComment = ({
  lessonId,
  editMode,
  email,
  commentId,
  userId,
  inputRef,
  handleEditNode,
  handleInsertNode,
  setCommentExpand,
  totalReply,
  reset,
  root
}) => {
  const router = useRouter();

  const onAddComment = async (payload: any) => {
    try {
      if (!email) {
        router.push('/auth/authentication');
        return;
      }

      if (editMode) {
        payload.commentId = commentId;
        payload.content = inputRef?.current?.innerText;

        const comment = await CommentAPI.updateComment(payload);
        if (comment._id) {
          handleEditNode(commentId, 'name', inputRef?.current?.innerText);
        }
        setCommentExpand(commentId, false, 'E');
      } else {
        payload.content = payload.comment;
        payload.author = userId;
        payload.email = email;
        payload.parentId = root ? null : commentId;
        payload.lessonId = lessonId;

        if (lessonId) {
          const newComment = await CommentAPI.create(payload);

          if (newComment._id) {
            handleInsertNode(commentId, {
              insertedId: newComment._id,
              parents: newComment.parentId || null,
              text: newComment.content,
              userId,
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
      }
    } catch (error) {
      console.log('onAddComment:: error: ', error);
    }
  };

  return onAddComment;
}

export const useEditComment = ({ email, commentId, setCommentExpand, inputRef }) => {
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

export const useDeleteComment = ({ email, handleDeleteNode, commentId }) => {
  const router = useRouter();

  const onDeleteComment = async () => {
    if (!email) {
      router.push('/auth/authentication');
      return;
    }
    const response = await CommentAPI.deleteComment({ commentId });
    if (response) {
      handleDeleteNode(commentId);
    }
  };

  return onDeleteComment
}

export const getReactionActions = ({ userId, handleEditNode, comment }) => {
  const { id, hasLiked, hasDisliked, likes, dislikes } = comment || {};

  const likeComment = async () => {
    if (!userId) return;

    // Send like request
    const { data } = await CommentAPI.toggleLike({
      id,
      userId,
    });
    const hasLiked = data.likedBy.includes(userId);

    // Toggle like state and handle dislike state
    handleEditNode(id, 'hasLiked', hasLiked);
    handleEditNode(id, 'hasDisliked', false);

    // Update like count and adjust dislike count if needed
    handleEditNode(id, 'likes', hasLiked ? likes + 1 : likes - 1);
    handleEditNode(
      id,
      'dislikes',
      hasDisliked ? dislikes - 1 : dislikes
    );
  };

  const dislikeComment = async () => {
    if (!userId) return;

    // Send dislike request
    const { data } = await CommentAPI.toggleDislike({
      id,
      userId,
    });

    const hasDisliked = data.disLikedBy.includes(userId);

    // Toggle dislike state and handle like state
    handleEditNode(id, 'hasLiked', false);
    handleEditNode(id, 'hasDisliked', hasDisliked);

    // Update dislike count and adjust like count if needed
    handleEditNode(id, 'dislikes', hasDisliked ? dislikes + 1 : dislikes - 1);
    handleEditNode(
      id,
      'likes',
      hasLiked ? likes - 1 : likes
    );
  };

  const reportComment = async () => {
    if (!userId) return;

    const data = await CommentAPI.reportComment({ id, userId })

  }

  return { likeComment, dislikeComment, reportComment }
}
