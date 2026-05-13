'use client';

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { DiagramData, DiagramNode } from '../types';

interface ComparisonGridRendererProps {
    data: DiagramData;
    width: number;
    height: number;
}

/**
 * Comparison Grid Renderer — side-by-side comparison layout.
 *
 * Differences from StepContent:
 *   • Renders two (or more) "columns" with a divider line / VS badge.
 *   • Cards use contrasting color families per column.
 *   • Badges are rendered as pill-shaped (✓ / ✗) indicators, not circles.
 *   • Optional header row showing the category names.
 *   • Wider cards with more prominent description area.
 */
export const ComparisonGridRenderer: React.FC<ComparisonGridRendererProps> = ({ data, width, height }) => {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!svgRef.current || !data?.nodes?.length) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        const nodes = data.nodes;
        const columns = data.gridColumns || 2;
        const rows = Math.ceil(nodes.length / columns);

        // Card dimensions — wider than step-content
        const padding = 48;
        const colGap = 32;
        const rowGap = 20;
        const availW = width - padding * 2;
        const cardW = Math.min(480, (availW - colGap * (columns - 1)) / columns);
        const cardH = 140;

        const totalW = columns * cardW + (columns - 1) * colGap + padding * 2;
        const totalH = rows * cardH + (rows - 1) * rowGap + padding * 2 + 100;

        svg.attr('viewBox', `0 0 ${totalW} ${totalH}`)
            .attr('width', '100%')
            .attr('preserveAspectRatio', 'xMidYMid meet');

        // Background
        svg.append('rect')
            .attr('width', totalW)
            .attr('height', totalH)
            .attr('fill', data.backgroundColor || '#ffffff')
            .attr('rx', 16);

        const textColor = getTextColor(data.backgroundColor);

        // Title - use subtitle as main title (skip diagram type prefix)
        if (data.subtitle) {
            svg.append('text')
                .attr('x', totalW / 2).attr('y', 44)
                .attr('text-anchor', 'middle')
                .attr('font-size', 22).attr('font-weight', '700')
                .attr('fill', textColor)
                .attr('font-family', 'Inter, system-ui, sans-serif')
                .text(data.subtitle);
        }

        const titleOff = data.subtitle ? 74 : 44;

        // VS divider line (only for 2 columns)
        if (columns === 2) {
            const divX = padding + cardW + colGap / 2;
            svg.append('line')
                .attr('x1', divX).attr('y1', titleOff - 10)
                .attr('x2', divX).attr('y2', totalH - padding)
                .attr('stroke', textColor).attr('stroke-opacity', 0.1)
                .attr('stroke-width', 2)
                .attr('stroke-dasharray', '6,4');

            // VS badge
            svg.append('circle')
                .attr('cx', divX).attr('cy', titleOff + 10)
                .attr('r', 18)
                .attr('fill', data.backgroundColor || '#fff')
                .attr('stroke', textColor).attr('stroke-opacity', 0.15)
                .attr('stroke-width', 2);
            svg.append('text')
                .attr('x', divX).attr('y', titleOff + 14)
                .attr('text-anchor', 'middle')
                .attr('font-size', 11).attr('font-weight', '800')
                .attr('fill', textColor).attr('opacity', 0.5)
                .attr('font-family', 'Inter, system-ui, sans-serif')
                .text('VS');
        }

        // Render cards
        nodes.forEach((node: DiagramNode, index: number) => {
            const col = index % columns;
            const row = Math.floor(index / columns);
            const x = padding + col * (cardW + colGap);
            const y = titleOff + row * (cardH + rowGap);

            const g = svg.append('g')
                .attr('data-node-id', node.id)
                .attr('transform', `translate(${x}, ${y})`)
                .style('cursor', 'pointer');

            // Shadow
            g.append('rect')
                .attr('width', cardW).attr('height', cardH)
                .attr('rx', node.style.borderRadius || 14)
                .attr('fill', '#000').attr('opacity', 0.04)
                .attr('transform', 'translate(2, 3)');

            // Card bg
            g.append('rect')
                .attr('width', cardW).attr('height', cardH)
                .attr('rx', node.style.borderRadius || 14)
                .attr('fill', node.style.backgroundColor)
                .attr('stroke', node.style.borderColor)
                .attr('stroke-width', 1.5);

            // Left accent bar (column-specific)
            g.append('rect')
                .attr('x', 0).attr('y', 0)
                .attr('width', 5).attr('height', cardH)
                .attr('rx', 3)
                .attr('fill', node.style.borderColor);

            // Badge — pill shape
            if (node.badge) {
                const isPro = node.badge === '✓' || node.badge === '✔';
                const isCon = node.badge === '✗' || node.badge === '✘' || node.badge === '❌';
                const badgeColor = node.badgeColor || (isPro ? '#22c55e' : isCon ? '#ef4444' : '#3b82f6');

                const bw = 32, bh = 22;
                const bG = g.append('g').attr('transform', `translate(${cardW - bw - 14}, 14)`);
                bG.append('rect')
                    .attr('width', bw).attr('height', bh)
                    .attr('rx', bh / 2)
                    .attr('fill', badgeColor).attr('opacity', 0.15);
                bG.append('text')
                    .attr('x', bw / 2).attr('y', bh / 2 + 1)
                    .attr('text-anchor', 'middle')
                    .attr('dominant-baseline', 'central')
                    .attr('font-size', 13).attr('font-weight', '700')
                    .attr('fill', badgeColor)
                    .attr('font-family', 'Inter, system-ui, sans-serif')
                    .text(node.badge);
            }

            // Icon
            if (node.icon) {
                g.append('text')
                    .attr('x', 18).attr('y', 32)
                    .attr('font-size', 22)
                    .text(node.icon);
            }

            // Label
            const labelY = node.icon ? 56 : 34;
            g.append('text')
                .attr('x', 18).attr('y', labelY)
                .attr('font-size', node.style.fontSize || 14)
                .attr('font-weight', '700')
                .attr('fill', node.style.textColor)
                .attr('font-family', 'Inter, system-ui, sans-serif')
                .text(truncate(node.label, cardW - 60));

            // Description (wrapped)
            if (node.description) {
                const descY = labelY + 22;
                const maxChar = Math.floor((cardW - 36) / 6.8);
                const lines = wrapText(node.description, maxChar);
                lines.slice(0, 3).forEach((line, li) => {
                    g.append('text')
                        .attr('x', 18).attr('y', descY + li * 18)
                        .attr('font-size', 12)
                        .attr('fill', node.style.textColor).attr('opacity', 0.65)
                        .attr('font-family', 'Inter, system-ui, sans-serif')
                        .text(li === 2 && lines.length > 3 ? line.slice(0, -3) + '...' : line);
                });
            }

            // Hover
            g.on('mouseenter', function () {
                d3.select(this).transition().duration(200)
                    .attr('transform', `translate(${x}, ${y - 4})`);
            })
                .on('mouseleave', function () {
                    d3.select(this).transition().duration(200)
                        .attr('transform', `translate(${x}, ${y})`);
                });
        });
    }, [data, width, height]);

    return <svg ref={svgRef} style={{ width: '100%', height: '100%', minHeight: 400 }} />;
};

// --- helpers -----------------------------------------------------------

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
    const c = Math.floor(max / 7.5);
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
