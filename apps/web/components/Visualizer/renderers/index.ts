"use client";

import type { FC } from "react";
import type { DiagramData } from "../types";
import { ArchitectureRenderer } from "./ArchitectureRenderer";
import { CheatSheetRenderer } from "./CheatSheetRenderer";
import { ComparisonGridRenderer } from "./ComparisonGridRenderer";
import { ConceptExplainerRenderer } from "./ConceptExplainerRenderer";
import { FlowDiagramRenderer } from "./FlowDiagramRenderer";
import { MatrixTableRenderer } from "./MatrixTableRenderer";
import { MindMapRenderer } from "./MindMapRenderer";
import { PatternCatalogRenderer } from "./PatternCatalogRenderer";
import { StepContentRenderer } from "./StepContentRenderer";
import { TimelineRenderer } from "./TimelineRenderer";

export type RendererComponent = FC<{
	data: DiagramData;
	width: number;
	height: number;
}>;

/**
 * Diagram type → D3 renderer. Several types reuse the closest layout engine; keep
 * `DiagramTypePicker` previews and `getDiagramPrompt` in BFF aligned with these choices.
 */
const rendererMap: Record<string, RendererComponent> = {
	"step-content": StepContentRenderer,
	"flow-diagram": FlowDiagramRenderer,
	architecture: ArchitectureRenderer,
	"comparison-grid": ComparisonGridRenderer,
	"concept-explainer": ConceptExplainerRenderer,
	"pattern-catalog": PatternCatalogRenderer,
	"cheat-sheet": CheatSheetRenderer,
	timeline: TimelineRenderer,
	"mind-map": MindMapRenderer,
	"matrix-table": MatrixTableRenderer,
	/** Tree of decisions — same node/edge model as flow, vertical layout from AI. */
	"decision-tree": FlowDiagramRenderer,
	/** Org / taxonomy — radial tree layout from edges. */
	"hierarchy-chart": MindMapRenderer,
	/** Lifelines + messages — flow layout from AI. */
	"sequence-diagram": FlowDiagramRenderer,
	/** Columns of cards — grid catalog layout. */
	"kanban-board": PatternCatalogRenderer,
	/** Four quadrants — comparison-style grid. */
	"swot-analysis": ComparisonGridRenderer,
	/** Routers, links — layered/hub architecture styling. */
	"network-topology": ArchitectureRenderer,
	"hub-spoke-reference": ConceptExplainerRenderer,
	"vertical-layer-stack": StepContentRenderer,
	"microservices-field-guide": MindMapRenderer,
	"radial-domain-map": MindMapRenderer,
	"sectioned-playbook": CheatSheetRenderer,
	"parallel-pipelines": FlowDiagramRenderer,
	/** Tiered rows render better as grouped category sections. */
	"tier-list-ranking": CheatSheetRenderer,
	"poster-blueprint": ArchitectureRenderer,
	"numbered-pattern-sheet": PatternCatalogRenderer,
};

export function getRenderer(diagramType: string): RendererComponent {
	return rendererMap[diagramType] || StepContentRenderer;
}
