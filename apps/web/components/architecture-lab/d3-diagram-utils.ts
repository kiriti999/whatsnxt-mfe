
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
 * Render shape label
 */
export function renderShapeLabel(
  element: d3.Selection<SVGGElement, NodeType, null, undefined>,
  shape: NodeType
): void {
  if (shape.type === 'pool') {
    // Pool has its own label rendering
    return;
  }
  
  const fontSize = shape.width < 60 ? '11px' : '14px';
  const textColor = shape.fill === '#000000' ? '#FFF' : '#333';
  
  element.append('foreignObject')
    .attr('x', 4)
    .attr('y', 4)
    .attr('width', shape.width - 8)
    .attr('height', shape.height - 8)
    .style('pointer-events', 'none')
    .append('xhtml:div')
    .style('width', '100%')
    .style('height', '100%')
    .style('display', 'flex')
    .style('align-items', 'center')
    .style('justify-content', 'center')
    .style('text-align', 'center')
    .style('font-weight', 'bold')
    .style('font-size', fontSize)
    .style('color', textColor)
    .style('word-wrap', 'break-word')
    .text(shape.label);
}

/**
 * Render link handle (blue circle at bottom for creating connections)
 */
export function renderLinkHandle(
  element: d3.Selection<SVGGElement, NodeType, null, undefined>,
  shape: NodeType
): d3.Selection<SVGCircleElement, unknown, null, undefined> {
  return element.append('circle')
    .classed('link-handle', true)
    .attr('cx', shape.width / 2)
    .attr('cy', shape.height)
    .attr('r', 8)
    .attr('fill', 'blue')
    .attr('stroke', 'white')
    .attr('stroke-width', 2)
    .attr('opacity', 0)
    .attr('cursor', 'crosshair');
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
