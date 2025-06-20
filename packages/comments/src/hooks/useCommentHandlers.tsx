import { useCallback, useEffect } from "react";
import useNode from "./useNode";
import { CommentAPI } from '../../../../apps/web/apis/v1/comment';
import useAuth from '../../../../apps/web/hooks/Authentication/useAuth';

const useCommentHandlers = ({ lessonId, comments, setComments }: any) => {
    const { user } = useAuth();
    const userId = user?._id;

    const { insertNode, editNode, deleteNode } = useNode();

    const handleInsertNode = (folderId: any, item: any) => {
        const finalStructure = insertNode(comments, folderId, item);
        setComments(finalStructure);
    };

    const handleEditNode = (folderId: any, name: string, value: any) => {
        const finalStructure = editNode(comments, folderId, name, value);
        setComments(finalStructure);
    };

    const handleDeleteNode = (folderId: any) => {
        const finalStructure = deleteNode(comments, folderId);
        const temp = { ...finalStructure };
        setComments(temp);
    };

    const handleComments = useCallback(
        async (
            parents: string[] | string | null,
            offset: number,
            limit: number,
        ) => {
            const isRoot = Array.isArray(parents);
            const parentId = isRoot ? parents.at(-1) : 1;

            const commentsSet = await CommentAPI.getLessonComments({
                limit, offset, lessonId
            });

            setComments((prev: any) => {
                let nodes = { ...prev };
                for (let i = 0; i < commentsSet.length; i++) {
                    const comment = commentsSet[i];
                    const hasLiked = comment.likedBy.includes(userId);
                    const hasDisliked = comment.disLikedBy.includes(userId);
                    // const hasFlagged = comment.flaggedBy.includes(userId);

                    nodes = insertNode(nodes, parentId, {
                        insertedId: comment._id,
                        text: comment.content,
                        email: comment.email,
                        parents: comment.parentId,
                        items: comment.transformedSubItems || [],
                        likes: comment.likes,
                        dislikes: comment.dislikes,
                        hasLiked,
                        hasDisliked,
                        // hasFlagged,
                        author: comment.author,
                        updatedAt: comment.updatedAt,
                        totalReply: comment.childCount ?? 0,
                    });
                }

                return nodes;
            });
            return commentsSet;
        },
        [insertNode]
    );

    const handleSubComment = async ({
        parentId,
        offset,
        limit,
    }: any) => {
        try {
            const commentsSet = await CommentAPI.getLessonComments({
                lessonId, parentId, offset, limit
            });

            // Transform the fetched comments
            const transformedSubItems = commentsSet.map((item: any) => {
                const hasLiked = item.likedBy.includes(userId);
                const hasDisliked = item.disLikedBy.includes(userId);
                // const hasFlagged = item.flaggedBy.includes(userId);

                return ({
                    commentId: item._id,
                    id: item._id,
                    name: item.content,
                    email: item.email,
                    userId: item.author,
                    parents: item.parentId,
                    likes: item.likes,
                    dislikes: item.dislikes,
                    hasLiked,
                    hasDisliked,
                    // hasFlagged,
                    updatedAt: item.updatedAt,
                    author: item.author,
                    created_at: item.created_at,
                    totalReply: item.childCount ?? 0,
                })
            }
            );

            // Recursive function to update items based on parentId and depth limit
            const updateNestedComments = (commentsList: any, level = 1) => {
                return commentsList.map((item: any) => {
                    const isMatch =
                        (item.id === parentId || item.parents === parentId) &&
                        (item.items?.length === 0 || !item.items) &&
                        item.totalReply > 0;

                    if (isMatch) {
                        // Filter out duplicates by checking if the item already exists in items
                        const existingIds = new Set(item.items?.map((subItem: any) => subItem.id));
                        const newItems = transformedSubItems.filter((subItem: any) => !existingIds.has(subItem.id));

                        // Update only if there are new items to add
                        return { ...item, items: [...(item.items || []), ...newItems] };
                    } else if (item.items && item.items.length > 0 && level < 5) {
                        // If not a match but items exist, recursively check nested items
                        return {
                            ...item,
                            items: updateNestedComments(item.items, level + 1),
                        };
                    }

                    return item;  // Return item unchanged if no updates are needed
                });
            };

            // Call recursive function on the top-level comments
            const updatedComments = updateNestedComments(comments?.items || []);

            setComments({ ...comments, items: updatedComments });
            return updatedComments;
        } catch (error) {
            console.error("Error in handleSubComment:", error);
            throw error;
        }
    };

    useEffect(() => {
        if (lessonId) {
            handleComments(null, 0, 5);
        }
    }, [lessonId]);

    return { handleInsertNode, handleEditNode, handleDeleteNode, handleComments, handleSubComment, comment: comments }
};

export default useCommentHandlers;
