/**
 * D3 Shape Renderers
 * 
 * Unified shape rendering logic for DiagramEditor
 * Uses genericD3Shapes for all common shapes with fallback support
 * Includes support for all architecture-specific shapes via centralized registry
 */

import * as d3 from 'd3';
import { NodeType } from './lab-utils';
import { ARCHITECTURE_LIBRARIES } from './shape-libraries/index';
import { genericD3Shapes } from './shape-libraries/generic-d3-shapes';

export interface ShapeRenderContext {
  element: d3.Selection<SVGGElement, NodeType, null, undefined>;
  shape: NodeType;
  fill: string;
  color: string;
  architecture?: string;
  architectureTypes?: string[];
}

/**
 * Unified Generic Shape Renderer
 * Renders any shape from genericD3Shapes or falls back to simple shapes
 */
export function renderGenericShape(ctx: ShapeRenderContext): void {
  const { element, shape, fill, color } = ctx;
  const shapeKey = shape.type?.toLowerCase();

  // Try to use genericD3Shapes first
  if (shapeKey && genericD3Shapes[shapeKey]) {
    genericD3Shapes[shapeKey].render(element, shape.width, shape.height);
    return;
  }

  // Fallback for custom path shapes
  if (shape.type === 'path' && shape.pathData) {
    element.append('path')
      .attr('d', shape.pathData)
      .attr('fill', fill)
      .attr('stroke', color)
      .attr('stroke-width', shape.strokeWidth);
    return;
  }

  // Ultimate fallback - simple rect
  element.append('rect')
    .attr('width', shape.width)
    .attr('height', shape.height)
    .attr('fill', fill)
    .attr('stroke', color)
    .attr('stroke-width', shape.strokeWidth)
    .attr('rx', shape.rx || 0);
}

/**
 * Try to render using a specific architecture library
 */
function tryArchitectureRender(
  archType: string,
  shapeKey: string,
  element: d3.Selection<SVGGElement, NodeType, null, undefined>,
  width: number,
  height: number
): boolean {
  const library = ARCHITECTURE_LIBRARIES[archType];
  if (library && library[shapeKey]) {
    library[shapeKey].render(element, width, height);
    return true;
  }
  return false;
}

/**
 * Main shape renderer - delegates to architecture-specific or generic renderers
 * Uses centralized ARCHITECTURE_LIBRARIES registry for all architecture types
 */
export function renderShape(ctx: ShapeRenderContext): void {
  const { shape, element, architecture, architectureTypes } = ctx;

  if (shape.type) {
    const shapeKey = shape.type.toLowerCase();

    // Try primary architecture type first
    if (architecture && tryArchitectureRender(architecture, shapeKey, element, shape.width, shape.height)) {
      return;
    }

    // Try all architecture types from the multi-select array
    if (architectureTypes) {
      for (const archType of architectureTypes) {
        if (tryArchitectureRender(archType, shapeKey, element, shape.width, shape.height)) {
          return;
        }
      }
    }

    // If no specific architecture matched, scan all registered libraries
    if (!architecture && !architectureTypes?.length) {
      for (const archType of Object.keys(ARCHITECTURE_LIBRARIES)) {
        if (tryArchitectureRender(archType, shapeKey, element, shape.width, shape.height)) {
          return;
        }
      }
    }
  }

  // Use unified generic shape renderer for everything else
  renderGenericShape(ctx);
}
