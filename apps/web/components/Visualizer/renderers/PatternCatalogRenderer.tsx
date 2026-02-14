'use client';

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { DiagramData, DiagramNode } from '../types';

interface PatternCatalogRendererProps {
    data: DiagramData;
    width: number;
    height: number;
}

/**
 * Pattern Catalog Renderer — a polished grid of pattern cards.
 *
 * Key visual features:
 *   • Top-strip gradient accent on each card (per card's border color).
 *   • Large centred icon at the top of each card.
 *   • Numbered badge in the top-left corner.
 *   • Description text that wraps to 3 lines max.
 *   • Consistent card sizing with subtle colour variations.
 *   • Category footer chip (if metadata.category exists).
 */
export const PatternCatalogRenderer: React.FC<PatternCatalogRendererProps> = ({ data, width, height }) => {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!svgRef.current || !data?.nodes?.length) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        const nodes = data.nodes;
        const columns = data.gridColumns || Math.min(Math.ceil(Math.sqrt(nodes.length)), 4);
        const rows = Math.ceil(nodes.length / columns);

        // Card dimensions — taller to accommodate icon + description
        const padding = 44;
        const cardGap = 18;
        const availW = width - padding * 2;
        const cardW = Math.min(280, (availW - cardGap * (columns - 1)) / columns);
        const cardH = 190;

        const totalW = columns * cardW + (columns - 1) * cardGap + padding * 2;
        const totalH = rows * cardH + (rows - 1) * cardGap + padding * 2 + 92;

        svg.attr('viewBox', `0 0 ${totalW} ${totalH}`)
            .attr('width', '100%')
            .attr('preserveAspectRatio', 'xMidYMid meet');

        const defs = svg.append('defs');
        const textColor = getTextColor(data.backgroundColor);

        // Shadow filter
        const filter = defs.append('filter')
            .attr('id', 'pc-shadow')
            .attr('x', '-8%').attr('y', '-8%')
            .attr('width', '116%').attr('height', '120%');
        filter.append('feDropShadow')
            .attr('dx', 0).attr('dy', 3)
            .attr('stdDeviation', 5)
            .attr('flood-color', '#000')
            .attr('flood-opacity', 0.07);

        // Background
        svg.append('rect')
            .attr('width', totalW).attr('height', totalH)
            .attr('fill', data.backgroundColor || '#ffffff')
            .attr('rx', 16);

        // Title
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

        const titleOff = data.subtitle ? 92 : 72;

        // --- Cards -------------------------------------------------------
        nodes.forEach((node: DiagramNode, index: number) => {
            const col = index % columns;
            const row = Math.floor(index / columns);
            const x = padding + col * (cardW + cardGap);
            const y = titleOff + row * (cardH + cardGap);

            const g = svg.append('g')
                .attr('transform', `translate(${x}, ${y})`)
                .attr('filter', 'url(#pc-shadow)')
                .style('cursor', 'pointer');

            // Card background
            g.append('rect')
                .attr('width', cardW).attr('height', cardH)
                .attr('rx', node.style.borderRadius || 14)
                .attr('fill', node.style.backgroundColor)
                .attr('stroke', node.style.borderColor)
                .attr('stroke-width', 1.5);

            // Top gradient accent strip
            const stripId = `pc-strip-${node.id}`;
            const stripGrad = defs.append('linearGradient')
                .attr('id', stripId)
                .attr('x1', '0%').attr('y1', '0%')
                .attr('x2', '100%').attr('y2', '0%');
            stripGrad.append('stop').attr('offset', '0%').attr('stop-color', node.style.borderColor);
            stripGrad.append('stop').attr('offset', '100%')
                .attr('stop-color', d3.color(node.style.borderColor)?.brighter(0.6)?.formatHex() || node.style.borderColor);

            // Clip path for top strip
            const clipId = `pc-clip-${node.id}`;
            defs.append('clipPath').attr('id', clipId)
                .append('rect')
                .attr('width', cardW).attr('height', 6)
                .attr('rx', node.style.borderRadius || 14);

            g.append('rect')
                .attr('width', cardW).attr('height', 6)
                .attr('fill', `url(#${stripId})`)
                .attr('clip-path', `url(#${clipId})`);

            // Number badge (top-left)
            const badgeVal = node.badge || `${index + 1}`;
            const bSize = 26;
            const bG = g.append('g').attr('transform', 'translate(12, 16)');
            bG.append('circle')
                .attr('cx', bSize / 2).attr('cy', bSize / 2).attr('r', bSize / 2)
                .attr('fill', node.style.borderColor).attr('opacity', 0.15);
            bG.append('text')
                .attr('x', bSize / 2).attr('y', bSize / 2 + 1)
                .attr('text-anchor', 'middle').attr('dominant-baseline', 'central')
                .attr('font-size', 12).attr('font-weight', '700')
                .attr('fill', node.style.borderColor)
                .attr('font-family', 'Inter, system-ui, sans-serif')
                .text(badgeVal);

            // Icon (centred, large)
            if (node.icon) {
                g.append('text')
                    .attr('x', cardW / 2).attr('y', 50)
                    .attr('text-anchor', 'middle')
                    .attr('font-size', 28)
                    .text(node.icon);
            }

            // Label (centred below icon)
            const labelY = node.icon ? 78 : 52;
            g.append('text')
                .attr('x', cardW / 2).attr('y', labelY)
                .attr('text-anchor', 'middle')
                .attr('font-size', node.style.fontSize || 14)
                .attr('font-weight', '700')
                .attr('fill', node.style.textColor)
                .attr('font-family', 'Inter, system-ui, sans-serif')
                .text(truncate(node.label, cardW - 30));

            // Description (centre-aligned, wrapped)
            if (node.description) {
                const descY = labelY + 20;
                const maxChar = Math.floor((cardW - 30) / 6.5);
                const lines = wrapText(node.description, maxChar);
                lines.slice(0, 3).forEach((line, li) => {
                    g.append('text')
                        .attr('x', cardW / 2).attr('y', descY + li * 17)
                        .attr('text-anchor', 'middle')
                        .attr('font-size', 11)
                        .attr('fill', node.style.textColor).attr('opacity', 0.6)
                        .attr('font-family', 'Inter, system-ui, sans-serif')
                        .text(li === 2 && lines.length > 3 ? line.slice(0, -3) + '…' : line);
                });
            }

            // Category chip (bottom)
            const category = (node.metadata as any)?.category;
            if (category) {
                const chipW = category.length * 6.5 + 16;
                g.append('rect')
                    .attr('x', cardW / 2 - chipW / 2)
                    .attr('y', cardH - 28)
                    .attr('width', chipW).attr('height', 20)
                    .attr('rx', 10)
                    .attr('fill', node.style.borderColor).attr('opacity', 0.1);
                g.append('text')
                    .attr('x', cardW / 2).attr('y', cardH - 14)
                    .attr('text-anchor', 'middle')
                    .attr('font-size', 9).attr('font-weight', '600')
                    .attr('fill', node.style.borderColor)
                    .attr('font-family', 'Inter, system-ui, sans-serif')
                    .text(category);
            }

            // Hover
            g.on('mouseenter', function () {
                d3.select(this).transition().duration(200)
                    .attr('transform', `translate(${x}, ${y - 5})`);
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
