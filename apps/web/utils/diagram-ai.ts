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

/** Single validation issue found during diagram review. */
export interface DiagramValidationIssue {
    severity: "error" | "warning" | "info";
    category: string;
    message: string;
    affectedNodes?: string[];
}

/** Result of diagram validation including corrected diagram and issues found. */
export interface DiagramValidationResult {
    diagram: DiagramState;
    issues: DiagramValidationIssue[];
    summary: string;
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
6. CONTAINERS - ONLY use these shape IDs for grouping: common-container, common-group, common-pool
   - NEVER use common-cloud or any other shape as a container - clouds are for decoration only (max 100x70)
   - Child nodes MUST have x/y coordinates that place them INSIDE the container's bounds.
   - e.g. if container is at x:100 y:100 with width:400 height:300, a child should be at x:150 y:160 etc.
7. Position nodes in organized rows/columns - only containers (common-container/common-group/common-pool) should be large (width: 400+, height: 300+).
8. SPACING: Regular (non-container) sibling nodes should be at least 120-150px apart (center to center).
   - Nodes inside the SAME container can be closer, but should not overlap each other.
9. AVOID creating bidirectional arrows or multiple arrows between same nodes unless absolutely necessary.
10. Think about the domain - for example:
   - Kubernetes: Use common-container for namespaces, API Server is the hub
   - Web apps: Client → Load Balancer → App Servers → Database (layers), group servers in a container
   - CI/CD: Sequential pipeline stages
11. Each link should have a clear purpose - don't connect everything to everything.
12. EVERY node MUST have a connection - no orphan/isolated nodes. If a node isn't connected, remove it.

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
      "sourceEdge": "right-center",
      "targetEdge": "left-center"
    }
  ]
}

ARROW ROUTING RULES (CRITICAL for clean diagrams):
12. Each edge has 3 connection points: start (25%), center (50%), end (75%).
    Valid edge values: top-start, top-center, top-end, right-start, right-center, right-end, 
    bottom-start, bottom-center, bottom-end, left-start, left-center, left-end
13. Use different positions on the same edge to avoid overlapping arrows:
    - If two arrows exit from the right side, use right-start for one and right-end for the other.
14. For left-to-right flows: use sourceEdge="right-center" and targetEdge="left-center"
15. For top-to-bottom flows: use sourceEdge="bottom-center" and targetEdge="top-center"
16. When multiple arrows connect to the same edge, spread them across start/center/end positions.

CONTAINER BOUNDARY RULES:
17. Child nodes INSIDE a container should stay within the container's x/y/width/height bounds.
18. Arrows between two nodes that are BOTH inside the same container stay inside — do not route them outside the container.
19. Arrows from a node INSIDE a container to a node OUTSIDE: exit through the nearest container edge and route cleanly outside.
20. Never route an arrow diagonally through the middle of a container that it has no relationship with.

Generate a professional, well-organized architecture diagram with 6-12 nodes and MINIMAL, LOGICAL connections that tell a clear story.`;
};

/**
 * Build the messages array for a second-pass validation call.
 * Pass `builtPrompt` — the already-built string from buildDiagramAIPrompt — as the
 * simulated first user turn, then the AI's JSON response, then the review request.
 */
export const buildDiagramValidationPrompt = (
    builtPrompt: string,
    generatedJSON: string,
): Array<{ role: "user" | "assistant"; content: string }> => [
        {
            role: "user",
            content: builtPrompt,
        },
        {
            role: "assistant",
            content: generatedJSON,
        },
        {
            role: "user",
            content: `You are now a senior solutions architect reviewing the diagram you just generated. Validate it against every item below and return BOTH the corrected JSON AND a list of issues found.

VALIDATION CHECKLIST:
1. ARCHITECTURAL ACCURACY — Does the diagram accurately and completely represent the architecture from the original prompt? Are all critical components present? Is any component that would confuse a student missing or misrepresented?
2. CONTAINER INTEGRITY — For each node with type "container", "group", or "pool": every node logically belonging inside it MUST have x/y coordinates within the container's bounding box (x, y, x+width, y+height). Fix any child node positioned outside its parent container.
3. DEAD REFERENCES — Every link "source" and "target" must match an existing node id. Remove any link with a missing reference.
4. ARROW DIRECTION — Do arrows flow in the direction of actual data/control flow for this architecture? Reverse any that are backwards.
5. REDUNDANT NODES — Remove any duplicate or redundant component that would confuse learners.
6. COMPLETENESS — Add any obviously missing component that is essential for understanding this architecture.
7. NO ORPHAN NODES — Every node MUST have at least one connection (link). Remove any isolated nodes with no incoming or outgoing links.
8. SHAPE SIZE LIMITS — Only "container", "group", or "pool" type nodes can have width > 150 or height > 150. Any other shape type (especially "cloud") MUST be resized to max 100x70. If a cloud was used as a container, replace it with shapeId "common-container".
9. CONTAINER TYPES ONLY — If you see a "cloud" type shape being used to contain other nodes, replace its shapeId with "common-container" and set type to "container".
10. ARROW BOUNDARY RULES — Arrows should NEVER route through container borders. Verify each link connecting nodes inside vs outside containers uses proper edge routing.

Return ONLY valid JSON in this exact format (no markdown, no code fences):
{
  "nodes": [...],
  "links": [...],
  "validationReport": {
    "summary": "Brief 1-2 sentence summary of diagram quality",
    "issues": [
      {
        "severity": "error|warning|info",
        "category": "Category name (e.g., 'Container Integrity', 'Missing Component', 'Arrow Routing')",
        "message": "Description of the issue and what was fixed or still needs attention",
        "affectedNodes": ["node-id-1", "node-id-2"]
      }
    ]
  }
}

- Use "error" severity for issues that would break understanding (missing critical component, broken references)
- Use "warning" severity for layout/routing issues that were auto-fixed
- Use "info" severity for suggestions to improve the diagram
- If no issues found, return empty issues array with summary "Diagram validated successfully"`,
        },
    ];

/**
 * Build a messages array to fix a diagram based on known validation issues.
 * Uses the original user prompt + current diagram JSON + issues list to guide AI correction.
 */
export const buildDiagramIssueFixPrompt = (
    originalUserPrompt: string,
    currentDiagramJSON: string,
    issues: DiagramValidationIssue[],
): Array<{ role: "user" | "assistant"; content: string }> => {
    const issuesList = issues
        .map(
            (i, idx) =>
                `${idx + 1}. [${i.severity.toUpperCase()}] ${i.category}: ${i.message}${i.affectedNodes?.length ? ` (Affected: ${i.affectedNodes.join(", ")})` : ""}`,
        )
        .join("\n");

    return [
        {
            role: "user",
            content: originalUserPrompt,
        },
        {
            role: "assistant",
            content: currentDiagramJSON,
        },
        {
            role: "user",
            content: `The diagram above has the following validation issues that must be fixed:

${issuesList}

Please fix ALL of the above issues in the diagram. Apply these rules:
- For "Missing Component" errors: add the missing node with a valid shapeId from the same architecture type, connect it properly.
- For "Container Integrity" warnings: move any out-of-bounds nodes inside their parent container bounds.
- For "Arrow Routing" warnings: fix sourceEdge/targetEdge so arrows route cleanly without crossing container borders.
- For "Dead References": remove any link whose source or target doesn't exist in the nodes array.
- For "No Orphan Nodes": ensure every node has at least one connection.
- Keep all currently correct nodes and connections unchanged.
- Maintain the same overall layout and architecture intent from the original prompt.

Return ONLY valid JSON in this exact format (no markdown, no code fences):
{
  "nodes": [...],
  "links": [...],
  "validationReport": {
    "summary": "Brief summary of what was fixed",
    "issues": []
  }
}`,
        },
    ];
};

/** Container-type node types that are meant to hold other nodes inside them. */
const CONTAINER_TYPES = new Set(["container", "group", "pool"]);

/** Returns true if node `child` is spatially inside container `parent` (with tolerance). */
const isInsideContainer = (child: DiagramNode, parent: DiagramNode): boolean => {
    if (!CONTAINER_TYPES.has(parent.type)) return false;
    const TOLERANCE = 20;
    return (
        child.x >= parent.x - TOLERANCE &&
        child.y >= parent.y - TOLERANCE &&
        child.x + child.width <= parent.x + parent.width + TOLERANCE &&
        child.y + child.height <= parent.y + parent.height + TOLERANCE
    );
};

/**
 * Spread nodes apart so no two bounding boxes are closer than MIN_NODE_GAP pixels.
 * Container nodes (group/pool/container) are exempt — child nodes inside them are
 * allowed to overlap with the container bounds (they're intentionally nested).
 * Only regular sibling nodes at the same level are pushed apart.
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

                // Skip: one is a container and the other is nested inside it
                if (isInsideContainer(b, a) || isInsideContainer(a, b)) continue;
                // Skip: both are container-type nodes (containers can overlap in layout)
                if (CONTAINER_TYPES.has(a.type) && CONTAINER_TYPES.has(b.type)) continue;
                // Skip: either is a container-type node (don't push containers relative to regular nodes)
                if (CONTAINER_TYPES.has(a.type) || CONTAINER_TYPES.has(b.type)) continue;

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

/**
 * Parse raw AI validation response into diagram state and validation issues.
 * The validation response includes both corrected diagram and a validationReport object.
 */
export const parseAIValidationResponse = (
    rawResponse: string,
    archType: string,
): DiagramValidationResult | null => {
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

        // Extract validation report
        const validationReport = parsed.validationReport as {
            summary?: string;
            issues?: DiagramValidationIssue[];
        } | undefined;

        const VALID_SEVERITIES = new Set(["error", "warning", "info"]);
        const issues: DiagramValidationIssue[] = (validationReport?.issues ?? [])
            .filter((i): i is DiagramValidationIssue => !!i && VALID_SEVERITIES.has(i.severity));
        const summary = validationReport?.summary ?? "Validation completed";

        return {
            diagram: { nodes: enforceMinimumSpacing(nodes), links },
            issues,
            summary,
        };
    } catch {
        return null;
    }
};
