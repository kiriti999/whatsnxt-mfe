'use client';

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { NodeType } from '@/utils/lab-utils';
import { awsD3Shapes } from '@/utils/shape-libraries/aws-d3-shapes';
import { kubernetesD3Shapes } from '@/utils/shape-libraries/kubernetes-d3-shapes';
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
    
    if (shapeKey) {
      // First check generic D3 shapes (common shapes like group, pool, heart, star, cloud, etc.)
      if (genericD3Shapes[shapeKey]) {
        const shapeGroup = g.append('g')
          .attr('transform', `translate(${size * 0.1}, ${size * 0.1})`);
        genericD3Shapes[shapeKey].render(shapeGroup, size * 0.8, size * 0.8);
        rendered = true;
      }
      // Then check architecture-specific shapes
      else if (architecture === 'AWS' && awsD3Shapes[shape.id || '']) {
        const shapeGroup = g.append('g')
          .attr('transform', `translate(${size * 0.1}, ${size * 0.1})`);
        awsD3Shapes[shape.id || ''](shapeGroup, size * 0.8, size * 0.8);
        rendered = true;
      } else if (architecture === 'Kubernetes' && kubernetesD3Shapes[shape.id || '']) {
        const shapeGroup = g.append('g')
          .attr('transform', `translate(${size * 0.1}, ${size * 0.1})`);
        kubernetesD3Shapes[shape.id || ''](shapeGroup, size * 0.8, size * 0.8);
        rendered = true;
      }
    }

    // Fallback to generic shape rendering
    if (!rendered) {
      // Calculate scale to fit shape in preview box
      const scaleX = size / (shape.width || 100);
      const scaleY = size / (shape.height || 100);
      const scale = Math.min(scaleX, scaleY, 1) * 0.8; // 0.8 for padding

      g.attr('transform', `translate(${size / 2}, ${size / 2}) scale(${scale})`);

      const centerX = -(shape.width || 100) / 2;
      const centerY = -(shape.height || 100) / 2;

    // Render shape based on type
    if (shape.type === 'rect' || shape.type === 'group' || shape.type === 'zone' || shape.type === 'container') {
      g.append('rect')
        .attr('x', centerX)
        .attr('y', centerY)
        .attr('width', shape.width || 100)
        .attr('height', shape.height || 60)
        .attr('fill', shape.fill || '#F5F5F5')
        .attr('stroke', shape.stroke || '#333')
        .attr('stroke-width', shape.strokeWidth || 2)
        .attr('stroke-dasharray', shape.strokeDashArray || 'none')
        .attr('rx', shape.rx || 0);
    } else if (shape.type === 'circle') {
      const radius = Math.min(shape.width || 80, shape.height || 80) / 2;
      g.append('circle')
        .attr('cx', 0)
        .attr('cy', 0)
        .attr('r', radius)
        .attr('fill', shape.fill || '#FFF0F5')
        .attr('stroke', shape.stroke || '#333')
        .attr('stroke-width', shape.strokeWidth || 2)
        .attr('stroke-dasharray', shape.strokeDashArray || 'none');
    } else if (shape.type === 'database') {
      const w = shape.width || 80;
      const h = shape.height || 80;
      const ellipseRy = h * 0.15;
      g.append('ellipse')
        .attr('cx', 0)
        .attr('cy', centerY + ellipseRy)
        .attr('rx', w / 2)
        .attr('ry', ellipseRy)
        .attr('fill', shape.fill || '#F5F5F5')
        .attr('stroke', shape.stroke || '#333')
        .attr('stroke-width', shape.strokeWidth || 2);
      g.append('path')
        .attr('d', `M ${-w/2} ${centerY + ellipseRy} L ${-w/2} ${centerY + h - ellipseRy} Q 0 ${centerY + h + ellipseRy} ${w/2} ${centerY + h - ellipseRy} L ${w/2} ${centerY + ellipseRy}`)
        .attr('fill', shape.fill || '#F5F5F5')
        .attr('stroke', shape.stroke || '#333')
        .attr('stroke-width', shape.strokeWidth || 2);
    } else if (shape.type === 'diamond') {
      const w = shape.width || 80;
      const h = shape.height || 80;
      g.append('path')
        .attr('d', `M 0 ${centerY} L ${w/2} 0 L 0 ${h/2} L ${-w/2} 0 Z`)
        .attr('fill', shape.fill || '#E6E6FA')
        .attr('stroke', shape.stroke || '#333')
        .attr('stroke-width', shape.strokeWidth || 2);
    } else if (shape.type === 'path' && shape.pathData) {
      g.append('path')
        .attr('d', shape.pathData)
        .attr('transform', `translate(${centerX}, ${centerY})`)
        .attr('fill', shape.fill || '#D3D3D3')
        .attr('stroke', shape.stroke || '#333')
        .attr('stroke-width', shape.strokeWidth || 2);
    } else if (shape.type === 'pool') {
      const w = shape.width || 600;
      const h = shape.height || 300;
      const barWidth = 30;
      g.append('rect')
        .attr('x', centerX)
        .attr('y', centerY)
        .attr('width', barWidth)
        .attr('height', h)
        .attr('fill', shape.fill || 'transparent')
        .attr('stroke', shape.stroke || '#333')
        .attr('stroke-width', shape.strokeWidth || 2);
      g.append('rect')
        .attr('x', centerX + barWidth)
        .attr('y', centerY)
        .attr('width', w - barWidth)
        .attr('height', h)
        .attr('fill', shape.fill || 'transparent')
        .attr('stroke', shape.stroke || '#333')
        .attr('stroke-width', shape.strokeWidth || 2);
    } else if (shape.type === 'heart') {
      const w = shape.width || 80;
      const h = shape.height || 80;
      const heartPath = `M 0 ${-h*0.3} 
        C ${-w*0.3} ${-h*0.5} ${-w*0.5} ${-h*0.2} ${-w*0.5} ${h*0.1} 
        C ${-w*0.5} ${h*0.3} 0 ${h*0.5} 0 ${h*0.5} 
        C 0 ${h*0.5} ${w*0.5} ${h*0.3} ${w*0.5} ${h*0.1} 
        C ${w*0.5} ${-h*0.2} ${w*0.3} ${-h*0.5} 0 ${-h*0.3} Z`;
      g.append('path')
        .attr('d', heartPath)
        .attr('fill', shape.fill || '#ff4d4d')
        .attr('stroke', shape.stroke || '#c0392b')
        .attr('stroke-width', shape.strokeWidth || 2);
    } else if (shape.type === 'star') {
      const w = shape.width || 80;
      const outerRadius = w / 2;
      const innerRadius = outerRadius * 0.4;
      const points = 5;
      let starPath = '';
      for (let i = 0; i < points * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = (i * Math.PI) / points - Math.PI / 2;
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);
        starPath += `${i === 0 ? 'M' : 'L'} ${x} ${y} `;
      }
      starPath += 'Z';
      g.append('path')
        .attr('d', starPath)
        .attr('fill', shape.fill || '#ffeb3b')
        .attr('stroke', shape.stroke || '#fbc02d')
        .attr('stroke-width', shape.strokeWidth || 2);
    } else if (shape.type === 'cloud') {
      const w = shape.width || 100;
      const h = shape.height || 60;
      const cloudPath = `M ${-w*0.3} 0 
        Q ${-w*0.4} ${-h*0.3} ${-w*0.2} ${-h*0.4} 
        Q 0 ${-h*0.5} ${w*0.2} ${-h*0.4} 
        Q ${w*0.4} ${-h*0.3} ${w*0.3} 0 
        Q ${w*0.4} ${h*0.3} ${w*0.2} ${h*0.4} 
        Q 0 ${h*0.5} ${-w*0.2} ${h*0.4} 
        Q ${-w*0.4} ${h*0.3} ${-w*0.3} 0 Z`;
      g.append('path')
        .attr('d', cloudPath)
        .attr('fill', shape.fill || '#87CEEB')
        .attr('stroke', shape.stroke || '#333')
        .attr('stroke-width', shape.strokeWidth || 2);
    }

      // Add label if space permits
      if (shape.label && size >= 60) {
        g.append('text')
          .attr('x', 0)
          .attr('y', 0)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .attr('font-size', Math.min(12 / scale, 16))
          .attr('fill', shape.fill === 'transparent' || shape.fill === '#FFFFFF' ? '#333' : '#fff')
          .attr('pointer-events', 'none')
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
