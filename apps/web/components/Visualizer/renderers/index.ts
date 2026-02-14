'use client';

import React from 'react';
import type { DiagramData } from '../types';
import { ArchitectureRenderer } from './ArchitectureRenderer';
import { ComparisonGridRenderer } from './ComparisonGridRenderer';
import { ConceptExplainerRenderer } from './ConceptExplainerRenderer';
import { PatternCatalogRenderer } from './PatternCatalogRenderer';
import { StepContentRenderer } from './StepContentRenderer';
import { FlowDiagramRenderer } from './FlowDiagramRenderer';

export type RendererComponent = React.FC<{ data: DiagramData; width: number; height: number }>;

const rendererMap: Record<string, RendererComponent> = {
    'step-content': StepContentRenderer,
    'flow-diagram': FlowDiagramRenderer,
    'architecture': ArchitectureRenderer,
    'comparison-grid': ComparisonGridRenderer,
    'concept-explainer': ConceptExplainerRenderer,
    'pattern-catalog': PatternCatalogRenderer,
};

export function getRenderer(diagramType: string): RendererComponent {
    return rendererMap[diagramType] || StepContentRenderer;
}
