'use client';

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { DiagramData, DiagramNode } from '../types';

interface CheatSheetRendererProps {
    data: DiagramData;
    width: number;
    height: number;
}

/**
 * Cheat Sheet Renderer — dense, categorized reference cards.
 *
 * Inspired by HTTP status code sheets, Git command cheat sheets.
 * Groups nodes by metadata.category and renders compact, color-coded cards
 * with category header bands and a quick-scan layout.
 */
export const CheatSheetRenderer: React.FC<CheatSheetRendererProps> = ({ data, width, height }) => {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!svgRef.current || !data?.nodes?.length) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        const nodes = data.nodes;
        const grouped = groupByCategory(nodes);
        const categories = Object.keys(grouped);

        const columns = data.gridColumns || Math.min(3, Math.ceil(Math.sqrt(nodes.length)));
        const padding = 40;
        const cardGap = 12;
        const categoryGap = 28;
        const cardW = Math.min(260, (width - padding * 2 - cardGap * (columns - 1)) / columns);
        const cardH = 90;
        const headerH = 30;

        const totalW = columns * cardW + (columns - 1) * cardGap + padding * 2;
        const titleOff = data.subtitle ? 92 : 72;
        const totalContentH = computeTotalHeight(grouped, columns, cardH, cardGap, categoryGap, headerH);
        const totalH = titleOff + totalContentH + padding;

        svg.attr('viewBox', `0 0 ${totalW} ${totalH}`)
            .attr('width', '100%')
            .attr('preserveAspectRatio', 'xMidYMid meet');

        const defs = svg.append('defs');
        const textColor = getTextColor(data.backgroundColor);

        // Shadow filter
        const filter = defs.append('filter')
            .attr('id', 'cs-shadow')
            .attr('x', '-6%').attr('y', '-6%')
            .attr('width', '112%').attr('height', '116%');
        filter.append('feDropShadow')
            .attr('dx', 0).attr('dy', 2)
            .attr('stdDeviation', 3)
            .attr('flood-color', '#000')
            .attr('flood-opacity', 0.06);

        // Background
        svg.append('rect')
            .attr('width', totalW).attr('height', totalH)
            .attr('fill', data.backgroundColor || '#ffffff')
            .attr('rx', 16);

        // Title
        renderTitle(svg, data, totalW, textColor);

        // Render categories
        let currentY = titleOff;

        categories.forEach((category) => {
            const catNodes = grouped[category];
            const catColor = catNodes[0]?.style.borderColor || '#6366f1';
            const rows = Math.ceil(catNodes.length / columns);

            // Category header band
            const bandW = totalW - padding * 2;
            svg.append('rect')
                .attr('x', padding).attr('y', currentY)
                .attr('width', bandW).attr('height', headerH)
                .attr('rx', 6)
                .attr('fill', catColor).attr('opacity', 0.12);

            svg.append('rect')
                .attr('x', padding).attr('y', currentY)
                .attr('width', 4).attr('height', headerH)
                .attr('rx', 2)
                .attr('fill', catColor);

            svg.append('text')
                .attr('x', padding + 14).attr('y', currentY + headerH / 2 + 1)
                .attr('dominant-baseline', 'central')
                .attr('font-size', 12).attr('font-weight', '700')
                .attr('fill', catColor)
                .attr('font-family', 'Inter, system-ui, sans-serif')
                .text(category.toUpperCase());

            // Count badge
            const countText = `${catNodes.length}`;
            const countW = countText.length * 7 + 12;
            svg.append('rect')
                .attr('x', padding + bandW - countW - 8)
                .attr('y', currentY + (headerH - 18) / 2)
                .attr('width', countW).attr('height', 18)
                .attr('rx', 9)
                .attr('fill', catColor).attr('opacity', 0.15);
            svg.append('text')
                .attr('x', padding + bandW - countW / 2 - 8)
                .attr('y', currentY + headerH / 2 + 1)
                .attr('text-anchor', 'middle').attr('dominant-baseline', 'central')
                .attr('font-size', 10).attr('font-weight', '600')
                .attr('fill', catColor)
                .attr('font-family', 'Inter, system-ui, sans-serif')
                .text(countText);

            currentY += headerH + 8;

            // Render cards in this category
            catNodes.forEach((node: DiagramNode, index: number) => {
                const col = index % columns;
                const row = Math.floor(index / columns);
                const x = padding + col * (cardW + cardGap);
                const y = currentY + row * (cardH + cardGap);

                const g = svg.append('g')
                    .attr('transform', `translate(${x}, ${y})`)
                    .attr('filter', 'url(#cs-shadow)')
                    .style('cursor', 'pointer');

                // Card bg
                g.append('rect')
                    .attr('width', cardW).attr('height', cardH)
                    .attr('rx', 8)
                    .attr('fill', node.style.backgroundColor)
                    .attr('stroke', node.style.borderColor)
                    .attr('stroke-width', 1);

                // Color accent top bar
                g.append('rect')
                    .attr('width', cardW).attr('height', 4)
                    .attr('rx', 2)
                    .attr('fill', node.style.borderColor);

                // Badge (top-right)
                if (node.badge) {
                    const bW = node.badge.length * 6.5 + 12;
                    g.append('rect')
                        .attr('x', cardW - bW - 6).attr('y', 10)
                        .attr('width', bW).attr('height', 18)
                        .attr('rx', 9)
                        .attr('fill', node.badgeColor || catColor)
                        .attr('opacity', 0.15);
                    g.append('text')
                        .attr('x', cardW - bW / 2 - 6).attr('y', 20)
                        .attr('text-anchor', 'middle').attr('dominant-baseline', 'central')
                        .attr('font-size', 9).attr('font-weight', '600')
                        .attr('fill', node.badgeColor || catColor)
                        .attr('font-family', 'Inter, system-ui, sans-serif')
                        .text(node.badge);
                }

                // Icon + Label on same line
                let labelX = 10;
                if (node.icon) {
                    g.append('text')
                        .attr('x', 10).attr('y', 24)
                        .attr('font-size', 16)
                        .text(node.icon);
                    labelX = 32;
                }

                g.append('text')
                    .attr('x', labelX).attr('y', 26)
                    .attr('font-size', node.style.fontSize || 12)
                    .attr('font-weight', '700')
                    .attr('fill', node.style.textColor)
                    .attr('font-family', 'Inter, system-ui, sans-serif')
                    .text(truncate(node.label, cardW - labelX - 50));

                // Description
                if (node.description) {
                    const maxChar = Math.floor((cardW - 20) / 6);
                    const lines = wrapText(node.description, maxChar);
                    lines.slice(0, 3).forEach((line, li) => {
                        g.append('text')
                            .attr('x', 10).attr('y', 44 + li * 15)
                            .attr('font-size', 10)
                            .attr('fill', node.style.textColor).attr('opacity', 0.6)
                            .attr('font-family', 'Inter, system-ui, sans-serif')
                            .text(li === 2 && lines.length > 3 ? line.slice(0, -3) + '…' : line);
                    });
                }

                // Hover
                g.on('mouseenter', function () {
                    d3.select(this).transition().duration(200)
                        .attr('transform', `translate(${x}, ${y - 3})`);
                }).on('mouseleave', function () {
                    d3.select(this).transition().duration(200)
                        .attr('transform', `translate(${x}, ${y})`);
                });
            });

            currentY += rows * (cardH + cardGap) + categoryGap;
        });
    }, [data, width, height]);

    return <svg ref={svgRef} style={{ width: '100%', height: '100%', minHeight: 400 }} />;
};

// --- helpers -----------------------------------------------------------

function groupByCategory(nodes: DiagramNode[]): Record<string, DiagramNode[]> {
    const groups: Record<string, DiagramNode[]> = {};
    for (const node of nodes) {
        const cat = (node.metadata as Record<string, string>)?.category || 'General';
        if (!groups[cat]) groups[cat] = [];
        groups[cat].push(node);
    }
    return groups;
}

function computeTotalHeight(
    grouped: Record<string, DiagramNode[]>,
    columns: number,
    cardH: number,
    cardGap: number,
    categoryGap: number,
    headerH: number,
): number {
    let total = 0;
    for (const nodes of Object.values(grouped)) {
        const rows = Math.ceil(nodes.length / columns);
        total += headerH + 8 + rows * (cardH + cardGap) + categoryGap;
    }
    return total;
}

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
    const c = Math.floor(max / 6.5);
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
