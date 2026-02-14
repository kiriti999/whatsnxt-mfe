'use client';

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { DiagramData, DiagramNode } from '../types';

interface StepContentRendererProps {
    data: DiagramData;
    width: number;
    height: number;
}

export const StepContentRenderer: React.FC<StepContentRendererProps> = ({ data, width, height }) => {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!svgRef.current || !data?.nodes?.length) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        const nodes = data.nodes;
        const columns = data.gridColumns || Math.min(Math.ceil(Math.sqrt(nodes.length)), 4);
        const rows = Math.ceil(nodes.length / columns);

        // Card dimensions
        const padding = 40;
        const cardGap = 20;
        const availableWidth = width - padding * 2;
        const cardWidth = Math.min(320, (availableWidth - cardGap * (columns - 1)) / columns);
        const cardHeight = 160;

        // Calculate total diagram size
        const totalWidth = columns * cardWidth + (columns - 1) * cardGap + padding * 2;
        const totalHeight = rows * cardHeight + (rows - 1) * cardGap + padding * 2 + 80; // extra for title

        svg.attr('viewBox', `0 0 ${totalWidth} ${totalHeight}`)
            .attr('width', '100%')
            .attr('preserveAspectRatio', 'xMidYMid meet');

        // Background
        svg.append('rect')
            .attr('width', totalWidth)
            .attr('height', totalHeight)
            .attr('fill', data.backgroundColor || '#ffffff')
            .attr('rx', 16);

        // Title
        if (data.title) {
            svg.append('text')
                .attr('x', totalWidth / 2)
                .attr('y', 44)
                .attr('text-anchor', 'middle')
                .attr('font-size', 24)
                .attr('font-weight', '800')
                .attr('fill', '#1a1a2e')
                .attr('font-family', 'Inter, system-ui, sans-serif')
                .text(data.title);
        }

        // Subtitle
        if (data.subtitle) {
            svg.append('text')
                .attr('x', totalWidth / 2)
                .attr('y', 68)
                .attr('text-anchor', 'middle')
                .attr('font-size', 14)
                .attr('fill', '#6b7280')
                .attr('font-family', 'Inter, system-ui, sans-serif')
                .text(data.subtitle);
        }

        const titleOffset = data.subtitle ? 90 : 70;

        // Render cards
        nodes.forEach((node: DiagramNode, index: number) => {
            const col = index % columns;
            const row = Math.floor(index / columns);
            const x = padding + col * (cardWidth + cardGap);
            const y = titleOffset + row * (cardHeight + cardGap);

            const group = svg.append('g')
                .attr('transform', `translate(${x}, ${y})`)
                .style('cursor', 'pointer');

            // Card shadow
            group.append('rect')
                .attr('width', cardWidth)
                .attr('height', cardHeight)
                .attr('rx', node.style.borderRadius || 12)
                .attr('fill', '#000')
                .attr('opacity', 0.04)
                .attr('transform', 'translate(2, 2)');

            // Card background
            if (node.style.gradient) {
                const gradientId = `grad-${node.id}`;
                const defs = svg.append('defs');
                const linearGradient = defs.append('linearGradient')
                    .attr('id', gradientId)
                    .attr('x1', '0%').attr('y1', '0%')
                    .attr('x2', '100%').attr('y2', '100%');
                linearGradient.append('stop').attr('offset', '0%').attr('stop-color', node.style.backgroundColor);
                linearGradient.append('stop').attr('offset', '100%').attr('stop-color', node.style.borderColor);
                group.append('rect')
                    .attr('width', cardWidth)
                    .attr('height', cardHeight)
                    .attr('rx', node.style.borderRadius || 12)
                    .attr('fill', `url(#${gradientId})`);
            } else {
                group.append('rect')
                    .attr('width', cardWidth)
                    .attr('height', cardHeight)
                    .attr('rx', node.style.borderRadius || 12)
                    .attr('fill', node.style.backgroundColor)
                    .attr('stroke', node.style.borderColor)
                    .attr('stroke-width', 1.5);
            }

            // Badge
            if (node.badge) {
                const badgeSize = 28;
                const badgeGroup = group.append('g')
                    .attr('transform', `translate(${cardWidth - badgeSize - 10}, 10)`);

                badgeGroup.append('circle')
                    .attr('cx', badgeSize / 2)
                    .attr('cy', badgeSize / 2)
                    .attr('r', badgeSize / 2)
                    .attr('fill', node.badgeColor || '#fa709a')
                    .attr('opacity', 0.15);

                badgeGroup.append('text')
                    .attr('x', badgeSize / 2)
                    .attr('y', badgeSize / 2 + 1)
                    .attr('text-anchor', 'middle')
                    .attr('dominant-baseline', 'central')
                    .attr('font-size', 14)
                    .attr('font-weight', '700')
                    .attr('fill', node.badgeColor || '#fa709a')
                    .attr('font-family', 'Inter, system-ui, sans-serif')
                    .text(node.badge);
            }

            // Icon
            if (node.icon) {
                group.append('text')
                    .attr('x', 16)
                    .attr('y', 32)
                    .attr('font-size', 22)
                    .text(node.icon);
            }

            // Label
            const labelY = node.icon ? 58 : 36;
            group.append('text')
                .attr('x', 16)
                .attr('y', labelY)
                .attr('font-size', node.style.fontSize || 14)
                .attr('font-weight', '700')
                .attr('fill', node.style.textColor)
                .attr('font-family', 'Inter, system-ui, sans-serif')
                .text(truncateText(node.label, cardWidth - 50));

            // Description (wrapped)
            if (node.description) {
                const descY = labelY + 22;
                const maxCharsPerLine = Math.floor((cardWidth - 32) / 7);
                const lines = wrapText(node.description, maxCharsPerLine);
                lines.slice(0, 3).forEach((line, lineIndex) => {
                    group.append('text')
                        .attr('x', 16)
                        .attr('y', descY + lineIndex * 18)
                        .attr('font-size', 12)
                        .attr('fill', node.style.textColor)
                        .attr('opacity', 0.7)
                        .attr('font-family', 'Inter, system-ui, sans-serif')
                        .text(lineIndex === 2 && lines.length > 3 ? line.slice(0, -3) + '...' : line);
                });
            }

            // Hover animation
            group
                .on('mouseenter', function () {
                    d3.select(this)
                        .transition()
                        .duration(200)
                        .attr('transform', `translate(${x}, ${y - 4})`);
                })
                .on('mouseleave', function () {
                    d3.select(this)
                        .transition()
                        .duration(200)
                        .attr('transform', `translate(${x}, ${y})`);
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

function truncateText(text: string, maxWidth: number): string {
    const maxChars = Math.floor(maxWidth / 8);
    return text.length > maxChars ? text.substring(0, maxChars - 2) + '...' : text;
}

function wrapText(text: string, maxCharsPerLine: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
        if ((currentLine + ' ' + word).trim().length > maxCharsPerLine) {
            if (currentLine) lines.push(currentLine.trim());
            currentLine = word;
        } else {
            currentLine = currentLine ? currentLine + ' ' + word : word;
        }
    }
    if (currentLine) lines.push(currentLine.trim());
    return lines;
}
