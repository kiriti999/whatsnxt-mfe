
/**
 * D3 Diagram Utilities
 * Non-shape utilities for diagram interaction: selection, handles, labels, etc.
 */

import type * as d3 from 'd3';
import type { NodeType } from '../../utils/lab-utils';

/**
 * Render selection outline for selected shape
 */
export function renderSelectionOutline(
  element: d3.Selection<SVGGElement, NodeType, null, undefined>,
  shape: NodeType
): void {
  element.append('rect')
    .attr('x', -5)
    .attr('y', -5)
    .attr('width', shape.width + 10)
    .attr('height', shape.height + 10)
    .attr('fill', 'none')
    .attr('stroke', 'blue')
    .attr('stroke-width', 2)
    .attr('stroke-dasharray', '4,2');
}

/**
 * Render resize handles for selected shape
 */
export function renderResizeHandles(
  element: d3.Selection<SVGGElement, NodeType, null, undefined>,
  shape: NodeType
): void {
  const handlePositions = [
    { cx: 0, cy: 0, c: 'nw-resize', k: 'nw' },
    { cx: shape.width, cy: 0, c: 'ne-resize', k: 'ne' },
    { cx: 0, cy: shape.height, c: 'sw-resize', k: 'sw' },
    { cx: shape.width, cy: shape.height, c: 'se-resize', k: 'se' }
  ];

  handlePositions.forEach(p => {
    element.append('circle')
      .classed('resize-handle', true)
      .attr('cx', p.cx)
      .attr('cy', p.cy)
      .attr('r', 4)
      .attr('fill', 'white')
      .attr('stroke', 'blue')
      .attr('stroke-width', 2)
      .attr('cursor', p.c)
      .attr('data-corner', p.k)
      .attr('data-node-id', shape.id);
  });
}

/**
 * Render shape label (below the shape)
 */
export function renderShapeLabel(
  element: d3.Selection<SVGGElement, NodeType, null, undefined>,
  shape: NodeType,
  colorScheme?: string
): void {
  if (shape.type === 'pool') {
    // Pool has its own label rendering
    return;
  }

  const fontSize = '12px';
  const labelY = shape.height + 5; // Position below the shape
  const textFill = colorScheme === 'dark' ? '#E0E0E0' : '#333';

  element.append('text')
    .classed('shape-label', true)
    .attr('x', shape.width / 2)
    .attr('y', labelY)
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'hanging')
    .style('font-size', fontSize)
    .style('font-weight', '500')
    .style('fill', textFill)
    .style('pointer-events', 'none')
    .style('user-select', 'none')
    .text(shape.label || shape.type);
}

/**
 * Render link handles on all 4 sides of a shape for creating connections.
 * Each edge has 3 handle positions: start (25%), center (50%), end (75%)
 * Each handle stores a `data-edge` attribute like 'top-start', 'top-center', 'top-end', etc.
 * Total: 12 handles (3 per edge)
 */
export function renderLinkHandle(
  element: d3.Selection<SVGGElement, NodeType, null, undefined>,
  shape: NodeType
): d3.Selection<SVGCircleElement, unknown, null, undefined> {
  // Position ratios: start=25%, center=50%, end=75%
  const START = 0.25;
  const CENTER = 0.5;
  const END = 0.75;

  const handles = [
    // Top edge (horizontal positions)
    { cx: shape.width * START, cy: 0, edge: 'top-start' },
    { cx: shape.width * CENTER, cy: 0, edge: 'top-center' },
    { cx: shape.width * END, cy: 0, edge: 'top-end' },
    // Right edge (vertical positions)
    { cx: shape.width, cy: shape.height * START, edge: 'right-start' },
    { cx: shape.width, cy: shape.height * CENTER, edge: 'right-center' },
    { cx: shape.width, cy: shape.height * END, edge: 'right-end' },
    // Bottom edge (horizontal positions)
    { cx: shape.width * START, cy: shape.height, edge: 'bottom-start' },
    { cx: shape.width * CENTER, cy: shape.height, edge: 'bottom-center' },
    { cx: shape.width * END, cy: shape.height, edge: 'bottom-end' },
    // Left edge (vertical positions)
    { cx: 0, cy: shape.height * START, edge: 'left-start' },
    { cx: 0, cy: shape.height * CENTER, edge: 'left-center' },
    { cx: 0, cy: shape.height * END, edge: 'left-end' },
  ];

  let lastHandle: d3.Selection<SVGCircleElement, unknown, null, undefined> | null = null;

  for (const h of handles) {
    lastHandle = element.append('circle')
      .classed('link-handle', true)
      .attr('cx', h.cx)
      .attr('cy', h.cy)
      .attr('r', 5)
      .attr('fill', 'blue')
      .attr('stroke', 'white')
      .attr('stroke-width', 1.5)
      .attr('opacity', 0)
      .attr('cursor', 'crosshair')
      .attr('data-edge', h.edge);
  }

  // Return the last handle for compatibility (though all 12 are added)
  // Safe assertion: handles array always has 12 elements
  return lastHandle as d3.Selection<SVGCircleElement, unknown, null, undefined>;
}

/**
 * Render delete icon (red circle with X)
 */
export function renderDeleteIcon(
  element: d3.Selection<SVGGElement, NodeType, null, undefined>,
  shape: NodeType,
  onDelete: () => void
): d3.Selection<SVGGElement, unknown, null, undefined> {
  const delIcon = element.append('g')
    .attr('transform', `translate(${shape.width}, -10)`)
    .attr('cursor', 'pointer')
    .style('display', 'none')
    .on('mousedown', (e) => e.stopPropagation())
    .on('click', (e) => {
      e.stopPropagation();
      if (confirm('Delete this node?')) {
        onDelete();
      }
    });

  delIcon.append('circle')
    .attr('r', 10)
    .attr('fill', '#e74c3c')
    .attr('stroke', '#fff')
    .attr('stroke-width', 1);

  delIcon.append('text')
    .attr('text-anchor', 'middle')
    .attr('dy', '0.35em')
    .attr('fill', 'white')
    .attr('font-size', '14px')
    .attr('font-weight', 'bold')
    .text('×');

  return delIcon;
}

/**
 * Render container shape (invisible bounding box)
 */
export function renderContainer(
  element: d3.Selection<SVGGElement, NodeType, null, undefined>,
  shape: NodeType
): void {
  element.append('rect')
    .attr('x', -5)
    .attr('y', -5)
    .attr('width', shape.width + 10)
    .attr('height', shape.height + 10)
    .attr('fill', 'none');
}
