
/**
 * D3 Diagram Utilities
 * Non-shape utilities for diagram interaction: selection, handles, labels, etc.
 */

import * as d3 from 'd3';
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
 * Each handle stores a `data-edge` attribute: 'top' | 'right' | 'bottom' | 'left'
 */
export function renderLinkHandle(
  element: d3.Selection<SVGGElement, NodeType, null, undefined>,
  shape: NodeType
): d3.Selection<SVGCircleElement, unknown, null, undefined> {
  const handles = [
    { cx: shape.width / 2, cy: 0, edge: 'top' },
    { cx: shape.width, cy: shape.height / 2, edge: 'right' },
    { cx: shape.width / 2, cy: shape.height, edge: 'bottom' },
    { cx: 0, cy: shape.height / 2, edge: 'left' },
  ];

  let lastHandle: d3.Selection<SVGCircleElement, unknown, null, undefined> | null = null;

  handles.forEach(h => {
    const handle = element.append('circle')
      .classed('link-handle', true)
      .attr('cx', h.cx)
      .attr('cy', h.cy)
      .attr('r', 6)
      .attr('fill', 'blue')
      .attr('stroke', 'white')
      .attr('stroke-width', 2)
      .attr('opacity', 0)
      .attr('cursor', 'crosshair')
      .attr('data-edge', h.edge);
    lastHandle = handle;
  });

  // Return the last handle for compatibility (though all 4 are added)
  return lastHandle!;
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
