import React, { createContext, useContext, useState, useEffect } from 'react';
import type { CommentReplyContextProviderProps, CommentReplyContextValue } from '../types';

// Create the context with a default value
const CommentReplyContext = createContext<CommentReplyContextValue | undefined>(undefined);

// Create the context provider
const CommentReplyContextProvider: React.FC<CommentReplyContextProviderProps> = ({ children, comments, handleComments }) => {
    const [initalLoaded, setInitialLoaded] = useState(false)
    const [nestedCommentesLoaded, setNestedCommentesLoaded] = useState(false)

    useEffect(() => {
        if (!initalLoaded && comments.items?.length > 0) {
            setInitialLoaded(true)
            loadNestedFirstLevelComments(comments.items)
        }
    }, [comments])

    const loadNestedFirstLevelComments = async (commentList: any) => {
        commentList.forEach(async (comment: any) => {
            if (comment.parents?.length > 0) {
                await handleComments(comment.parents, 0, 2)
                    .then(async (commentNested) => {
                        if (commentNested.length > 0) {
                            await loadNestedFirstLevelComments(commentNested)
                            // const firstElementParents = commentNested[0]?.parents;
                            // if (firstElementParents && firstElementParents.length > 0) {
                            //     await handleComments(blogId, firstElementParents, 0, 2, userId);
                            // }
                        }
                    }).then(() => {
                        setNestedCommentesLoaded(true)
                    });
            }
        });
    }

    return (
        <CommentReplyContext.Provider value={{ nestedCommentesLoaded }}>
            {children}
        </CommentReplyContext.Provider>
    );
};

const useNestedCommentLoadTracker = (): boolean => {
    const context = useContext(CommentReplyContext);
    if (context === undefined) {
        throw new Error('useNestedCommentLoadTracker must be used within a CommentReplyContextProvider');
    }
    return context.nestedCommentesLoaded;
};

export { CommentReplyContext, CommentReplyContextProvider, useNestedCommentLoadTracker };
