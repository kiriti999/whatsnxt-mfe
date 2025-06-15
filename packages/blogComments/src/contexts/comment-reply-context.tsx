import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

// Define the shape of the context value
interface CommentReplyContextValue {
    nestedCommentesLoaded: boolean;
}

interface Comment {
    parents: string[];
    [key: string]: any;
}

interface Comments {
    items: Comment[];
}

interface CommentReplyContextProviderProps {
    children: ReactNode;
    comments: Comments;
    handleComments: (contentId: string, parents: string[], start: number, limit: number, email: string) => Promise<Comment[]>;
    // handleComments: (parents: string[] | string | null, offset: number, limit: number) => Promise<any>;
    contentId: string;
    email: string;
}
// Create the context with a default value
const CommentReplyContext = createContext<CommentReplyContextValue | undefined>(undefined);

// Create the context provider
// Todo: check this Provider, and remove unnecessary codes
const CommentReplyContextProvider: React.FC<CommentReplyContextProviderProps> = ({ children, comments, handleComments, contentId, email }) => {
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
                await handleComments(contentId, comment.parents, 0, 2, email).then(async (commentNested) => {
                    if (commentNested.length > 0) {
                        await loadNestedFirstLevelComments(commentNested)
                        // const firstElementParents = commentNested[0]?.parents;
                        // if (firstElementParents && firstElementParents.length > 0) {
                        //     await handleComments(contentId, firstElementParents, 0, 2, email);
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
