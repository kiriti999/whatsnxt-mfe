/**
 * Shared utilities for AI-powered architectural diagram generation.
 * Extracted from the lab page editor for reuse in LearningMaterialEditor and similar contexts.
 */

import { getArchitectureShapes } from "./shape-libraries";
import { genericD3Shapes } from "./shape-libraries/generic-d3-shapes";

/** Minimal interface covering properties shared across all shape definition types. */
interface ShapeEntry {
    id: string;
    name: string;
    type?: string;
    width?: number;
    height?: number;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    rx?: number;
    strokeDashArray?: string;
    pathData?: string;
}

/** Intermediate parsed shape from an AI response. */
interface AIParsedNode {
    id?: string;
    shapeId?: string;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    label?: string;
}

/** Intermediate parsed link from an AI response. */
interface AIParsedLink {
    source: string;
    target: string;
    sourceEdge?: string;
    targetEdge?: string;
    waypoints?: { x: number; y: number }[];
}

/** Rendered diagram node format consumed by DiagramEditor. */
export interface DiagramNode {
    id: string;
    x: number;
    y: number;
    type: string;
    label: string;
    width: number;
    height: number;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    rx?: number;
    strokeDashArray?: string;
    pathData?: string;
    shapeId?: string;
}

/** Rendered diagram link format consumed by DiagramEditor. */
export interface DiagramLink {
    source: string;
    target: string;
    sourceEdge?: string;
    targetEdge?: string;
    waypoints?: { x: number; y: number }[];
}

/** Full diagram state passed to/from DiagramEditor via initialGraph / onGraphChange. */
export interface DiagramState {
    nodes: DiagramNode[];
    links: DiagramLink[];
}

/**
 * Build a prompt for the AI to generate architecture diagram JSON.
 * The prompt includes available shape types so the AI uses valid shape IDs.
 */
export const buildDiagramAIPrompt = (
    userPrompt: string,
    archType: string,
    additionalTypes: string[] = [],
): string => {
    const allTypes = [archType, ...additionalTypes];
    const archShapes = allTypes.flatMap((t) =>
        getArchitectureShapes(t),
    ) as ShapeEntry[];
    const commonShapes = Object.values(genericD3Shapes) as ShapeEntry[];

    const archShapeList = archShapes.map((s) => `${s.id} (${s.name})`).join(", ");
    const commonShapeList = commonShapes
        .map((s) => `${s.id} (${s.name})`)
        .join(", ");

    return `You are an architecture diagram generator. Generate a clear, logical diagram as JSON based on the following user prompt.

User prompt: "${userPrompt}"
Architecture type: ${archType}

Available architecture-specific shapes (use these shape IDs for the "shapeId" field):
${archShapeList || "None available"}

Available common shapes:
${commonShapeList}

CRITICAL RULES FOR CLARITY:
1. Respond ONLY with valid JSON, no markdown, no explanation.
2. Use the exact shape IDs listed above.
3. Create a CLEAR FLOW - avoid creating multiple overlapping connections between the same components.
4. LIMIT connections - each node should have 1-3 connections maximum, not connected to everything.
5. Follow logical patterns based on diagram type:
   - For lifecycle/flow diagrams: Create a linear or tree-like flow (A→B→C→D)
   - For architecture diagrams: Use hub-and-spoke or layered patterns
   - For process diagrams: Show clear sequential steps
6. Use containers (common-container/common-group) to group related components logically.
7. Position nodes in organized rows/columns - containers should be large (width: 400+, height: 300+).
8. SPACING: Keep nodes at least 120-150px apart (center to center) to ensure arrows are clearly visible.
9. AVOID creating bidirectional arrows or multiple arrows between same nodes unless absolutely necessary.
10. Think about the domain - for example:
   - Kubernetes: API Server is the hub, other components connect through it
   - Web apps: Client → Load Balancer → App Servers → Database (layers)
   - CI/CD: Sequential pipeline stages
11. Each link should have a clear purpose - don't connect everything to everything.

JSON format:
{
  "nodes": [
    {
      "id": "unique-id-1",
      "shapeId": "<shape-id-from-above>",
      "x": 100,
      "y": 100,
      "width": 60,
      "height": 60,
      "label": "My Component"
    }
  ],
  "links": [
    {
      "source": "unique-id-1",
      "target": "unique-id-2",
      "sourceEdge": "right",
      "targetEdge": "left"
    }
  ]
}

ARROW ROUTING RULES (CRITICAL for clean diagrams):
12. Specify sourceEdge and targetEdge for each link to control which side of shapes arrows connect to.
13. Choose edges that create clean, non-overlapping paths.
14. For left-to-right flows: use sourceEdge="right" and targetEdge="left"
15. For top-to-bottom flows: use sourceEdge="bottom" and targetEdge="top"
16. When a node is above another, connect from bottom to top. When beside, connect from side to side.

CONTAINER BOUNDARY RULES:
17. Arrows should NEVER route through container borders.
18. If connecting to a node inside a container from outside: position the source node near the container's entry point.
19. Avoid horizontal/diagonal arrows that cut through container borders.

Generate a professional, well-organized architecture diagram with 6-12 nodes and MINIMAL, LOGICAL connections that tell a clear story.`;
};

/**
 * Spread nodes apart so no two bounding boxes are closer than MIN_NODE_GAP pixels.
 * Runs iteratively until stable or max iterations reached.
 */
export const enforceMinimumSpacing = (nodes: DiagramNode[]): DiagramNode[] => {
    const MIN_NODE_GAP = 30;
    const MAX_ITERATIONS = 10;
    const result = nodes.map((n) => ({ ...n }));

    for (let iter = 0; iter < MAX_ITERATIONS; iter++) {
        let moved = false;
        for (let i = 0; i < result.length; i++) {
            for (let j = i + 1; j < result.length; j++) {
                const a = result[i];
                const b = result[j];
                const aRight = a.x + a.width;
                const aBottom = a.y + a.height;
                const bRight = b.x + b.width;
                const bBottom = b.y + b.height;

                const gapX = b.x > a.x ? b.x - aRight : a.x - bRight;
                const gapY = b.y > a.y ? b.y - aBottom : a.y - bBottom;

                const tooClose =
                    b.x - a.x < a.width + MIN_NODE_GAP &&
                    b.y - a.y < a.height + MIN_NODE_GAP &&
                    a.x - b.x < b.width + MIN_NODE_GAP &&
                    a.y - b.y < b.height + MIN_NODE_GAP;

                if (!tooClose) continue;

                const pushX = MIN_NODE_GAP - gapX;
                const pushY = MIN_NODE_GAP - gapY;

                if (pushX < pushY) {
                    const half = pushX / 2;
                    if (b.x >= a.x) {
                        b.x += half;
                        a.x -= half;
                    } else {
                        a.x += half;
                        b.x -= half;
                    }
                } else {
                    const half = pushY / 2;
                    if (b.y >= a.y) {
                        b.y += half;
                        a.y -= half;
                    } else {
                        a.y += half;
                        b.y -= half;
                    }
                }
                moved = true;
            }
        }
        if (!moved) break;
    }
    return result;
};

/**
 * Parse raw AI text response into diagram state {nodes, links}.
 * The AI response should be JSON but may be wrapped in markdown code fences.
 */
export const parseAIDiagramResponse = (
    rawResponse: string,
    archType: string,
): DiagramState | null => {
    try {
        let jsonStr = rawResponse.trim();
        if (jsonStr.startsWith("```")) {
            jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
        }

        const parsed = JSON.parse(jsonStr) as Record<string, unknown>;
        if (!parsed.nodes || !Array.isArray(parsed.nodes)) return null;

        const archShapes = getArchitectureShapes(archType) as ShapeEntry[];
        const commonShapes = Object.values(genericD3Shapes) as ShapeEntry[];
        const allShapes = [...archShapes, ...commonShapes];

        const nodes: DiagramNode[] = (parsed.nodes as AIParsedNode[]).map(
            (aiNode) => {
                const shapeDef = allShapes.find(
                    (s) =>
                        s.id === aiNode.shapeId || s.type === aiNode.shapeId?.toLowerCase(),
                );

                return {
                    id:
                        aiNode.id ??
                        `${Date.now()}${Math.random().toString(36).substr(2, 5)}`,
                    x: aiNode.x ?? 50 + Math.random() * 400,
                    y: aiNode.y ?? 50 + Math.random() * 400,
                    type: shapeDef?.type ?? "rect",
                    label: aiNode.label ?? shapeDef?.name ?? "Node",
                    width: aiNode.width ?? shapeDef?.width ?? 60,
                    height: aiNode.height ?? shapeDef?.height ?? 60,
                    fill: shapeDef?.fill,
                    stroke: shapeDef?.stroke,
                    strokeWidth: shapeDef?.strokeWidth,
                    rx: shapeDef?.rx,
                    strokeDashArray: shapeDef?.strokeDashArray,
                    pathData: shapeDef?.pathData,
                    shapeId: aiNode.shapeId,
                };
            },
        );

        const links: DiagramLink[] = Array.isArray(parsed.links)
            ? (parsed.links as AIParsedLink[]).map((aiLink) => ({
                source: aiLink.source,
                target: aiLink.target,
                sourceEdge: aiLink.sourceEdge,
                targetEdge: aiLink.targetEdge,
                waypoints: aiLink.waypoints ?? [],
            }))
            : [];

        return { nodes: enforceMinimumSpacing(nodes), links };
    } catch {
        return null;
    }
};
