import { useState } from "react";
import { Title } from "@mantine/core";
import { Comment, CommentContextProvider, CommentReplyContextProvider } from '@whatsnxt/comments';
import type { Comments } from "@whatsnxt/comments/src/types";
import useCommentHandlers from '@whatsnxt/comments/src/hooks/useCommentHandlers';
import useAuth from "../../hooks/Authentication/useAuth";

const Discussion = ({ lessonId }) => {
	const { user } = useAuth();
	const [comments, setComments] = useState<Comments>({
		id: 1,
		items: [],
	});

	const {
		handleInsertNode,
		handleEditNode,
		handleDeleteNode,
		handleComments,
		handleSubComment
	} = useCommentHandlers({
		lessonId,
		comments,
		setComments
	});

	return (
		<>
			<Title order={3}>Lesson discussion</Title>
			<CommentReplyContextProvider handleComments={handleComments} comments={comments}>
				<CommentContextProvider>
					<Comment
						email={user?.email}
						userId={user?._id}
						userName={user?.name}
						comment={comments}
						root
						rootDepth={1}
						lessonId={lessonId}
						handleInsertNode={handleInsertNode}
						handleEditNode={handleEditNode}
						handleDeleteNode={handleDeleteNode}
						handleComments={handleComments}
						handleSubComment={handleSubComment}
					/>
				</CommentContextProvider>
			</CommentReplyContextProvider>
		</>
	)
}

export default Discussion;
