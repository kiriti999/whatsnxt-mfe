import type { AnimationManifest } from '@whatsnxt/types';

// Diagram Types
export type DiagramType =
    | 'step-content'
    | 'flow-diagram'
    | 'architecture'
    | 'comparison-grid'
    | 'concept-explainer'
    | 'pattern-catalog'
    | 'cheat-sheet'
    | 'timeline'
    | 'mind-map'
    | 'matrix-table'
    | 'decision-tree'
    | 'hierarchy-chart'
    | 'sequence-diagram'
    | 'kanban-board'
    | 'swot-analysis'
    | 'network-topology'
    | 'hub-spoke-reference'
    | 'vertical-layer-stack'
    | 'microservices-field-guide'
    | 'radial-domain-map'
    | 'sectioned-playbook'
    | 'parallel-pipelines'
    | 'tier-list-ranking'
    | 'poster-blueprint'
    | 'numbered-pattern-sheet';

// Diagram Data (returned by AI)
export interface DiagramNode {
    id: string;
    label: string;
    description?: string;
    type: 'card' | 'icon' | 'box' | 'circle' | 'diamond' | 'actor';
    position?: { x: number; y: number };
    size?: { width: number; height: number };
    style: {
        backgroundColor: string;
        borderColor: string;
        textColor: string;
        fontSize?: number;
        borderRadius?: number;
        gradient?: string;
    };
    icon?: string;
    badge?: string;
    badgeColor?: string;
    children?: DiagramNode[];
    /** Optional: `category`, `miniFlow: { boxes: string[] }` for pattern-catalog style cards. */
    metadata?: Record<string, unknown>;
}

export interface DiagramEdge {
    id: string;
    source: string;
    target: string;
    label?: string;
    style: {
        strokeColor: string;
        strokeWidth: number;
        strokeDash?: string;
        arrowHead: boolean;
    };
}

export interface DiagramData {
    title: string;
    subtitle?: string;
    backgroundColor: string;
    nodes: DiagramNode[];
    edges: DiagramEdge[];
    layout: 'grid' | 'horizontal' | 'vertical' | 'radial' | 'free';
    gridColumns?: number;
}

// Options
export interface DiagramOptions {
    theme: string;
    layout: string;
    style: string;
    aiModel?: string;
    modelVersion?: string;
}

// API Payloads
export interface GenerateDiagramPayload {
    diagramType: DiagramType;
    prompt: string;
    options?: Partial<DiagramOptions>;
    aiModel?: string;
    modelVersion?: string;
}

export interface SaveDiagramPayload {
    title: string;
    diagramType: DiagramType;
    prompt: string;
    options?: Partial<DiagramOptions>;
    diagramData: DiagramData;
    svgContent?: string;
    aiModel?: string;
    animationManifest?: AnimationManifest;
}

export interface GenerateDiagramResponse {
    success: boolean;
    data: {
        diagramData: DiagramData;
        aiModel: string;
    };
}

// Diagram Type Card
export interface DiagramTypeOption {
    type: DiagramType;
    title: string;
    description: string;
    icon: string;
    gradient: string;
    color: string;
    /** Optional thumbnail under `/public` (e.g. `/visualizer/diagram-type-previews/foo.png`). */
    previewImage?: string;
}

// Builder Steps
export type BuilderStep = 'select-type' | 'prompt' | 'preview';

// Theme preset
export interface ThemePreset {
    name: string;
    colors: string[];
}
