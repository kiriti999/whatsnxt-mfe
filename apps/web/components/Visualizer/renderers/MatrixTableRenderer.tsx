'use client';

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { DiagramData, DiagramNode } from '../types';

interface MatrixTableRendererProps {
    data: DiagramData;
    width: number;
    height: number;
}

/**
 * Matrix Table Renderer — structured grid with row/column headers and cells.
 *
 * Uses the first node's children as column headers and remaining nodes as rows.
 * Each row node's metadata.cells array provides the cell values.
 * Alternating row colours and highlighted header row/column for readability.
 */
export const MatrixTableRenderer: React.FC<MatrixTableRendererProps> = ({ data, width, height }) => {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!svgRef.current || !data?.nodes?.length) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        const nodes = data.nodes;

        // Parse table structure from nodes
        const table = parseTableFromNodes(nodes);
        const { headers, rows } = table;

        const colCount = headers.length;
        const rowCount = rows.length;

        // Dimensions
        const padding = 40;
        const headerColW = 160;
        const cellW = Math.min(200, (width - padding * 2 - headerColW) / Math.max(1, colCount));
        const headerRowH = 44;
        const cellH = 50;
        const titleOff = data.subtitle ? 92 : 72;

        const totalW = headerColW + colCount * cellW + padding * 2;
        const totalH = titleOff + headerRowH + rowCount * cellH + padding;

        svg.attr('viewBox', `0 0 ${totalW} ${totalH}`)
            .attr('width', '100%')
            .attr('preserveAspectRatio', 'xMidYMid meet');

        const textColor = getTextColor(data.backgroundColor);
        const headerColor = nodes[0]?.style.borderColor || '#6366f1';

        // Background
        svg.append('rect')
            .attr('width', totalW).attr('height', totalH)
            .attr('fill', data.backgroundColor || '#ffffff')
            .attr('rx', 16);

        // Title
        renderTitle(svg, data, totalW, textColor);

        const tableX = padding;
        const tableY = titleOff;
        const tableW = headerColW + colCount * cellW;
        const tableH = headerRowH + rowCount * cellH;

        // Table outer border
        svg.append('rect')
            .attr('x', tableX).attr('y', tableY)
            .attr('width', tableW).attr('height', tableH)
            .attr('rx', 8)
            .attr('fill', 'none')
            .attr('stroke', textColor).attr('stroke-opacity', 0.12)
            .attr('stroke-width', 1.5);

        // Header row background
        svg.append('rect')
            .attr('x', tableX).attr('y', tableY)
            .attr('width', tableW).attr('height', headerRowH)
            .attr('rx', 8)
            .attr('fill', headerColor).attr('opacity', 0.1);

        // Clip bottom corners of header
        svg.append('rect')
            .attr('x', tableX).attr('y', tableY + 8)
            .attr('width', tableW).attr('height', headerRowH - 8)
            .attr('fill', headerColor).attr('opacity', 0.1);

        // Corner cell (top-left)
        svg.append('rect')
            .attr('x', tableX).attr('y', tableY)
            .attr('width', headerColW).attr('height', headerRowH)
            .attr('rx', 8)
            .attr('fill', headerColor).attr('opacity', 0.2);
        svg.append('rect')
            .attr('x', tableX + 8).attr('y', tableY)
            .attr('width', headerColW - 8).attr('height', headerRowH)
            .attr('fill', headerColor).attr('opacity', 0.2);

        // Render column headers
        headers.forEach((header, ci) => {
            const hx = tableX + headerColW + ci * cellW;

            // Vertical grid line
            svg.append('line')
                .attr('x1', hx).attr('y1', tableY)
                .attr('x2', hx).attr('y2', tableY + tableH)
                .attr('stroke', textColor).attr('stroke-opacity', 0.08)
                .attr('stroke-width', 1);

            // Header text
            svg.append('text')
                .attr('x', hx + cellW / 2)
                .attr('y', tableY + headerRowH / 2 + 1)
                .attr('text-anchor', 'middle')
                .attr('dominant-baseline', 'central')
                .attr('font-size', 12).attr('font-weight', '700')
                .attr('fill', headerColor)
                .attr('font-family', 'Inter, system-ui, sans-serif')
                .text(truncate(header, cellW));
        });

        // Render rows
        rows.forEach((row, ri) => {
            const ry = tableY + headerRowH + ri * cellH;
            const rowNode = row.node;

            // Alternating row bg
            if (ri % 2 === 0) {
                svg.append('rect')
                    .attr('x', tableX).attr('y', ry)
                    .attr('width', tableW).attr('height', cellH)
                    .attr('fill', textColor).attr('opacity', 0.02);
            }

            // Horizontal grid line
            svg.append('line')
                .attr('x1', tableX).attr('y1', ry)
                .attr('x2', tableX + tableW).attr('y2', ry)
                .attr('stroke', textColor).attr('stroke-opacity', 0.08)
                .attr('stroke-width', 1);

            // Row header cell bg
            svg.append('rect')
                .attr('x', tableX).attr('y', ry)
                .attr('width', headerColW).attr('height', cellH)
                .attr('fill', headerColor).attr('opacity', 0.05);

            // Row header — icon + label
            let labelX = tableX + 12;
            if (rowNode.icon) {
                svg.append('text')
                    .attr('x', tableX + 12).attr('y', ry + cellH / 2 + 1)
                    .attr('dominant-baseline', 'central')
                    .attr('font-size', 16)
                    .text(rowNode.icon);
                labelX = tableX + 34;
            }

            svg.append('text')
                .attr('x', labelX)
                .attr('y', ry + cellH / 2 + 1)
                .attr('dominant-baseline', 'central')
                .attr('font-size', 12).attr('font-weight', '700')
                .attr('fill', rowNode.style.textColor || textColor)
                .attr('font-family', 'Inter, system-ui, sans-serif')
                .text(truncate(rowNode.label, headerColW - (labelX - tableX) - 10));

            // Cell values
            row.cells.forEach((cell, ci) => {
                const cx = tableX + headerColW + ci * cellW;
                const cellText = typeof cell === 'string' ? cell : String(cell);

                // Check for special cell values  
                const isCheck = cellText === '✓' || cellText === '✔' || cellText === 'Yes';
                const isCross = cellText === '✗' || cellText === '✘' || cellText === 'No' || cellText === '❌';

                if (isCheck) {
                    renderCheckMark(svg, cx + cellW / 2, ry + cellH / 2);
                } else if (isCross) {
                    renderCrossMark(svg, cx + cellW / 2, ry + cellH / 2);
                } else {
                    // Wrap text in cell
                    const maxChar = Math.floor((cellW - 16) / 6);
                    const lines = wrapText(cellText, maxChar);
                    const lineCount = Math.min(lines.length, 2);
                    const startY = ry + cellH / 2 - (lineCount - 1) * 7;
                    lines.slice(0, 2).forEach((line, li) => {
                        svg.append('text')
                            .attr('x', cx + cellW / 2)
                            .attr('y', startY + li * 14)
                            .attr('text-anchor', 'middle')
                            .attr('dominant-baseline', 'central')
                            .attr('font-size', 11)
                            .attr('fill', textColor).attr('opacity', 0.75)
                            .attr('font-family', 'Inter, system-ui, sans-serif')
                            .text(li === 1 && lines.length > 2 ? line.slice(0, -3) + '…' : line);
                    });
                }
            });
        });

    }, [data, width, height]);

    return <svg ref={svgRef} style={{ width: '100%', height: '100%', minHeight: 400 }} />;
};

// --- table parser ------------------------------------------------------

interface TableRow {
    node: DiagramNode;
    cells: string[];
}

interface TableData {
    headers: string[];
    rows: TableRow[];
}

function parseTableFromNodes(nodes: DiagramNode[]): TableData {
    // Strategy: first node is the "header" node.  
    // If it has children → those are column headers.  
    // Remaining nodes are rows. Each row's metadata.cells provides values.
    // Fallback: if no children/metadata structure, use description lines.

    const headerNode = nodes[0];
    let headers: string[] = [];

    if (headerNode.children?.length) {
        headers = headerNode.children.map(c => c.label);
    } else if ((headerNode.metadata as Record<string, unknown>)?.headers) {
        headers = (headerNode.metadata as Record<string, string[]>).headers;
    } else if (headerNode.description) {
        headers = headerNode.description.split(',').map(h => h.trim());
    }

    const dataNodes = headers.length > 0 ? nodes.slice(1) : nodes;

    // If no headers were parsed, create default column headers
    if (headers.length === 0) {
        const maxCells = dataNodes.reduce((max, n) => {
            const cells = getCellsFromNode(n);
            return Math.max(max, cells.length);
        }, 0);
        headers = Array.from({ length: Math.max(maxCells, 2) }, (_, i) => `Column ${i + 1}`);
    }

    const rows: TableRow[] = dataNodes.map(node => ({
        node,
        cells: getCellsFromNode(node).slice(0, headers.length),
    }));

    // Pad rows if needed
    for (const row of rows) {
        while (row.cells.length < headers.length) {
            row.cells.push('—');
        }
    }

    return { headers, rows };
}

function getCellsFromNode(node: DiagramNode): string[] {
    const meta = node.metadata as Record<string, unknown>;
    if (meta?.cells && Array.isArray(meta.cells)) {
        return (meta.cells as unknown[]).map(c => String(c));
    }
    if (node.description) {
        return node.description.split('|').map(s => s.trim());
    }
    return [];
}

// --- visual helpers ----------------------------------------------------

function renderCheckMark(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    cx: number,
    cy: number,
): void {
    svg.append('circle')
        .attr('cx', cx).attr('cy', cy).attr('r', 10)
        .attr('fill', '#22c55e').attr('opacity', 0.12);
    svg.append('text')
        .attr('x', cx).attr('y', cy + 1)
        .attr('text-anchor', 'middle').attr('dominant-baseline', 'central')
        .attr('font-size', 14).attr('fill', '#22c55e')
        .text('✓');
}

function renderCrossMark(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    cx: number,
    cy: number,
): void {
    svg.append('circle')
        .attr('cx', cx).attr('cy', cy).attr('r', 10)
        .attr('fill', '#ef4444').attr('opacity', 0.12);
    svg.append('text')
        .attr('x', cx).attr('y', cy + 1)
        .attr('text-anchor', 'middle').attr('dominant-baseline', 'central')
        .attr('font-size', 14).attr('fill', '#ef4444')
        .text('✗');
}

// --- common helpers ----------------------------------------------------

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
