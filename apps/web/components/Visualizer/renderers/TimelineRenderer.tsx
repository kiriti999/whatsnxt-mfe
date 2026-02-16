'use client';

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { DiagramData, DiagramNode } from '../types';

interface TimelineRendererProps {
    data: DiagramData;
    width: number;
    height: number;
}

/**
 * Timeline Renderer — vertical chronological progression with milestones.
 *
 * Renders a central vertical line with alternating left/right milestone cards
 * connected by dot markers. Each milestone has an icon, title, and description.
 * Inspired by version history timelines and process visualizations.
 */
export const TimelineRenderer: React.FC<TimelineRendererProps> = ({ data, width, height }) => {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!svgRef.current || !data?.nodes?.length) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        const nodes = data.nodes;
        const padding = 40;
        const cardW = 280;
        const cardH = 100;
        const verticalGap = 30;
        const lineX = width / 2;
        const dotRadius = 10;

        const titleOff = data.subtitle ? 92 : 72;
        const totalH = titleOff + nodes.length * (cardH + verticalGap) + padding;

        svg.attr('viewBox', `0 0 ${width} ${totalH}`)
            .attr('width', '100%')
            .attr('preserveAspectRatio', 'xMidYMid meet');

        const defs = svg.append('defs');
        const textColor = getTextColor(data.backgroundColor);

        // Shadow filter
        const filter = defs.append('filter')
            .attr('id', 'tl-shadow')
            .attr('x', '-8%').attr('y', '-8%')
            .attr('width', '116%').attr('height', '120%');
        filter.append('feDropShadow')
            .attr('dx', 0).attr('dy', 3)
            .attr('stdDeviation', 5)
            .attr('flood-color', '#000')
            .attr('flood-opacity', 0.07);

        // Glow filter for dots
        const glow = defs.append('filter')
            .attr('id', 'tl-glow')
            .attr('x', '-50%').attr('y', '-50%')
            .attr('width', '200%').attr('height', '200%');
        glow.append('feGaussianBlur').attr('stdDeviation', 4).attr('result', 'blur');
        glow.append('feMerge')
            .selectAll('feMergeNode')
            .data(['blur', 'SourceGraphic']).enter()
            .append('feMergeNode').attr('in', (d: string) => d);

        // Background
        svg.append('rect')
            .attr('width', width).attr('height', totalH)
            .attr('fill', data.backgroundColor || '#ffffff')
            .attr('rx', 16);

        // Title
        renderTitle(svg, data, width, textColor);

        // Central timeline line
        const lineStart = titleOff + 20;
        const lineEnd = totalH - padding;
        svg.append('line')
            .attr('x1', lineX).attr('y1', lineStart)
            .attr('x2', lineX).attr('y2', lineEnd)
            .attr('stroke', textColor).attr('stroke-opacity', 0.12)
            .attr('stroke-width', 3)
            .attr('stroke-dasharray', '8,4');

        // Render milestone nodes
        nodes.forEach((node: DiagramNode, index: number) => {
            const isLeft = index % 2 === 0;
            const cy = titleOff + 20 + index * (cardH + verticalGap) + cardH / 2;
            const cardX = isLeft ? lineX - cardW - 40 : lineX + 40;
            const cardY = cy - cardH / 2;
            const nodeColor = node.style.borderColor || '#6366f1';

            // Connector line from dot to card
            const connStartX = isLeft ? lineX - dotRadius - 2 : lineX + dotRadius + 2;
            const connEndX = isLeft ? cardX + cardW : cardX;
            svg.append('line')
                .attr('x1', connStartX).attr('y1', cy)
                .attr('x2', connEndX).attr('y2', cy)
                .attr('stroke', nodeColor).attr('stroke-opacity', 0.3)
                .attr('stroke-width', 2)
                .attr('stroke-dasharray', '4,3');

            // Timeline dot
            svg.append('circle')
                .attr('cx', lineX).attr('cy', cy)
                .attr('r', dotRadius + 4)
                .attr('fill', nodeColor).attr('opacity', 0.12);
            svg.append('circle')
                .attr('cx', lineX).attr('cy', cy)
                .attr('r', dotRadius)
                .attr('fill', nodeColor)
                .attr('filter', 'url(#tl-glow)');

            // Step number on dot
            svg.append('text')
                .attr('x', lineX).attr('y', cy + 1)
                .attr('text-anchor', 'middle').attr('dominant-baseline', 'central')
                .attr('font-size', 10).attr('font-weight', '700')
                .attr('fill', '#fff')
                .attr('font-family', 'Inter, system-ui, sans-serif')
                .text(`${index + 1}`);

            // Card group
            const g = svg.append('g')
                .attr('transform', `translate(${cardX}, ${cardY})`)
                .attr('filter', 'url(#tl-shadow)')
                .style('cursor', 'pointer');

            // Card background
            g.append('rect')
                .attr('width', cardW).attr('height', cardH)
                .attr('rx', 12)
                .attr('fill', node.style.backgroundColor)
                .attr('stroke', nodeColor)
                .attr('stroke-width', 1.5);

            // Left accent strip
            g.append('rect')
                .attr('x', 0).attr('y', 0)
                .attr('width', 4).attr('height', cardH)
                .attr('rx', 2)
                .attr('fill', nodeColor);

            // Icon
            let contentX = 14;
            if (node.icon) {
                g.append('text')
                    .attr('x', 14).attr('y', 28)
                    .attr('font-size', 20)
                    .text(node.icon);
                contentX = 40;
            }

            // Label
            g.append('text')
                .attr('x', contentX).attr('y', 28)
                .attr('font-size', node.style.fontSize || 14)
                .attr('font-weight', '700')
                .attr('fill', node.style.textColor)
                .attr('font-family', 'Inter, system-ui, sans-serif')
                .text(truncate(node.label, cardW - contentX - 20));

            // Description
            if (node.description) {
                const maxChar = Math.floor((cardW - contentX - 14) / 6.2);
                const lines = wrapText(node.description, maxChar);
                lines.slice(0, 3).forEach((line, li) => {
                    g.append('text')
                        .attr('x', contentX).attr('y', 48 + li * 16)
                        .attr('font-size', 11)
                        .attr('fill', node.style.textColor).attr('opacity', 0.6)
                        .attr('font-family', 'Inter, system-ui, sans-serif')
                        .text(li === 2 && lines.length > 3 ? line.slice(0, -3) + '…' : line);
                });
            }

            // Badge (top-right)
            if (node.badge) {
                const bW = node.badge.length * 6.5 + 14;
                g.append('rect')
                    .attr('x', cardW - bW - 8).attr('y', 8)
                    .attr('width', bW).attr('height', 20)
                    .attr('rx', 10)
                    .attr('fill', node.badgeColor || nodeColor).attr('opacity', 0.12);
                g.append('text')
                    .attr('x', cardW - bW / 2 - 8).attr('y', 19)
                    .attr('text-anchor', 'middle').attr('dominant-baseline', 'central')
                    .attr('font-size', 9).attr('font-weight', '600')
                    .attr('fill', node.badgeColor || nodeColor)
                    .attr('font-family', 'Inter, system-ui, sans-serif')
                    .text(node.badge);
            }

            // Hover
            g.on('mouseenter', function () {
                d3.select(this).transition().duration(200)
                    .attr('transform', `translate(${cardX}, ${cardY - 4})`);
            }).on('mouseleave', function () {
                d3.select(this).transition().duration(200)
                    .attr('transform', `translate(${cardX}, ${cardY})`);
            });
        });

        // Top & bottom decorative caps
        svg.append('circle')
            .attr('cx', lineX).attr('cy', lineStart)
            .attr('r', 5).attr('fill', textColor).attr('opacity', 0.2);
        svg.append('circle')
            .attr('cx', lineX).attr('cy', lineEnd)
            .attr('r', 5).attr('fill', textColor).attr('opacity', 0.2);

    }, [data, width, height]);

    return <svg ref={svgRef} style={{ width: '100%', height: '100%', minHeight: 400 }} />;
};

// --- helpers -----------------------------------------------------------

function renderTitle(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    data: DiagramData,
    totalW: number,
    textColor: string,
): void {
    if (data.title) {
        svg.append('text')
            .attr('x', totalW / 2).attr('y', 44)
            .attr('text-anchor', 'middle')
            .attr('font-size', 24).attr('font-weight', '800')
            .attr('fill', textColor)
            .attr('font-family', 'Inter, system-ui, sans-serif')
            .text(data.title);
    }
    if (data.subtitle) {
        svg.append('text')
            .attr('x', totalW / 2).attr('y', 68)
            .attr('text-anchor', 'middle')
            .attr('font-size', 14)
            .attr('fill', textColor).attr('opacity', 0.6)
            .attr('font-family', 'Inter, system-ui, sans-serif')
            .text(data.subtitle);
    }
}

function getTextColor(bg: string | undefined): string {
    if (!bg) return '#1a1a2e';
    const hex = bg.replace('#', '');
    if (hex.length < 6) return '#1a1a2e';
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.5 ? '#1a1a2e' : '#f0f0f0';
}

function truncate(t: string, max: number): string {
    const c = Math.floor(max / 7);
    return t.length > c ? t.substring(0, c - 2) + '…' : t;
}

function wrapText(text: string, maxChars: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let cur = '';
    for (const w of words) {
        if ((cur + ' ' + w).trim().length > maxChars) {
            if (cur) lines.push(cur.trim());
            cur = w;
        } else {
            cur = cur ? cur + ' ' + w : w;
        }
    }
    if (cur) lines.push(cur.trim());
    return lines;
}
