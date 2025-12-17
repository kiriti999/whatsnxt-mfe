const useNode = () => {
    const insertNode = function (tree, commentId, item) {
        const {
            insertedId,
            text,
            userId,
            email,
            parents,
            likes,
            dislikes,
            hasLiked,
            hasDisliked,
            hasFlagged,
            author,
            updatedAt,
            totalReply,
            items
        } = item;

        if (tree.id === commentId) {
            const existingComment = tree.items?.find(
                (comment) => comment.id === insertedId,
            );

            if (existingComment) {
                existingComment.name = text;
                existingComment.userId = userId;
                existingComment.parents = parents;
                existingComment.likes = likes;
                existingComment.dislikes = dislikes;
                existingComment.hasLiked = hasLiked;
                existingComment.hasFlagged = hasFlagged;
                existingComment.hasDisliked = hasDisliked;
                existingComment.author = author;
                existingComment.updatedAt = updatedAt;
                existingComment.totalReply = totalReply;
            } else {
                tree.items?.push({
                    id: insertedId,
                    commentId: insertedId,
                    userId,
                    email,
                    name: text,
                    parents,
                    likes,
                    dislikes,
                    hasLiked,
                    hasDisliked,
                    hasFlagged,
                    items: items || [],
                    author,
                    updatedAt,
                    totalReply
                });
            }

            return tree;
        }

        let latestNode = tree.items?.map((ob) => {
            return insertNode(ob, commentId, item);
        });

        return { ...tree, items: latestNode };
    };

    const editNode = (tree, commentId, name, value) => {
        if (tree.id === commentId) {
            tree[name] = value;
            return tree;
        }

        tree.items?.map((ob) => {
            return editNode(ob, commentId, name, value);
        });

        return { ...tree };
    };

    const deleteNode = (tree, id) => {
        // Use structuredClone to create a deep clone of the tree
        let tempTree = structuredClone(tree);

        const deleteNodeRecursive = (currentTree, nodeId) => {
            for (let i = 0; i < currentTree.items.length; i++) {
                const currentItem = currentTree.items[i];
                if (currentItem.id === nodeId) {
                    currentTree.items.splice(i, 1);
                    currentTree.totalReply = currentTree.totalReply - 1
                    return true;
                } else if (currentItem.items && currentItem.items.length > 0) {
                    if (deleteNodeRecursive(currentItem, nodeId)) {
                        return true;
                    }
                }
            }
            return false;
        };

        deleteNodeRecursive(tempTree, id);
        return tempTree;
    };

    return { insertNode, editNode, deleteNode };
};

export default useNode;
