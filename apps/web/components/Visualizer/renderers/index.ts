'use client';

import React from 'react';
import type { DiagramData } from '../types';
import { ArchitectureRenderer } from './ArchitectureRenderer';
import { CheatSheetRenderer } from './CheatSheetRenderer';
import { ComparisonGridRenderer } from './ComparisonGridRenderer';
import { ConceptExplainerRenderer } from './ConceptExplainerRenderer';
import { FlowDiagramRenderer } from './FlowDiagramRenderer';
import { MatrixTableRenderer } from './MatrixTableRenderer';
import { MindMapRenderer } from './MindMapRenderer';
import { PatternCatalogRenderer } from './PatternCatalogRenderer';
import { StepContentRenderer } from './StepContentRenderer';
import { TimelineRenderer } from './TimelineRenderer';

export type RendererComponent = React.FC<{ data: DiagramData; width: number; height: number }>;

const rendererMap: Record<string, RendererComponent> = {
    'step-content': StepContentRenderer,
    'flow-diagram': FlowDiagramRenderer,
    'architecture': ArchitectureRenderer,
    'comparison-grid': ComparisonGridRenderer,
    'concept-explainer': ConceptExplainerRenderer,
    'pattern-catalog': PatternCatalogRenderer,
    'cheat-sheet': CheatSheetRenderer,
    'timeline': TimelineRenderer,
    'mind-map': MindMapRenderer,
    'matrix-table': MatrixTableRenderer,
};

export function getRenderer(diagramType: string): RendererComponent {
    return rendererMap[diagramType] || StepContentRenderer;
}
