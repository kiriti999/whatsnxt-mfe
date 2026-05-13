'use client';

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { DiagramData, DiagramNode, DiagramEdge } from '../types';

interface FlowDiagramRendererProps {
    data: DiagramData;
    width: number;
    height: number;
}

export const FlowDiagramRenderer: React.FC<FlowDiagramRendererProps> = ({ data, width, height }) => {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!svgRef.current || !data?.nodes?.length) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        const nodes = data.nodes;
        const edges = data.edges || [];

        // Calculate positions if not provided
        const positions = calculatePositions(nodes, data.layout, width, height);

        // Calculate diagram bounds
        const padding = 60;
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        nodes.forEach((node, i) => {
            const pos = positions.get(node.id)!;
            const nodeWidth = getNodeWidth(node);
            const nodeHeight = getNodeHeight(node);
            minX = Math.min(minX, pos.x);
            minY = Math.min(minY, pos.y);
            maxX = Math.max(maxX, pos.x + nodeWidth);
            maxY = Math.max(maxY, pos.y + nodeHeight);
        });

        const totalWidth = maxX - minX + padding * 2;
        const totalHeight = maxY - minY + padding * 2 + 70; // extra for title
        const offsetX = -minX + padding;
        const offsetY = -minY + padding + 60; // title offset

        svg.attr('viewBox', `0 0 ${totalWidth} ${totalHeight}`)
            .attr('width', '100%')
            .attr('preserveAspectRatio', 'xMidYMid meet');

        // Background
        svg.append('rect')
            .attr('width', totalWidth)
            .attr('height', totalHeight)
            .attr('fill', data.backgroundColor || '#ffffff')
            .attr('rx', 16);

        // Title - use subtitle if available (skip diagram type prefix)
        const displayTitle = data.subtitle || '';
        if (displayTitle) {
            svg.append('text')
                .attr('x', totalWidth / 2)
                .attr('y', 40)
                .attr('text-anchor', 'middle')
                .attr('font-size', 22)
                .attr('font-weight', '700')
                .attr('fill', '#1a1a2e')
                .attr('font-family', 'Inter, system-ui, sans-serif')
                .text(displayTitle);
        }

        // Arrow marker
        const defs = svg.append('defs');
        defs.append('marker')
            .attr('id', 'arrowhead')
            .attr('viewBox', '0 0 10 7')
            .attr('refX', 10)
            .attr('refY', 3.5)
            .attr('markerWidth', 8)
            .attr('markerHeight', 6)
            .attr('orient', 'auto')
            .append('polygon')
            .attr('points', '0 0, 10 3.5, 0 7')
            .attr('fill', '#6b7280');

        // Draw edges
        edges.forEach((edge: DiagramEdge) => {
            const sourcePos = positions.get(edge.source);
            const targetPos = positions.get(edge.target);
            if (!sourcePos || !targetPos) return;

            const sourceNode = nodes.find(n => n.id === edge.source);
            const targetNode = nodes.find(n => n.id === edge.target);
            if (!sourceNode || !targetNode) return;

            const sourceW = getNodeWidth(sourceNode);
            const sourceH = getNodeHeight(sourceNode);
            const targetW = getNodeWidth(targetNode);
            const targetH = getNodeHeight(targetNode);

            // Calculate edge connection points
            const sx = sourcePos.x + offsetX + sourceW / 2;
            const sy = sourcePos.y + offsetY + sourceH / 2;
            const tx = targetPos.x + offsetX + targetW / 2;
            const ty = targetPos.y + offsetY + targetH / 2;

            // Calculate the angle and adjust connection points to be on the edge of nodes
            const angle = Math.atan2(ty - sy, tx - sx);
            const startX = sx + Math.cos(angle) * (sourceW / 2 + 5);
            const startY = sy + Math.sin(angle) * (sourceH / 2 + 5);
            const endX = tx - Math.cos(angle) * (targetW / 2 + 10);
            const endY = ty - Math.sin(angle) * (targetH / 2 + 10);

            // Draw the edge line
            const edgeGroup = svg.append('g').attr('data-edge-id', edge.id);

            edgeGroup.append('line')
                .attr('x1', startX)
                .attr('y1', startY)
                .attr('x2', endX)
                .attr('y2', endY)
                .attr('stroke', edge.style?.strokeColor || '#6b7280')
                .attr('stroke-width', edge.style?.strokeWidth || 2)
                .attr('stroke-dasharray', edge.style?.strokeDash || '')
                .attr('marker-end', edge.style?.arrowHead !== false ? 'url(#arrowhead)' : '');

            // Edge label
            if (edge.label) {
                const midX = (startX + endX) / 2;
                const midY = (startY + endY) / 2;

                edgeGroup.append('rect')
                    .attr('x', midX - edge.label.length * 3.5 - 6)
                    .attr('y', midY - 10)
                    .attr('width', edge.label.length * 7 + 12)
                    .attr('height', 20)
                    .attr('rx', 4)
                    .attr('fill', data.backgroundColor || '#ffffff')
                    .attr('stroke', edge.style?.strokeColor || '#e5e7eb')
                    .attr('stroke-width', 1);

                edgeGroup.append('text')
                    .attr('x', midX)
                    .attr('y', midY + 4)
                    .attr('text-anchor', 'middle')
                    .attr('font-size', 10)
                    .attr('fill', '#6b7280')
                    .attr('font-family', 'Inter, system-ui, sans-serif')
                    .text(edge.label);
            }
        });

        // Draw nodes
        nodes.forEach((node: DiagramNode) => {
            const pos = positions.get(node.id)!;
            const x = pos.x + offsetX;
            const y = pos.y + offsetY;
            const nodeW = getNodeWidth(node);
            const nodeH = getNodeHeight(node);

            const group = svg.append('g')
                .attr('data-node-id', node.id)
                .attr('transform', `translate(${x}, ${y})`)
                .style('cursor', 'pointer');

            // Node shape
            switch (node.type) {
                case 'circle':
                    const radius = Math.min(nodeW, nodeH) / 2;
                    group.append('circle')
                        .attr('cx', nodeW / 2)
                        .attr('cy', nodeH / 2)
                        .attr('r', radius)
                        .attr('fill', node.style.backgroundColor)
                        .attr('stroke', node.style.borderColor)
                        .attr('stroke-width', 2);
                    break;

                case 'diamond':
                    const points = [
                        `${nodeW / 2},0`,
                        `${nodeW},${nodeH / 2}`,
                        `${nodeW / 2},${nodeH}`,
                        `0,${nodeH / 2}`,
                    ].join(' ');
                    group.append('polygon')
                        .attr('points', points)
                        .attr('fill', node.style.backgroundColor)
                        .attr('stroke', node.style.borderColor)
                        .attr('stroke-width', 2);
                    break;

                default: // box, card, icon, actor
                    // Shadow
                    group.append('rect')
                        .attr('width', nodeW)
                        .attr('height', nodeH)
                        .attr('rx', node.style.borderRadius || 12)
                        .attr('fill', '#000')
                        .attr('opacity', 0.04)
                        .attr('transform', 'translate(2, 2)');

                    group.append('rect')
                        .attr('width', nodeW)
                        .attr('height', nodeH)
                        .attr('rx', node.style.borderRadius || 12)
                        .attr('fill', node.style.backgroundColor)
                        .attr('stroke', node.style.borderColor)
                        .attr('stroke-width', 2);
                    break;
            }

            // Icon
            let textStartY = nodeH / 2 - 6;
            if (node.icon) {
                group.append('text')
                    .attr('x', nodeW / 2)
                    .attr('y', node.description ? nodeH / 2 - 18 : nodeH / 2 - 8)
                    .attr('text-anchor', 'middle')
                    .attr('font-size', 20)
                    .text(node.icon);
                textStartY = nodeH / 2 + 6;
            }

            // Label
            group.append('text')
                .attr('x', nodeW / 2)
                .attr('y', node.icon ? textStartY : (node.description ? nodeH / 2 - 4 : nodeH / 2 + 5))
                .attr('text-anchor', 'middle')
                .attr('font-size', node.style.fontSize || 13)
                .attr('font-weight', '700')
                .attr('fill', node.style.textColor)
                .attr('font-family', 'Inter, system-ui, sans-serif')
                .text(truncateText(node.label, nodeW - 20));

            // Description
            if (node.description) {
                const descY = node.icon ? textStartY + 18 : nodeH / 2 + 14;
                group.append('text')
                    .attr('x', nodeW / 2)
                    .attr('y', descY)
                    .attr('text-anchor', 'middle')
                    .attr('font-size', 10)
                    .attr('fill', node.style.textColor)
                    .attr('opacity', 0.6)
                    .attr('font-family', 'Inter, system-ui, sans-serif')
                    .text(truncateText(node.description, nodeW - 16));
            }

            // Hover effect
            group
                .on('mouseenter', function () {
                    d3.select(this).select('rect, circle, polygon')
                        .transition()
                        .duration(200)
                        .attr('stroke-width', 3);
                })
                .on('mouseleave', function () {
                    d3.select(this).select('rect, circle, polygon')
                        .transition()
                        .duration(200)
                        .attr('stroke-width', 2);
                });
        });
    }, [data, width, height]);

    return (
        <svg
            ref={svgRef}
            style={{ width: '100%', height: '100%', minHeight: 400 }}
        />
    );
};

function getNodeWidth(node: DiagramNode): number {
    return node.size?.width || 160;
}

function getNodeHeight(node: DiagramNode): number {
    return node.size?.height || (node.description ? 90 : 70);
}

function truncateText(text: string, maxWidth: number): string {
    const maxChars = Math.floor(maxWidth / 7);
    return text.length > maxChars ? text.substring(0, maxChars - 2) + '...' : text;
}

function calculatePositions(
    nodes: DiagramNode[],
    layout: string,
    containerWidth: number,
    containerHeight: number,
): Map<string, { x: number; y: number }> {
    const positions = new Map<string, { x: number; y: number }>();

    // If nodes already have positions, use them
    const hasPositions = nodes.some(n => n.position?.x !== undefined && n.position?.y !== undefined);
    if (hasPositions) {
        nodes.forEach(n => {
            positions.set(n.id, {
                x: n.position?.x || 0,
                y: n.position?.y || 0,
            });
        });
        return positions;
    }

    // Auto-layout
    const gap = 40;

    switch (layout) {
        case 'horizontal': {
            let x = 0;
            nodes.forEach((node) => {
                const w = getNodeWidth(node);
                const h = getNodeHeight(node);
                positions.set(node.id, { x, y: 0 });
                x += w + gap;
            });
            break;
        }

        case 'vertical': {
            let y = 0;
            nodes.forEach((node) => {
                const w = getNodeWidth(node);
                const h = getNodeHeight(node);
                positions.set(node.id, { x: 0, y });
                y += h + gap;
            });
            break;
        }

        case 'radial': {
            const centerX = containerWidth / 2 - 80;
            const centerY = containerHeight / 2 - 80;
            const radius = Math.min(centerX, centerY) * 0.6;

            if (nodes.length > 0) {
                // First node at center
                positions.set(nodes[0].id, {
                    x: centerX - getNodeWidth(nodes[0]) / 2,
                    y: centerY - getNodeHeight(nodes[0]) / 2,
                });

                // Rest around the circle
                const remaining = nodes.slice(1);
                remaining.forEach((node, i) => {
                    const angle = (2 * Math.PI * i) / remaining.length - Math.PI / 2;
                    positions.set(node.id, {
                        x: centerX + radius * Math.cos(angle) - getNodeWidth(node) / 2,
                        y: centerY + radius * Math.sin(angle) - getNodeHeight(node) / 2,
                    });
                });
            }
            break;
        }

        case 'grid':
        default: {
            const columns = Math.ceil(Math.sqrt(nodes.length));
            nodes.forEach((node, i) => {
                const w = getNodeWidth(node);
                const h = getNodeHeight(node);
                const col = i % columns;
                const row = Math.floor(i / columns);
                positions.set(node.id, {
                    x: col * (w + gap),
                    y: row * (h + gap),
                });
            });
            break;
        }
    }

    return positions;
}
