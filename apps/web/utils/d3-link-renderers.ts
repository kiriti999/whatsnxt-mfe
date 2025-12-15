/**
 * D3 Link (Arrow) Renderers
 * 
 * Isolated link/arrow rendering logic for DiagramEditor
 * Includes marker definitions and link path rendering
 */

import * as d3 from 'd3';
import { NodeType } from './lab-utils';

export interface LinkType {
  source: string; // Node ID
  target: string; // Node ID
  waypoints?: { x: number; y: number }[];
}

/**
 * Create arrow marker definitions
 * Must be called once during SVG initialization
 */
export function createArrowMarkers(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  colorScheme: 'light' | 'dark'
): void {
  const defs = svg.append('defs');
  
  // Standard arrow marker
  defs.append('marker')
    .attr('id', 'arrow')
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 8)
    .attr('refY', 0)
    .attr('markerWidth', 6)
    .attr('markerHeight', 6)
    .attr('orient', 'auto')
    .append('path')
    .attr('d', 'M0,-5L10,0L0,5')
    .attr('fill', colorScheme === 'dark' ? '#FFF' : '#333');
  
  // Temporary arrow marker (for drawing new links)
  defs.append('marker')
    .attr('id', 'arrow-temp')
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 8)
    .attr('refY', 0)
    .attr('markerWidth', 6)
    .attr('markerHeight', 6)
    .attr('orient', 'auto')
    .append('path')
    .attr('d', 'M0,-5L10,0L0,5')
    .attr('fill', 'blue');
}

/**
 * Update arrow marker colors based on color scheme
 */
export function updateArrowMarkerColors(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  colorScheme: 'light' | 'dark'
): void {
  svg.select('#arrow path')
    .attr('fill', colorScheme === 'dark' ? '#FFF' : '#333');
}

/**
 * Calculate waypoint path for links
 * Returns path string and waypoint coordinates
 */
export function getWaypointPath(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  waypoints?: { x: number; y: number }[]
): { path: string; waypoints: { x: number; y: number }[] } {
  if (!waypoints || waypoints.length === 0) {
    // Default: orthogonal path with midpoint
    const midX = (x1 + x2) / 2;
    return {
      path: `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`,
      waypoints: [{ x: midX, y: y1 }, { x: midX, y: y2 }],
    };
  }
  
  // Filter out any undefined/null waypoints
  const validWaypoints = waypoints.filter(
    wp => wp && typeof wp.x === 'number' && typeof wp.y === 'number'
  );
  
  // Build path through waypoints
  let pathD = `M ${x1} ${y1}`;
  validWaypoints.forEach(wp => {
    pathD += ` L ${wp.x} ${wp.y}`;
  });
  pathD += ` L ${x2} ${y2}`;
  
  return { path: pathD, waypoints: validWaypoints };
}

/**
 * Calculate connection points between two nodes
 * Returns coordinates for source and target connection points
 */
export function calculateConnectionPoints(
  sourceNode: NodeType,
  targetNode: NodeType
): { x1: number; y1: number; x2: number; y2: number } {
  const sx = sourceNode.x || 0;
  const sy = sourceNode.y || 0;
  const tx = targetNode.x || 0;
  const ty = targetNode.y || 0;
  
  let x1: number, y1: number, x2: number, y2: number;
  
  // Determine connection points based on relative positions
  if (tx > sx + sourceNode.width) {
    // Target is to the right
    x1 = sx + sourceNode.width;
    y1 = sy + sourceNode.height / 2;
    x2 = tx;
    y2 = ty + targetNode.height / 2;
  } else if (tx + targetNode.width < sx) {
    // Target is to the left
    x1 = sx;
    y1 = sy + sourceNode.height / 2;
    x2 = tx + targetNode.width;
    y2 = ty + targetNode.height / 2;
  } else if (ty > sy + sourceNode.height) {
    // Target is below
    x1 = sx + sourceNode.width / 2;
    y1 = sy + sourceNode.height;
    x2 = tx + targetNode.width / 2;
    y2 = ty;
  } else {
    // Target is above
    x1 = sx + sourceNode.width / 2;
    y1 = sy;
    x2 = tx + targetNode.width / 2;
    y2 = ty + targetNode.height;
  }
  
  return { x1, y1, x2, y2 };
}

/**
 * Render a link (arrow) between two nodes
 */
export function renderLink(
  linkGroup: d3.Selection<SVGGElement, unknown, null, undefined>,
  link: LinkType,
  linkIndex: number,
  sourceNode: NodeType,
  targetNode: NodeType,
  options: {
    isSelected: boolean;
    colorScheme: 'light' | 'dark';
    onLinkClick: () => void;
    onDeleteClick: () => void;
  }
): {
  linkWrapper: d3.Selection<SVGGElement, unknown, null, undefined>;
  visiblePath: d3.Selection<SVGPathElement, unknown, null, undefined>;
  deleteIcon: d3.Selection<SVGGElement, unknown, null, undefined>;
  pathResult: { path: string; waypoints: { x: number; y: number }[] };
} {
  const { isSelected, colorScheme, onLinkClick, onDeleteClick } = options;
  
  // Calculate connection points
  const { x1, y1, x2, y2 } = calculateConnectionPoints(sourceNode, targetNode);
  
  // Get path with waypoints
  const pathResult = getWaypointPath(x1, y1, x2, y2, link.waypoints);
  
  // Create link wrapper group
  const lw = linkGroup.append('g').attr('class', 'link-wrapper');
  
  // Visible path with arrow
  const strokeColor = isSelected 
    ? '#3498db' 
    : (colorScheme === 'dark' ? '#FFF' : '#333');
  
  const vp = lw.append('path')
    .attr('d', pathResult.path)
    .attr('class', 'visible-path')
    .attr('stroke', strokeColor)
    .attr('stroke-width', isSelected ? 3 : 2)
    .attr('fill', 'none')
    .attr('marker-end', 'url(#arrow)');
  
  // Invisible wider path for easier clicking
  lw.append('path')
    .attr('d', pathResult.path)
    .attr('stroke', 'transparent')
    .attr('stroke-width', 20)
    .attr('fill', 'none')
    .attr('cursor', 'pointer')
    .on('click', (e) => {
      e.stopPropagation();
      onLinkClick();
    });
  
  // Delete icon position
  const diPos = (pathResult.waypoints && pathResult.waypoints.length > 0 && pathResult.waypoints[0])
    ? { x: pathResult.waypoints[0].x, y: pathResult.waypoints[0].y - 20 }
    : { x: (x1 + x2) / 2, y: (y1 + y2) / 2 };
  
  const di = lw.append('g')
    .attr('transform', `translate(${diPos.x},${diPos.y})`)
    .attr('cursor', 'pointer')
    .style('display', 'none')
    .on('click', (e) => {
      e.stopPropagation();
      onDeleteClick();
    });
  
  di.append('circle')
    .attr('r', 12)
    .attr('fill', '#e74c3c');
  
  di.append('text')
    .attr('text-anchor', 'middle')
    .attr('dy', '0.35em')
    .attr('fill', 'white')
    .text('×');
  
  // Hover effects
  lw.on('mouseenter', () => {
    if (!isSelected) {
      vp.attr('stroke', '#3498db').attr('stroke-width', 3);
    }
    di.style('display', 'block');
  }).on('mouseleave', () => {
    if (!isSelected) {
      vp.attr('stroke', colorScheme === 'dark' ? '#FFF' : '#333')
        .attr('stroke-width', 2);
    }
    di.style('display', 'none');
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
  g: d3.Selection<SVGGElement, unknown, null, undefined>
): void {
  if (!pathResult.waypoints || pathResult.waypoints.length === 0) return;
  
  pathResult.waypoints.forEach((wp, wpi) => {
    // Skip undefined waypoints
    if (!wp || typeof wp.x !== 'number' || typeof wp.y !== 'number') return;
    
    const cp = linkWrapper.append('circle')
      .attr('cx', wp.x)
      .attr('cy', wp.y)
      .attr('r', 7)
      .attr('fill', '#3498db')
      .attr('stroke', '#FFF')
      .attr('stroke-width', 2)
      .attr('cursor', 'move');
    
    const cd = d3.drag<SVGCircleElement, unknown>()
      .on('drag', function (e) {
        const [mx, my] = d3.pointer(e, g.node());
        d3.select(this).attr('cx', mx).attr('cy', my);
        
        // Reconstruct path locally for drag visualization
        let np = `M ${x1} ${y1}`;
        pathResult.waypoints!.forEach((w, wi) => {
          if (!w) return; // Skip undefined waypoints
          if (wi === wpi) {
            np += ` L ${mx} ${my}`;
          } else {
            np += ` L ${w.x} ${w.y}`;
          }
        });
        np += ` L ${x2} ${y2}`;
        
        visiblePath.attr('d', np);
        linkWrapper.select('path[stroke="transparent"]').attr('d', np);
      })
      .on('end', (e) => {
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
  y2: number
): d3.Selection<SVGPathElement, unknown, null, undefined> {
  return svg.append('path')
    .attr('class', 'temp-link')
    .attr('d', `M ${x1} ${y1} L ${x2} ${y2}`)
    .attr('stroke', 'blue')
    .attr('stroke-width', 2)
    .attr('stroke-dasharray', '5,5')
    .attr('fill', 'none')
    .attr('marker-end', 'url(#arrow-temp)')
    .attr('pointer-events', 'none');
}

/**
 * Remove temporary link
 */
export function removeTempLink(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>
): void {
  svg.selectAll('.temp-link').remove();
}
