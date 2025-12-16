import { useCallback, useEffect } from "react";
import useNode from "./useNode";
import { ContentAPI } from "../../../../apps/web/apis/v1/blog/contentApi";
import useAuth from '../../../../apps/web/hooks/Authentication/useAuth';

async function fetchComments(
    contentId: string,
    parentId: string[] | string | null,
    offset: number,
    limit: number,
) {
    const data = await ContentAPI.getComments({
        contentId,
        parentId,
        offset,
        limit,
    });
    return data;
}

const useCommentHandlers = ({ contentId, comments, setComments }: any) => {
    const { user } = useAuth();
    const email = user?.email;

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
            contentId: string,
            parents: string[] | string | null,
            offset: number,
            limit: number,
            email: string
        ) => {
            const isRoot = Array.isArray(parents);
            const parentId = isRoot ? parents.at(-1) : 1;

            let commentsSet = await fetchComments(
                contentId,
                parents,
                offset,
                limit,
            );
            setComments((prev: any) => {
                let nodes = { ...prev };
                for (let i = 0; i < commentsSet.length; i++) {
                    const comment = commentsSet[i];
                    const hasLiked = comment.likedBy.includes(email);
                    const hasDisliked = comment.disLikedBy.includes(email);
                    const hasFlagged = comment.flaggedBy.includes(email);

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
                        hasFlagged,
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

    const handleSubComment = async (
        contentId: string,
        parentId: string | string[] | null,
        offset: number,
        limit: number,
        email: any
    ) => {
        try {
            const commentsSet = await fetchComments(contentId, parentId, offset, limit);

            // Transform the fetched comments
            const transformedSubItems = commentsSet.map((item: { likedBy: string | any[]; disLikedBy: string | any[]; flaggedBy: string | any[]; _id: any; content: any; email: any; parentId: any; likes: any; dislikes: any; updatedAt: any; author: any; createdAt: any; childCount: any; }) => {
                const hasLiked = item.likedBy.includes(email);
                const hasDisliked = item.disLikedBy.includes(email);
                const hasFlagged = item.flaggedBy.includes(email);

                return ({
                    commentId: item._id,
                    id: item._id,
                    name: item.content,
                    email: item.email,
                    parents: item.parentId,
                    likes: item.likes,
                    dislikes: item.dislikes,
                    hasLiked,
                    hasDisliked,
                    hasFlagged,
                    updatedAt: item.updatedAt,
                    author: item.author,
                    createdAt: item.createdAt,
                    totalReply: item.childCount ?? 0,
                })
            }
            );

            // Recursive function to update items based on parentId and depth limit
            const updateNestedComments = (commentsList: any[], level = 1) => {
                return commentsList.map((item: { id: any; parents: any; items: any[]; totalReply: number; }) => {
                    const isMatch =
                        (item.id === parentId || item.parents === parentId) &&
                        (item.items?.length === 0 || !item.items) &&
                        item.totalReply > 0;

                    if (isMatch) {
                        // Filter out duplicates by checking if the item already exists in items
                        const existingIds = new Set(item.items?.map((subItem: { id: any; }) => subItem.id));
                        const newItems = transformedSubItems.filter((subItem: { id: unknown; }) => !existingIds.has(subItem.id));

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
        if (contentId) {
            handleComments(contentId, null, 0, 5, email);
        }
    }, [contentId]);

    return { handleInsertNode, handleEditNode, handleDeleteNode, handleComments, handleSubComment, comment: comments }
};

export default useCommentHandlers;
