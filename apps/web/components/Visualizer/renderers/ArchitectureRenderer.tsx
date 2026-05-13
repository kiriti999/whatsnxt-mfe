'use client';

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { DiagramData, DiagramNode, DiagramEdge } from '../types';

interface ArchitectureRendererProps {
    data: DiagramData;
    width: number;
    height: number;
}

/**
 * Architecture Renderer — optimised for system architecture diagrams.
 *
 * Differences from FlowDiagram:
 *   • Grouped "zones" with translucent background panels when nodes share a common
 *     metadata.group key (e.g. "frontend", "backend", "data").
 *   • Curved edges (quadratic Bézier) instead of straight lines.
 *   • Larger nodes with prominent icons to feel like an infra diagram.
 *   • Glow/drop-shadow filter on nodes.
 *   • Different arrow-head style with rounded ends.
 */
export const ArchitectureRenderer: React.FC<ArchitectureRendererProps> = ({ data, width, height }) => {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!svgRef.current || !data?.nodes?.length) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        const nodes = data.nodes;
        const edges = data.edges || [];

        // --- positions -------------------------------------------------
        const positions = calculateArchPositions(nodes, data.layout, width, height);

        // --- bounds ----------------------------------------------------
        const pad = 80;
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        nodes.forEach((n) => {
            const p = positions.get(n.id)!;
            const nw = nodeW(n);
            const nh = nodeH(n);
            minX = Math.min(minX, p.x);
            minY = Math.min(minY, p.y);
            maxX = Math.max(maxX, p.x + nw);
            maxY = Math.max(maxY, p.y + nh);
        });

        const totalW = maxX - minX + pad * 2;
        const totalH = maxY - minY + pad * 2 + 80;
        const offX = -minX + pad;
        const offY = -minY + pad + 70;

        svg.attr('viewBox', `0 0 ${totalW} ${totalH}`)
            .attr('width', '100%')
            .attr('preserveAspectRatio', 'xMidYMid meet');

        // --- defs (filters, markers) -----------------------------------
        const defs = svg.append('defs');

        // Drop shadow filter
        const filter = defs.append('filter')
            .attr('id', 'arch-shadow')
            .attr('x', '-10%').attr('y', '-10%')
            .attr('width', '130%').attr('height', '130%');
        filter.append('feDropShadow')
            .attr('dx', 0).attr('dy', 4)
            .attr('stdDeviation', 6)
            .attr('flood-color', '#000')
            .attr('flood-opacity', 0.1);

        // Arrow marker
        defs.append('marker')
            .attr('id', 'arch-arrow')
            .attr('viewBox', '0 0 10 8')
            .attr('refX', 9).attr('refY', 4)
            .attr('markerWidth', 9).attr('markerHeight', 7)
            .attr('orient', 'auto')
            .append('path')
            .attr('d', 'M0,0 L10,4 L0,8 L2,4 Z')
            .attr('fill', '#6b7280');

        // --- background ------------------------------------------------
        svg.append('rect')
            .attr('width', totalW)
            .attr('height', totalH)
            .attr('fill', data.backgroundColor || '#ffffff')
            .attr('rx', 16);

        // --- title (use subtitle as main title, skip diagram type prefix) ---
        if (data.subtitle) {
            svg.append('text')
                .attr('x', totalW / 2)
                .attr('y', 42)
                .attr('text-anchor', 'middle')
                .attr('font-size', 22)
                .attr('font-weight', '700')
                .attr('fill', getTextColor(data.backgroundColor))
                .attr('font-family', 'Inter, system-ui, sans-serif')
                .text(data.subtitle);
        }

        // --- group zones (translucent panels) --------------------------
        const groups = new Map<string, DiagramNode[]>();
        nodes.forEach(n => {
            const grp = (n.metadata as any)?.group;
            if (grp) {
                if (!groups.has(grp)) groups.set(grp, []);
                groups.get(grp)!.push(n);
            }
        });

        if (groups.size > 0) {
            const zoneColors = ['#3b82f6', '#8b5cf6', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4'];
            let zoneIdx = 0;
            groups.forEach((members, groupName) => {
                let gx1 = Infinity, gy1 = Infinity, gx2 = -Infinity, gy2 = -Infinity;
                members.forEach(n => {
                    const p = positions.get(n.id)!;
                    gx1 = Math.min(gx1, p.x);
                    gy1 = Math.min(gy1, p.y);
                    gx2 = Math.max(gx2, p.x + nodeW(n));
                    gy2 = Math.max(gy2, p.y + nodeH(n));
                });
                const zonePad = 24;
                const zColor = zoneColors[zoneIdx % zoneColors.length];
                const zoneG = svg.append('g');

                zoneG.append('rect')
                    .attr('x', gx1 + offX - zonePad)
                    .attr('y', gy1 + offY - zonePad - 22)
                    .attr('width', gx2 - gx1 + zonePad * 2)
                    .attr('height', gy2 - gy1 + zonePad * 2 + 22)
                    .attr('rx', 14)
                    .attr('fill', zColor)
                    .attr('opacity', 0.06)
                    .attr('stroke', zColor)
                    .attr('stroke-width', 1.5)
                    .attr('stroke-opacity', 0.25);

                zoneG.append('text')
                    .attr('x', gx1 + offX - zonePad + 12)
                    .attr('y', gy1 + offY - zonePad - 6)
                    .attr('font-size', 11)
                    .attr('font-weight', '700')
                    .attr('fill', zColor)
                    .attr('font-family', 'Inter, system-ui, sans-serif')
                    .attr('text-transform', 'uppercase')
                    .text(groupName.toUpperCase());

                zoneIdx++;
            });
        }

        // --- edges (curved) --------------------------------------------
        edges.forEach((edge: DiagramEdge) => {
            const sp = positions.get(edge.source);
            const tp = positions.get(edge.target);
            if (!sp || !tp) return;
            const sn = nodes.find(n => n.id === edge.source)!;
            const tn = nodes.find(n => n.id === edge.target)!;

            const sx = sp.x + offX + nodeW(sn) / 2;
            const sy = sp.y + offY + nodeH(sn) / 2;
            const tx = tp.x + offX + nodeW(tn) / 2;
            const ty = tp.y + offY + nodeH(tn) / 2;

            const angle = Math.atan2(ty - sy, tx - sx);
            const startX = sx + Math.cos(angle) * (nodeW(sn) / 2 + 6);
            const startY = sy + Math.sin(angle) * (nodeH(sn) / 2 + 6);
            const endX = tx - Math.cos(angle) * (nodeW(tn) / 2 + 12);
            const endY = ty - Math.sin(angle) * (nodeH(tn) / 2 + 12);

            // Control point for curve
            const midX = (startX + endX) / 2;
            const midY = (startY + endY) / 2;
            const dist = Math.hypot(endX - startX, endY - startY);
            const curvature = Math.min(dist * 0.15, 40);
            const perpX = -(endY - startY) / dist * curvature;
            const perpY = (endX - startX) / dist * curvature;
            const cx = midX + perpX;
            const cy = midY + perpY;

            const edgeG = svg.append('g').attr('data-edge-id', edge.id);
            edgeG.append('path')
                .attr('d', `M${startX},${startY} Q${cx},${cy} ${endX},${endY}`)
                .attr('fill', 'none')
                .attr('stroke', edge.style?.strokeColor || '#94a3b8')
                .attr('stroke-width', edge.style?.strokeWidth || 2)
                .attr('stroke-dasharray', edge.style?.strokeDash || '')
                .attr('marker-end', edge.style?.arrowHead !== false ? 'url(#arch-arrow)' : '');

            if (edge.label) {
                const lx = midX + perpX * 0.5;
                const ly = midY + perpY * 0.5;
                edgeG.append('rect')
                    .attr('x', lx - edge.label.length * 3.5 - 8)
                    .attr('y', ly - 11)
                    .attr('width', edge.label.length * 7 + 16)
                    .attr('height', 22)
                    .attr('rx', 6)
                    .attr('fill', data.backgroundColor || '#ffffff')
                    .attr('stroke', edge.style?.strokeColor || '#e5e7eb')
                    .attr('stroke-width', 1);
                edgeG.append('text')
                    .attr('x', lx)
                    .attr('y', ly + 4)
                    .attr('text-anchor', 'middle')
                    .attr('font-size', 10)
                    .attr('font-weight', '600')
                    .attr('fill', '#6b7280')
                    .attr('font-family', 'Inter, system-ui, sans-serif')
                    .text(edge.label);
            }
        });

        // --- nodes -----------------------------------------------------
        nodes.forEach((node: DiagramNode) => {
            const pos = positions.get(node.id)!;
            const x = pos.x + offX;
            const y = pos.y + offY;
            const nw = nodeW(node);
            const nh = nodeH(node);

            const group = svg.append('g')
                .attr('data-node-id', node.id)
                .attr('transform', `translate(${x}, ${y})`)
                .attr('filter', 'url(#arch-shadow)')
                .style('cursor', 'pointer');

            // Rounded rect with gradient fill
            const gradId = `ag-${node.id}`;
            const grad = defs.append('linearGradient')
                .attr('id', gradId)
                .attr('x1', '0%').attr('y1', '0%')
                .attr('x2', '100%').attr('y2', '100%');
            grad.append('stop').attr('offset', '0%').attr('stop-color', node.style.backgroundColor);
            grad.append('stop').attr('offset', '100%')
                .attr('stop-color', d3.color(node.style.backgroundColor)?.darker(0.3)?.formatHex() || node.style.borderColor);

            group.append('rect')
                .attr('width', nw)
                .attr('height', nh)
                .attr('rx', node.style.borderRadius || 14)
                .attr('fill', `url(#${gradId})`)
                .attr('stroke', node.style.borderColor)
                .attr('stroke-width', 2);

            // Icon (large, centred at top)
            if (node.icon) {
                group.append('text')
                    .attr('x', nw / 2)
                    .attr('y', 32)
                    .attr('text-anchor', 'middle')
                    .attr('font-size', 26)
                    .text(node.icon);
            }

            // Label
            const labelY = node.icon ? 56 : (node.description ? nh / 2 - 6 : nh / 2 + 5);
            group.append('text')
                .attr('x', nw / 2)
                .attr('y', labelY)
                .attr('text-anchor', 'middle')
                .attr('font-size', node.style.fontSize || 13)
                .attr('font-weight', '700')
                .attr('fill', node.style.textColor)
                .attr('font-family', 'Inter, system-ui, sans-serif')
                .text(truncate(node.label, nw - 20));

            // Description
            if (node.description) {
                const descY = node.icon ? 74 : nh / 2 + 14;
                const lines = wrapText(node.description, Math.floor((nw - 24) / 6.5));
                lines.slice(0, 2).forEach((line, li) => {
                    group.append('text')
                        .attr('x', nw / 2)
                        .attr('y', descY + li * 16)
                        .attr('text-anchor', 'middle')
                        .attr('font-size', 10)
                        .attr('fill', node.style.textColor)
                        .attr('opacity', 0.65)
                        .attr('font-family', 'Inter, system-ui, sans-serif')
                        .text(li === 1 && lines.length > 2 ? line.slice(0, -3) + '...' : line);
                });
            }

            // Badge
            if (node.badge) {
                const bSize = 22;
                const bG = group.append('g').attr('transform', `translate(${nw - bSize - 8}, 8)`);
                bG.append('circle')
                    .attr('cx', bSize / 2).attr('cy', bSize / 2).attr('r', bSize / 2)
                    .attr('fill', node.badgeColor || '#fa709a').attr('opacity', 0.2);
                bG.append('text')
                    .attr('x', bSize / 2).attr('y', bSize / 2 + 1)
                    .attr('text-anchor', 'middle').attr('dominant-baseline', 'central')
                    .attr('font-size', 11).attr('font-weight', '700')
                    .attr('fill', node.badgeColor || '#fa709a')
                    .attr('font-family', 'Inter, system-ui, sans-serif')
                    .text(node.badge);
            }

            // Hover
            group
                .on('mouseenter', function () {
                    d3.select(this)
                        .transition().duration(200)
                        .attr('transform', `translate(${x}, ${y - 4})`);
                })
                .on('mouseleave', function () {
                    d3.select(this)
                        .transition().duration(200)
                        .attr('transform', `translate(${x}, ${y})`);
                });
        });
    }, [data, width, height]);

    return <svg ref={svgRef} style={{ width: '100%', height: '100%', minHeight: 400 }} />;
};

// --- helpers -----------------------------------------------------------

function nodeW(n: DiagramNode): number { return n.size?.width || 180; }
function nodeH(n: DiagramNode): number { return n.size?.height || (n.description ? 100 : 80); }

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

function getTextColor(bg: string | undefined): string {
    if (!bg) return '#1a1a2e';
    const hex = bg.replace('#', '');
    if (hex.length < 6) return '#1a1a2e';
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return lum > 0.5 ? '#1a1a2e' : '#f0f0f0';
}

function calculateArchPositions(
    nodes: DiagramNode[],
    layout: string,
    cw: number,
    ch: number,
): Map<string, { x: number; y: number }> {
    const positions = new Map<string, { x: number; y: number }>();

    // If AI provided positions, honour them
    if (nodes.some(n => n.position?.x !== undefined && n.position?.y !== undefined)) {
        nodes.forEach(n => positions.set(n.id, { x: n.position?.x || 0, y: n.position?.y || 0 }));
        return positions;
    }

    // Layered layout: try to group by metadata.group, then stagger within groups
    const groups = new Map<string, DiagramNode[]>();
    const ungrouped: DiagramNode[] = [];
    nodes.forEach(n => {
        const grp = (n.metadata as any)?.group;
        if (grp) {
            if (!groups.has(grp)) groups.set(grp, []);
            groups.get(grp)!.push(n);
        } else {
            ungrouped.push(n);
        }
    });

    if (groups.size > 1) {
        // Multi-group: stack groups vertically, lay members horizontally
        let groupY = 0;
        const gap = 50;
        groups.forEach((members) => {
            let x = 0;
            members.forEach(n => {
                positions.set(n.id, { x, y: groupY });
                x += nodeW(n) + gap;
            });
            groupY += 160;
        });
        // ungrouped at the bottom
        let x = 0;
        ungrouped.forEach(n => {
            positions.set(n.id, { x, y: groupY });
            x += nodeW(n) + gap;
        });
    } else {
        // Default: auto grid with larger spacing
        const cols = Math.ceil(Math.sqrt(nodes.length));
        const gapX = 60, gapY = 50;
        nodes.forEach((n, i) => {
            positions.set(n.id, {
                x: (i % cols) * (nodeW(n) + gapX),
                y: Math.floor(i / cols) * (nodeH(n) + gapY),
            });
        });
    }

    return positions;
}
