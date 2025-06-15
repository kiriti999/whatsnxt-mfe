import { ReactNode, RefObject } from 'react';


export interface CommentConnectorProps {
    commentId: number;
    commentItems: any;
    connectorElementRef: RefObject<HTMLDivElement>;
    name: string;
    children: ReactNode;
}


export interface CommentContainerProps {
    commentHeight: number;
    commentId: number;
    children?: React.ReactNode;
    isMobile?: boolean;
}