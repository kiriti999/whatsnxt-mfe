/**
 * D3 Shape Renderers
 * 
 * Unified shape rendering logic for DiagramEditor
 * Uses genericD3Shapes for all common shapes with fallback support
 * Includes support for architecture-specific shapes (AWS, Kubernetes, etc.)
 */

import * as d3 from 'd3';
import { NodeType } from './lab-utils';
import { awsD3Shapes } from './shape-libraries/aws-d3-shapes';
import { kubernetesD3Shapes } from './shape-libraries/kubernetes-d3-shapes';
import { genericD3Shapes } from './shape-libraries/generic-d3-shapes';

export interface ShapeRenderContext {
  element: d3.Selection<SVGGElement, NodeType, null, undefined>;
  shape: NodeType;
  fill: string;
  color: string;
  architecture?: string;
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
 * Main shape renderer - delegates to architecture-specific or generic renderers
 */
export function renderShape(ctx: ShapeRenderContext): void {
  const { shape, element, architecture } = ctx;
  
  // Try architecture-specific D3 renderers first
  if (architecture && shape.type) {
    const shapeKey = shape.type.toLowerCase();
    
    if (architecture === 'AWS' && awsD3Shapes[shapeKey]) {
      awsD3Shapes[shapeKey].render(element, shape.width, shape.height);
      return;
    } else if (architecture === 'Kubernetes' && kubernetesD3Shapes[shapeKey]) {
      kubernetesD3Shapes[shapeKey].render(element, shape.width, shape.height);
      return;
    }
  }
  
  // Use unified generic shape renderer for everything else
  renderGenericShape(ctx);
}
