'use client';

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { NodeType } from '@/utils/lab-utils';
import { ARCHITECTURE_LIBRARIES } from '@/utils/shape-libraries';
import { genericD3Shapes } from '@/utils/shape-libraries/generic-d3-shapes';

interface ShapePreviewProps {
  shape: Partial<NodeType> & { id?: string };
  size?: number;
  architecture?: string;
}

/**
 * ShapePreview Component
 * Renders a small D3 SVG preview of a shape for the palette
 * Supports architecture-specific D3 shape renderers (AWS, Kubernetes, etc.)
 * Uses centralized ARCHITECTURE_LIBRARIES registry
 */
const ShapePreview: React.FC<ShapePreviewProps> = ({ shape, size = 60, architecture }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !shape) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const g = svg.append('g');

    // Try to use architecture-specific D3 renderers first
    let rendered = false;

    // Check for shape type or id
    const shapeKey = (shape.type || shape.id || '').toLowerCase();

    console.log('[ShapePreview] Rendering shape:', {
      shapeKey,
      architecture,
      shapeType: shape.type,
      shapeId: shape.id,
      hasGeneric: !!genericD3Shapes[shapeKey],
      hasArchitecture: !!(architecture && ARCHITECTURE_LIBRARIES[architecture]?.[shapeKey])
    });

    if (shapeKey) {
      // First check generic D3 shapes (common shapes like group, pool, heart, star, cloud, etc.)
      if (genericD3Shapes[shapeKey]) {
        console.log('[ShapePreview] Using generic shape:', shapeKey);
        const shapeGroup = g.append('g')
          .attr('transform', `translate(${size * 0.1}, ${size * 0.1})`);
        genericD3Shapes[shapeKey].render(shapeGroup, size * 0.8, size * 0.8);
        rendered = true;
      }
      // Then check architecture-specific shapes using centralized registry
      else if (architecture && ARCHITECTURE_LIBRARIES[architecture]?.[shapeKey]) {
        console.log(`[ShapePreview] Using ${architecture} shape:`, shapeKey);
        const shapeGroup = g.append('g')
          .attr('transform', `translate(${size * 0.1}, ${size * 0.1})`);
        ARCHITECTURE_LIBRARIES[architecture][shapeKey].render(shapeGroup, size * 0.8, size * 0.8);
        rendered = true;
      }
    }

    // If shape wasn't rendered by architecture-specific renderers, show a fallback
    if (!rendered) {
      console.warn('[ShapePreview] Using fallback for shape:', shapeKey);
      // Simple fallback: gray rectangle with label
      g.append('rect')
        .attr('x', size * 0.1)
        .attr('y', size * 0.1)
        .attr('width', size * 0.8)
        .attr('height', size * 0.8)
        .attr('fill', '#E0E0E0')
        .attr('stroke', '#999')
        .attr('stroke-width', 2)
        .attr('rx', 4);
      
      if (shape.label) {
        g.append('text')
          .attr('x', size / 2)
          .attr('y', size / 2)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .attr('font-size', 10)
          .attr('fill', '#666')
          .text(shape.label);
      }
    }
  }, [shape, size, architecture]);

  return (
    <svg
      ref={svgRef}
      width={size}
      height={size}
      style={{ display: 'block' }}
    />
  );
};

export default ShapePreview;
