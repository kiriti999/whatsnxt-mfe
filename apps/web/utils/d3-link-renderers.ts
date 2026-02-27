/**
 * D3 Link (Arrow) Renderers
 *
 * Isolated link/arrow rendering logic for DiagramEditor
 * Includes marker definitions and link path rendering
 */

import * as d3 from "d3";
import type { NodeType } from "./lab-utils";

/**
 * Edge positions for connection points.
 * Each edge has 3 positions: start (25%), center (50%), end (75%)
 * Legacy values (top, right, bottom, left) are aliases for center positions.
 */
export type EdgeSide =
  | "top"
  | "top-start"
  | "top-center"
  | "top-end"
  | "right"
  | "right-start"
  | "right-center"
  | "right-end"
  | "bottom"
  | "bottom-start"
  | "bottom-center"
  | "bottom-end"
  | "left"
  | "left-start"
  | "left-center"
  | "left-end";

export interface LinkType {
  source: string; // Node ID
  target: string; // Node ID
  sourceEdge?: EdgeSide; // Which edge of source to connect from
  targetEdge?: EdgeSide; // Which edge of target to connect to
  waypoints?: { x: number; y: number }[];
}

/**
 * Create arrow marker definitions
 * Must be called once during SVG initialization
 */
export function createArrowMarkers(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  colorScheme: "light" | "dark",
): void {
  // Get or create defs element (don't remove it - shapes might need other defs)
  let defs = svg.select("defs");
  if (defs.empty()) {
    defs = svg.append("defs");
  }

  // Remove only our specific markers and grid pattern to prevent duplicates
  defs.select("#arrow").remove();
  defs.select("#arrow-temp").remove();
  defs.select("#grid").remove();

  // Create the grid pattern
  const pattern = defs
    .append("pattern")
    .attr("id", "grid")
    .attr("width", 20)
    .attr("height", 20)
    .attr("patternUnits", "userSpaceOnUse");

  pattern
    .append("path")
    .attr("d", "M 20 0 L 0 0 0 20")
    .attr("fill", "none")
    .attr("stroke", colorScheme === "dark" ? "#333" : "#e0e0e0")
    .attr("stroke-width", 0.5);

  // Standard arrow marker with larger size for visibility
  defs
    .append("marker")
    .attr("id", "arrow")
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 8)
    .attr("refY", 0)
    .attr("markerWidth", 8)
    .attr("markerHeight", 8)
    // .attr("markerUnits", "userSpaceOnUse")
    // .attr("overflow", "visible")
    .attr("orient", "auto")
    .append("path")
    .attr("d", "M0,-5L10,0L0,5")
    .attr("fill", colorScheme === "dark" ? "#FFF" : "#333");

  // Temporary arrow marker (for drawing new links)
  defs
    .append("marker")
    .attr("id", "arrow-temp")
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 8)
    .attr("refY", 0)
    .attr("markerWidth", 8)
    .attr("markerHeight", 8)
    // .attr("markerUnits", "userSpaceOnUse")
    // .attr("overflow", "visible")
    .attr("orient", "auto")
    .append("path")
    .attr("d", "M0,-5L10,0L0,5")
    .attr("fill", "blue");
}

/**
 * Update arrow marker colors based on color scheme
 */
export function updateArrowMarkerColors(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  colorScheme: "light" | "dark",
): void {
  svg
    .select("#arrow path")
    .attr("fill", colorScheme === "dark" ? "#FFF" : "#333");
}

/**
 * Detect which side (top/right/bottom/left) of fromNode faces toNode.
 */
function detectSide(
  from: NodeType,
  to: NodeType,
): "top" | "right" | "bottom" | "left" {
  const fcx = (from.x || 0) + from.width / 2;
  const fcy = (from.y || 0) + from.height / 2;
  const tcx = (to.x || 0) + to.width / 2;
  const tcy = (to.y || 0) + to.height / 2;
  const dx = tcx - fcx;
  const dy = tcy - fcy;
  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0 ? "right" : "left";
  }
  return dy > 0 ? "bottom" : "top";
}

/**
 * Pre-process links so that multiple arrows sharing the same node + same edge
 * side are spread across the 3 anchor positions (start / center / end).
 * This prevents arrows from merging on the same dot and overlapping.
 */
export function spreadOverlappingEdges(
  links: LinkType[],
  nodes: NodeType[],
): LinkType[] {
  const result: LinkType[] = links.map((l) => ({ ...l }));
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const POSITIONS: ["start", "center", "end"] = ["start", "center", "end"];

  // Compute effective side for each link endpoint
  const effectiveSrcSide: string[] = [];
  const effectiveTgtSide: string[] = [];
  for (const link of result) {
    const src = nodeMap.get(link.source);
    const tgt = nodeMap.get(link.target);
    if (!src || !tgt) {
      effectiveSrcSide.push("right");
      effectiveTgtSide.push("left");
      continue;
    }
    effectiveSrcSide.push(
      link.sourceEdge ? link.sourceEdge.split("-")[0] : detectSide(src, tgt),
    );
    effectiveTgtSide.push(
      link.targetEdge ? link.targetEdge.split("-")[0] : detectSide(tgt, src),
    );
  }

  // Spread source edges: group by sourceNode + side
  const srcGroups = new Map<string, number[]>();
  result.forEach((link, i) => {
    const key = `src:${link.source}:${effectiveSrcSide[i]}`;
    const group = srcGroups.get(key) ?? [];
    group.push(i);
    srcGroups.set(key, group);
  });
  srcGroups.forEach((indices) => {
    if (indices.length <= 1) return;
    const side = effectiveSrcSide[indices[0]];
    indices.forEach((idx, pos) => {
      result[idx].sourceEdge =
        `${side}-${POSITIONS[pos % 3]}` as EdgeSide;
    });
  });

  // Spread target edges: group by targetNode + side
  const tgtGroups = new Map<string, number[]>();
  result.forEach((link, i) => {
    const key = `tgt:${link.target}:${effectiveTgtSide[i]}`;
    const group = tgtGroups.get(key) ?? [];
    group.push(i);
    tgtGroups.set(key, group);
  });
  tgtGroups.forEach((indices) => {
    if (indices.length <= 1) return;
    const side = effectiveTgtSide[indices[0]];
    indices.forEach((idx, pos) => {
      result[idx].targetEdge =
        `${side}-${POSITIONS[pos % 3]}` as EdgeSide;
    });
  });

  return result;
}

/**
 * Calculate waypoint path for links
 * Returns path string and waypoint coordinates
 * @param offset - Perpendicular offset to spread out overlapping arrows (positive = right/down)
 */
export function getWaypointPath(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  waypoints?: { x: number; y: number }[],
  offset = 0,
): { path: string; waypoints: { x: number; y: number }[] } {
  if (!waypoints || waypoints.length === 0) {
    // Determine primary axis to ensure the last path segment
    // has a clear direction for the arrowhead marker
    const dx = Math.abs(x2 - x1);
    const dy = Math.abs(y2 - y1);

    if (dx >= dy) {
      // Primarily horizontal: H → V → H (arrowhead points left/right)
      const midX = (x1 + x2) / 2;
      // Apply perpendicular offset (vertical for horizontal paths)
      return {
        path: `M ${x1} ${y1} L ${midX} ${y1 + offset} L ${midX} ${y2 + offset} L ${x2} ${y2}`,
        waypoints: [
          { x: midX, y: y1 + offset },
          { x: midX, y: y2 + offset },
        ],
      };
    } else {
      // Primarily vertical: V → H → V (arrowhead points up/down)
      const midY = (y1 + y2) / 2;
      // Apply perpendicular offset (horizontal for vertical paths)
      return {
        path: `M ${x1} ${y1} L ${x1 + offset} ${midY} L ${x2 + offset} ${midY} L ${x2} ${y2}`,
        waypoints: [
          { x: x1 + offset, y: midY },
          { x: x2 + offset, y: midY },
        ],
      };
    }
  }

  // Filter out any undefined/null waypoints
  const validWaypoints = waypoints.filter(
    (wp) => wp && typeof wp.x === "number" && typeof wp.y === "number",
  );

  // Build path through waypoints
  let pathD = `M ${x1} ${y1}`;
  validWaypoints.forEach((wp) => {
    pathD += ` L ${wp.x} ${wp.y}`;
  });
  pathD += ` L ${x2} ${y2}`;

  return { path: pathD, waypoints: validWaypoints };
}

// Connection point is placed exactly on the shape edge.
// The SVG arrowhead marker (refX=10) puts the tip precisely at the path endpoint.

/**
 * Position ratios for 12-anchor system: start=25%, center=50%, end=75%
 */
const ANCHOR_START = 0.25;
const ANCHOR_CENTER = 0.5;
const ANCHOR_END = 0.75;

/**
 * Build all 12 anchor positions for a given node rectangle.
 */
function getAll12Anchors(
  nodeX: number,
  nodeY: number,
  nodeW: number,
  nodeH: number,
): { edge: EdgeSide; x: number; y: number }[] {
  return [
    { edge: "top-start", x: nodeX + nodeW * ANCHOR_START, y: nodeY },
    { edge: "top-center", x: nodeX + nodeW * ANCHOR_CENTER, y: nodeY },
    { edge: "top-end", x: nodeX + nodeW * ANCHOR_END, y: nodeY },
    { edge: "right-start", x: nodeX + nodeW, y: nodeY + nodeH * ANCHOR_START },
    { edge: "right-center", x: nodeX + nodeW, y: nodeY + nodeH * ANCHOR_CENTER },
    { edge: "right-end", x: nodeX + nodeW, y: nodeY + nodeH * ANCHOR_END },
    { edge: "bottom-start", x: nodeX + nodeW * ANCHOR_START, y: nodeY + nodeH },
    { edge: "bottom-center", x: nodeX + nodeW * ANCHOR_CENTER, y: nodeY + nodeH },
    { edge: "bottom-end", x: nodeX + nodeW * ANCHOR_END, y: nodeY + nodeH },
    { edge: "left-start", x: nodeX, y: nodeY + nodeH * ANCHOR_START },
    { edge: "left-center", x: nodeX, y: nodeY + nodeH * ANCHOR_CENTER },
    { edge: "left-end", x: nodeX, y: nodeY + nodeH * ANCHOR_END },
  ];
}

/**
 * Find the closest of all 12 anchor positions to a given point.
 * Considers all 12 dots instead of just 4 center positions.
 * If isTargetNode is true, nudges the final point outward for arrowhead visibility.
 */
function getRectEdgePoint(
  nodeX: number,
  nodeY: number,
  nodeW: number,
  nodeH: number,
  targetX: number,
  targetY: number,
  isTargetNode = false,
): { x: number; y: number } {
  const anchors = getAll12Anchors(nodeX, nodeY, nodeW, nodeH);

  let closest = anchors[0];
  let minDist = Number.MAX_VALUE;
  for (const a of anchors) {
    const dist = (targetX - a.x) ** 2 + (targetY - a.y) ** 2;
    if (dist < minDist) {
      minDist = dist;
      closest = a;
    }
  }

  const handlePos = { x: closest.x, y: closest.y };

  if (isTargetNode) {
    const cx = nodeX + nodeW / 2;
    const cy = nodeY + nodeH / 2;
    const dx = targetX - cx;
    const dy = targetY - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 0) {
      const nudge = 8;
      handlePos.x += (dx / dist) * nudge;
      handlePos.y += (dy / dist) * nudge;
    }
  }

  return handlePos;
}

/**
 * Get the exact position of link handle on a specific edge.
 * These positions match the blue dot handles rendered on shapes.
 * Each edge has 3 positions: start (25%), center (50%), end (75%)
 */
function getEdgeMidpoint(
  nodeX: number,
  nodeY: number,
  nodeW: number,
  nodeH: number,
  edge: EdgeSide,
): { x: number; y: number } {
  switch (edge) {
    // Top edge (horizontal: left to right)
    case "top":
    case "top-center":
      return { x: nodeX + nodeW * ANCHOR_CENTER, y: nodeY };
    case "top-start":
      return { x: nodeX + nodeW * ANCHOR_START, y: nodeY };
    case "top-end":
      return { x: nodeX + nodeW * ANCHOR_END, y: nodeY };

    // Bottom edge (horizontal: left to right)
    case "bottom":
    case "bottom-center":
      return { x: nodeX + nodeW * ANCHOR_CENTER, y: nodeY + nodeH };
    case "bottom-start":
      return { x: nodeX + nodeW * ANCHOR_START, y: nodeY + nodeH };
    case "bottom-end":
      return { x: nodeX + nodeW * ANCHOR_END, y: nodeY + nodeH };

    // Left edge (vertical: top to bottom)
    case "left":
    case "left-center":
      return { x: nodeX, y: nodeY + nodeH * ANCHOR_CENTER };
    case "left-start":
      return { x: nodeX, y: nodeY + nodeH * ANCHOR_START };
    case "left-end":
      return { x: nodeX, y: nodeY + nodeH * ANCHOR_END };

    // Right edge (vertical: top to bottom)
    case "right":
    case "right-center":
      return { x: nodeX + nodeW, y: nodeY + nodeH * ANCHOR_CENTER };
    case "right-start":
      return { x: nodeX + nodeW, y: nodeY + nodeH * ANCHOR_START };
    case "right-end":
      return { x: nodeX + nodeW, y: nodeY + nodeH * ANCHOR_END };
  }
}

/**
 * Calculate SVG polygon points string for an arrowhead triangle.
 * Draws a filled triangle at (endX, endY) pointing from (prevX, prevY) → (endX, endY).
 */
export function getArrowheadPoints(
  endX: number,
  endY: number,
  prevX: number,
  prevY: number,
  size = 10,
): string {
  const angle = Math.atan2(endY - prevY, endX - prevX);
  const halfAngle = Math.PI / 7;
  const lx = endX - size * Math.cos(angle - halfAngle);
  const ly = endY - size * Math.sin(angle - halfAngle);
  const rx = endX - size * Math.cos(angle + halfAngle);
  const ry = endY - size * Math.sin(angle + halfAngle);
  return `${endX},${endY} ${lx},${ly} ${rx},${ry}`;
}

/**
 * Calculate connection points between two nodes.
 * If edge preferences (sourceEdge/targetEdge) are provided, use them.
 * Otherwise fall back to center-to-center ray intersection.
 */
export function calculateConnectionPoints(
  sourceNode: NodeType,
  targetNode: NodeType,
  sourceEdge?: EdgeSide,
  targetEdge?: EdgeSide,
): { x1: number; y1: number; x2: number; y2: number } {
  const sx = sourceNode.x || 0;
  const sy = sourceNode.y || 0;
  const tx = targetNode.x || 0;
  const ty = targetNode.y || 0;

  // Node center coordinates for auto-detecting connection edges
  const tCx = tx + targetNode.width / 2;
  const tCy = ty + targetNode.height / 2;

  let srcPt: { x: number; y: number };
  let tgtPt: { x: number; y: number };

  if (sourceEdge) {
    srcPt = getEdgeMidpoint(
      sx,
      sy,
      sourceNode.width,
      sourceNode.height,
      sourceEdge,
    );
  } else {
    // Auto-detect via ray intersection toward target center
    srcPt = getRectEdgePoint(
      sx,
      sy,
      sourceNode.width,
      sourceNode.height,
      tCx,
      tCy,
      false,
    );
  }

  if (targetEdge) {
    // Place endpoint slightly outside target edge so marker remains visible
    // even when nodes are rendered above links.
    tgtPt = getEdgeMidpoint(
      tx,
      ty,
      targetNode.width,
      targetNode.height,
      targetEdge,
    );
  } else {
    // Auto-detect via ray intersection toward source center
    const sCx = sx + sourceNode.width / 2;
    const sCy = sy + sourceNode.height / 2;
    tgtPt = getRectEdgePoint(
      tx,
      ty,
      targetNode.width,
      targetNode.height,
      sCx,
      sCy,
      true,
    );
  }

  return { x1: srcPt.x, y1: srcPt.y, x2: tgtPt.x, y2: tgtPt.y };
}

/**
 * Render a link (arrow) between two nodes
 */
export function renderLink(
  linkGroup: d3.Selection<SVGGElement, unknown, null, undefined>,
  link: LinkType,
  _linkIndex: number,
  sourceNode: NodeType,
  targetNode: NodeType,
  options: {
    isSelected: boolean;
    colorScheme: "light" | "dark";
    onLinkClick: () => void;
    onDeleteClick: () => void;
    offset?: number; // Optional perpendicular offset to spread overlapping arrows
  },
): {
  linkWrapper: d3.Selection<SVGGElement, unknown, null, undefined>;
  visiblePath: d3.Selection<SVGPathElement, unknown, null, undefined>;
  deleteIcon: d3.Selection<SVGGElement, unknown, null, undefined>;
  pathResult: { path: string; waypoints: { x: number; y: number }[] };
} {
  const {
    isSelected,
    colorScheme,
    onLinkClick,
    onDeleteClick,
    offset = 0,
  } = options;

  // Calculate connection points (using stored edge preferences if available)
  const { x1, y1, x2, y2 } = calculateConnectionPoints(
    sourceNode,
    targetNode,
    link.sourceEdge,
    link.targetEdge,
  );

  // Get path with waypoints (offset spreads parallel overlapping arrows)
  const pathResult = getWaypointPath(x1, y1, x2, y2, link.waypoints, offset);

  // Create link wrapper group
  const lw = linkGroup.append("g").attr("class", "link-wrapper");

  // Visible path with arrow
  const strokeColor = isSelected
    ? "#3498db"
    : colorScheme === "dark"
      ? "#FFF"
      : "#333";

  const vp = lw
    .append("path")
    .attr("d", pathResult.path)
    .attr("class", "visible-path")
    .attr("stroke", strokeColor)
    .attr("stroke-width", isSelected ? 3 : 2)
    .attr("fill", "none");

  // Explicit arrowhead polygon (replaces unreliable SVG marker system)
  const prevPoint =
    pathResult.waypoints.length > 0
      ? pathResult.waypoints[pathResult.waypoints.length - 1]
      : { x: x1, y: y1 };
  const ah = lw
    .append("polygon")
    .attr("points", getArrowheadPoints(x2, y2, prevPoint.x, prevPoint.y))
    .attr("fill", strokeColor)
    .attr("class", "arrow-head");

  // Invisible wider path for easier clicking
  lw.append("path")
    .attr("d", pathResult.path)
    .attr("stroke", "transparent")
    .attr("stroke-width", 20)
    .attr("fill", "none")
    .attr("cursor", "pointer")
    .on("click", (e) => {
      e.stopPropagation();
      onLinkClick();
    });

  // Delete icon position
  const diPos =
    pathResult.waypoints &&
      pathResult.waypoints.length > 0 &&
      pathResult.waypoints[0]
      ? { x: pathResult.waypoints[0].x, y: pathResult.waypoints[0].y - 20 }
      : { x: (x1 + x2) / 2, y: (y1 + y2) / 2 };

  const di = lw
    .append("g")
    .attr("transform", `translate(${diPos.x},${diPos.y})`)
    .attr("cursor", "pointer")
    .style("display", "none")
    .on("click", (e) => {
      e.stopPropagation();
      onDeleteClick();
    });

  di.append("circle").attr("r", 12).attr("fill", "#e74c3c");

  di.append("text")
    .attr("text-anchor", "middle")
    .attr("dy", "0.35em")
    .attr("fill", "white")
    .text("×");

  // Hover effects
  lw.on("mouseenter", () => {
    if (!isSelected) {
      vp.attr("stroke", "#3498db").attr("stroke-width", 3);
      ah.attr("fill", "#3498db");
    }
    di.style("display", "block");
  }).on("mouseleave", () => {
    if (!isSelected) {
      const defaultColor = colorScheme === "dark" ? "#FFF" : "#333";
      vp.attr("stroke", defaultColor).attr("stroke-width", 2);
      ah.attr("fill", defaultColor);
    }
    di.style("display", "none");
  });

  return { linkWrapper: lw, visiblePath: vp, deleteIcon: di, pathResult };
}

/**
 * Render waypoint handles for editing link path
 */
export function renderWaypointHandles(
  linkWrapper: d3.Selection<SVGGElement, unknown, null, undefined>,
  pathResult: { path: string; waypoints: { x: number; y: number }[] },
  visiblePath: d3.Selection<SVGPathElement, unknown, null, undefined>,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  onWaypointDragEnd: (waypointIndex: number, x: number, y: number) => void,
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
): void {
  if (!pathResult.waypoints || pathResult.waypoints.length === 0) return;

  pathResult.waypoints.forEach((wp, wpi) => {
    // Skip undefined waypoints
    if (!wp || typeof wp.x !== "number" || typeof wp.y !== "number") return;

    const cp = linkWrapper
      .append("circle")
      .attr("cx", wp.x)
      .attr("cy", wp.y)
      .attr("r", 7)
      .attr("fill", "#3498db")
      .attr("stroke", "#FFF")
      .attr("stroke-width", 2)
      .attr("cursor", "move");

    const cd = d3
      .drag<SVGCircleElement, unknown>()
      .on("drag", function (e) {
        const [mx, my] = d3.pointer(e, g.node());
        d3.select(this).attr("cx", mx).attr("cy", my);

        // Reconstruct path locally for drag visualization
        let np = `M ${x1} ${y1}`;
        pathResult.waypoints?.forEach((w, wi) => {
          if (!w) return; // Skip undefined waypoints
          if (wi === wpi) {
            np += ` L ${mx} ${my}`;
          } else {
            np += ` L ${w.x} ${w.y}`;
          }
        });
        np += ` L ${x2} ${y2}`;

        visiblePath.attr("d", np);
        linkWrapper.select('path[stroke="transparent"]').attr("d", np);
      })
      .on("end", (e) => {
        const [mx, my] = d3.pointer(e, g.node());
        onWaypointDragEnd(wpi, mx, my);
      });

    cp.call(cd);
  });
}

/**
 * Render temporary link while dragging from link handle
 */
export function renderTempLink(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): d3.Selection<SVGPathElement, unknown, null, undefined> {
  const g = svg.append("g").attr("class", "temp-link");
  g.append("path")
    .attr("d", `M ${x1} ${y1} L ${x2} ${y2}`)
    .attr("stroke", "blue")
    .attr("stroke-width", 2)
    .attr("stroke-dasharray", "5,5")
    .attr("fill", "none")
    .attr("pointer-events", "none");
  g.append("polygon")
    .attr("points", getArrowheadPoints(x2, y2, x1, y1))
    .attr("fill", "blue")
    .attr("class", "arrow-head");
  return g as unknown as d3.Selection<SVGPathElement, unknown, null, undefined>;
}

/**
 * Remove temporary link
 */
export function removeTempLink(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
): void {
  svg.selectAll(".temp-link").remove();
}
