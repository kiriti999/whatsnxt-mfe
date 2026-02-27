/**
 * D3 Link (Arrow) Renderers
 *
 * Isolated link/arrow rendering logic for DiagramEditor
 * Includes marker definitions and link path rendering
 */

import * as d3 from "d3";
import type { NodeType } from "./lab-utils";

export type EdgeSide = "top" | "right" | "bottom" | "left";

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
  const defs = svg.append("defs");

  // Standard arrow marker
  defs
    .append("marker")
    .attr("id", "arrow")
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 10)
    .attr("refY", 0)
    .attr("markerWidth", 6)
    .attr("markerHeight", 6)
    .attr("orient", "auto")
    .append("path")
    .attr("d", "M0,-5L10,0L0,5")
    .attr("fill", colorScheme === "dark" ? "#FFF" : "#333");

  // Temporary arrow marker (for drawing new links)
  defs
    .append("marker")
    .attr("id", "arrow-temp")
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 10)
    .attr("refY", 0)
    .attr("markerWidth", 6)
    .attr("markerHeight", 6)
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
 * Find the closest link handle position for auto-detected connections.
 * Returns the handle position (top/right/bottom/left) that's closest to the target direction.
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
  const cx = nodeX + nodeW / 2;
  const cy = nodeY + nodeH / 2;

  const dx = targetX - cx;
  const dy = targetY - cy;

  // If centers overlap, default to right edge handle
  if (dx === 0 && dy === 0) return { x: nodeX + nodeW, y: cy };

  // Determine which handle to use based on direction
  // Use the handle that's most aligned with the target direction
  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);

  let handlePos: { x: number; y: number };

  if (absDx > absDy) {
    // Horizontal direction dominates - use left or right handle
    if (dx > 0) {
      handlePos = { x: nodeX + nodeW, y: cy }; // right
    } else {
      handlePos = { x: nodeX, y: cy }; // left
    }
  } else {
    // Vertical direction dominates - use top or bottom handle
    if (dy > 0) {
      handlePos = { x: cx, y: nodeY + nodeH }; // bottom
    } else {
      handlePos = { x: cx, y: nodeY }; // top
    }
  }

  if (isTargetNode) {
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 0) {
      // Move endpoint 2px inside the shape edge so the arrowhead tip sits right on the border
      const nudge = 2;
      handlePos.x -= (dx / dist) * nudge;
      handlePos.y -= (dy / dist) * nudge;
    }
  }

  return handlePos;
}

/**
 * Get the exact position of link handle on a specific edge.
 * These positions match the blue dot handles rendered on shapes.
 * For bottom edge of source nodes, add extra offset to clear the label area.
 */
function getEdgeMidpoint(
  nodeX: number,
  nodeY: number,
  nodeW: number,
  nodeH: number,
  edge: EdgeSide,
  _isSourceNode = false, // retained for API compat, no longer used
): { x: number; y: number } {
  switch (edge) {
    case "top":
      return { x: nodeX + nodeW / 2, y: nodeY };
    case "bottom":
      return { x: nodeX + nodeW / 2, y: nodeY + nodeH };
    case "left":
      return { x: nodeX, y: nodeY + nodeH / 2 };
    case "right":
      return { x: nodeX + nodeW, y: nodeY + nodeH / 2 };
  }
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
    // Use the specified edge midpoint directly — refX=10 on the marker places the arrowhead
    // tip exactly at the endpoint, so no pullback is needed.
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
    .attr("fill", "none")
    .attr("marker-end", "url(#arrow)");

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
    }
    di.style("display", "block");
  }).on("mouseleave", () => {
    if (!isSelected) {
      vp.attr("stroke", colorScheme === "dark" ? "#FFF" : "#333").attr(
        "stroke-width",
        2,
      );
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
  return svg
    .append("path")
    .attr("class", "temp-link")
    .attr("d", `M ${x1} ${y1} L ${x2} ${y2}`)
    .attr("stroke", "blue")
    .attr("stroke-width", 2)
    .attr("stroke-dasharray", "5,5")
    .attr("fill", "none")
    .attr("marker-end", "url(#arrow-temp)")
    .attr("pointer-events", "none");
}

/**
 * Remove temporary link
 */
export function removeTempLink(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
): void {
  svg.selectAll(".temp-link").remove();
}
