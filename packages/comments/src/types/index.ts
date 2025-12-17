import type { ReactNode } from "react";

export type CommentType = {
    userId: string,
    email: string,
    userName: string,
    comment: any,
    root?: boolean,
    rootDepth: number,
    lessonId: string,
    handleInsertNode: (folderId: any, item: any) => void,
    handleEditNode: (folderId: any, name: string, value: any) => void,
    handleDeleteNode: (folderId: any) => void,
    handleComments: (parents: string[] | null, offset: number, limit: number) => Promise<any>,
    handleSubComment: ({ parentId, offset, limit, }: {
        parentId: any;
        offset: any;
        limit: any;
    }) => Promise<any>
}

export interface CommentContextValue {
    showInput: { [key: number]: boolean };
    isCollepseOpen: { [key: number]: boolean };
    isEdit: { [key: number]: boolean };
    setCommentExpand: (id: number, value: boolean, type?: 'E' | 'I' | 'O') => void;
    getCommentExpand: (id: number, type?: 'E' | 'I' | 'O') => boolean;
    handleHeightCalculation: () => void
    heightCalculateFlag: boolean
}

export interface CommentReplyContextValue {
    nestedCommentesLoaded: boolean;
}

export interface Comment {
    parents: string[];
    [key: string]: any;
}

export interface Comments {
    id: number;
    items: Comment[];
}

export interface CommentReplyContextProviderProps {
    children: ReactNode;
    comments: Comments;
    handleComments: (parents: string[], start: number, limit: number) => Promise<Comment[]>;
}

export interface CommentContainerProps {
    $commentHeight: number;
    commentId: number;
    isMobile?: boolean;
}

export interface CommentConnectorProps {
    commentId: number;
    commentItems: any; // Replace 'any' with the actual type of commentItems if known
    connectorElementRef: any;
    name: string;
    children: ReactNode;
}
