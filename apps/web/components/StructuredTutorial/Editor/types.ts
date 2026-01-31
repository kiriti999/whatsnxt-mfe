export type NodeType = 'tutorial' | 'section' | 'post';

export interface TreeNode {
    id: string;
    type: NodeType;
    title: string;
    children?: TreeNode[];
    isExpanded?: boolean;
    hasUnsavedChanges?: boolean;
    isReused?: boolean;
    order?: number;
}

export interface SelectedNode {
    type: NodeType;
    id: string | null;
    sectionId?: string; // For posts, to know which section they belong to
}

export interface EditorState {
    tutorialId: string | null;
    selectedNode: SelectedNode;
    unsavedChanges: Set<string>;
    expandedNodes: Set<string>;
}

export interface LocalSection {
    id?: string;
    title: string;
    description: string;
    icon: string;
    order?: number;
    posts: LocalPost[];
    isReused?: boolean;
    sourceId?: string;
}

export interface LocalPost {
    id?: string;
    title: string;
    description: string;
    contentFormat?: 'HTML' | 'MARKDOWN';
    order?: number;
    isReused?: boolean;
    sourceId?: string;
}

export interface DragItem {
    id: string;
    type: NodeType;
    index: number;
    sectionId?: string; // For posts
}
