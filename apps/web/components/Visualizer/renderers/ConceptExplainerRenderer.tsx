'use client';

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { DiagramData, DiagramNode, DiagramEdge } from '../types';

interface ConceptExplainerRendererProps {
    data: DiagramData;
    width: number;
    height: number;
}

/**
 * Concept Explainer Renderer — radial layout with a central concept node and
 * orbiting sub-concept cards connected by curved edges.
 *
 * Key visual features:
 *   • Central node is **larger** with a gradient background and glow.
 *   • Satellite nodes arranged in a circle around the centre.
 *   • Edges are smooth quadratic curves from each satellite to centre.
 *   • "Orbit ring" — a faint circle behind the satellites.
 *   • Each satellite has a numbered badge and icon.
 */
export const ConceptExplainerRenderer: React.FC<ConceptExplainerRendererProps> = ({ data, width, height }) => {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!svgRef.current || !data?.nodes?.length) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        const nodes = data.nodes;
        const edges = data.edges || [];

        // Central node is the first node
        const centerNode = nodes[0];
        const satellites = nodes.slice(1);

        // Dimensions
        const centerW = centerNode.size?.width || 220;
        const centerH = centerNode.size?.height || 120;
        const satW = 180;
        const satH = satellites.some(s => s.description) ? 100 : 80;
        const orbitRadius = Math.max(220, satellites.length * 38);

        const canvasW = orbitRadius * 2 + satW + 120;
        const canvasH = orbitRadius * 2 + satH + 160;
        const cx = canvasW / 2;
        const cy = canvasH / 2 + 30;

        svg.attr('viewBox', `0 0 ${canvasW} ${canvasH}`)
            .attr('width', '100%')
            .attr('preserveAspectRatio', 'xMidYMid meet');

        const defs = svg.append('defs');
        const textColor = getTextColor(data.backgroundColor);

        // Glow filter for centre
        const glow = defs.append('filter')
            .attr('id', 'ce-glow')
            .attr('x', '-30%').attr('y', '-30%')
            .attr('width', '160%').attr('height', '160%');
        glow.append('feGaussianBlur').attr('stdDeviation', 12).attr('result', 'blur');
        glow.append('feMerge')
            .selectAll('feMergeNode')
            .data(['blur', 'SourceGraphic']).enter()
            .append('feMergeNode').attr('in', (d: string) => d);

        // Shadow filter
        const shadow = defs.append('filter')
            .attr('id', 'ce-shadow')
            .attr('x', '-10%').attr('y', '-10%')
            .attr('width', '130%').attr('height', '130%');
        shadow.append('feDropShadow')
            .attr('dx', 0).attr('dy', 3)
            .attr('stdDeviation', 5)
            .attr('flood-color', '#000')
            .attr('flood-opacity', 0.08);

        // Arrow
        defs.append('marker')
            .attr('id', 'ce-arrow')
            .attr('viewBox', '0 0 10 8')
            .attr('refX', 9).attr('refY', 4)
            .attr('markerWidth', 8).attr('markerHeight', 6)
            .attr('orient', 'auto')
            .append('path')
            .attr('d', 'M0,1 L8,4 L0,7')
            .attr('fill', 'none')
            .attr('stroke', '#94a3b8')
            .attr('stroke-width', 1.5);

        // Background
        svg.append('rect')
            .attr('width', canvasW).attr('height', canvasH)
            .attr('fill', data.backgroundColor || '#ffffff')
            .attr('rx', 16);

        // Title
        if (data.title) {
            svg.append('text')
                .attr('x', canvasW / 2).attr('y', 40)
                .attr('text-anchor', 'middle')
                .attr('font-size', 24).attr('font-weight', '800')
                .attr('fill', textColor)
                .attr('font-family', 'Inter, system-ui, sans-serif')
                .text(data.title);
        }
        if (data.subtitle) {
            svg.append('text')
                .attr('x', canvasW / 2).attr('y', 62)
                .attr('text-anchor', 'middle')
                .attr('font-size', 14)
                .attr('fill', textColor).attr('opacity', 0.6)
                .attr('font-family', 'Inter, system-ui, sans-serif')
                .text(data.subtitle);
        }

        // Orbit ring (decorative)
        svg.append('circle')
            .attr('cx', cx).attr('cy', cy)
            .attr('r', orbitRadius)
            .attr('fill', 'none')
            .attr('stroke', textColor).attr('stroke-opacity', 0.06)
            .attr('stroke-width', 2)
            .attr('stroke-dasharray', '8,6');

        // Compute satellite positions
        const satPositions = new Map<string, { x: number; y: number }>();
        satPositions.set(centerNode.id, { x: cx - centerW / 2, y: cy - centerH / 2 });

        satellites.forEach((sat, i) => {
            const angle = (2 * Math.PI * i) / satellites.length - Math.PI / 2;
            satPositions.set(sat.id, {
                x: cx + orbitRadius * Math.cos(angle) - satW / 2,
                y: cy + orbitRadius * Math.sin(angle) - satH / 2,
            });
        });

        // --- Draw edges (curves from satellites to centre) ---------------
        edges.forEach((edge: DiagramEdge) => {
            const sp = satPositions.get(edge.source);
            const tp = satPositions.get(edge.target);
            if (!sp || !tp) return;

            const sn = nodes.find(n => n.id === edge.source);
            const tn = nodes.find(n => n.id === edge.target);
            if (!sn || !tn) return;

            const sw = sn === centerNode ? centerW : satW;
            const sh = sn === centerNode ? centerH : satH;
            const tw = tn === centerNode ? centerW : satW;
            const th = tn === centerNode ? centerH : satH;

            const sx = sp.x + sw / 2;
            const sy = sp.y + sh / 2;
            const tx = tp.x + tw / 2;
            const ty = tp.y + th / 2;

            const angle = Math.atan2(ty - sy, tx - sx);
            const startX = sx + Math.cos(angle) * (sw / 2 + 6);
            const startY = sy + Math.sin(angle) * (sh / 2 + 6);
            const endX = tx - Math.cos(angle) * (tw / 2 + 10);
            const endY = ty - Math.sin(angle) * (th / 2 + 10);

            const midX = (startX + endX) / 2;
            const midY = (startY + endY) / 2;
            const dist = Math.hypot(endX - startX, endY - startY);
            const curv = Math.min(dist * 0.1, 25);
            const perpX = -(endY - startY) / dist * curv;
            const perpY = (endX - startX) / dist * curv;

            const eG = svg.append('g');
            eG.append('path')
                .attr('d', `M${startX},${startY} Q${midX + perpX},${midY + perpY} ${endX},${endY}`)
                .attr('fill', 'none')
                .attr('stroke', edge.style?.strokeColor || '#94a3b8')
                .attr('stroke-width', edge.style?.strokeWidth || 2)
                .attr('stroke-dasharray', edge.style?.strokeDash || '')
                .attr('marker-end', edge.style?.arrowHead !== false ? 'url(#ce-arrow)' : '');

            if (edge.label) {
                const lx = midX + perpX * 0.5;
                const ly = midY + perpY * 0.5;
                eG.append('rect')
                    .attr('x', lx - edge.label.length * 3.2 - 6)
                    .attr('y', ly - 10).attr('width', edge.label.length * 6.5 + 12)
                    .attr('height', 20).attr('rx', 5)
                    .attr('fill', data.backgroundColor || '#fff')
                    .attr('stroke', '#e5e7eb').attr('stroke-width', 1);
                eG.append('text')
                    .attr('x', lx).attr('y', ly + 4)
                    .attr('text-anchor', 'middle')
                    .attr('font-size', 9).attr('font-weight', '600')
                    .attr('fill', '#6b7280')
                    .attr('font-family', 'Inter, system-ui, sans-serif')
                    .text(edge.label);
            }
        });

        // --- Draw centre node -------------------------------------------
        {
            const cPos = satPositions.get(centerNode.id)!;
            const cG = svg.append('g')
                .attr('transform', `translate(${cPos.x}, ${cPos.y})`)
                .attr('filter', 'url(#ce-glow)')
                .style('cursor', 'pointer');

            // Gradient
            const gradId = 'ce-center-grad';
            const grad = defs.append('linearGradient')
                .attr('id', gradId)
                .attr('x1', '0%').attr('y1', '0%')
                .attr('x2', '100%').attr('y2', '100%');
            grad.append('stop').attr('offset', '0%').attr('stop-color', centerNode.style.backgroundColor);
            grad.append('stop').attr('offset', '100%')
                .attr('stop-color', d3.color(centerNode.style.backgroundColor)?.darker(0.4)?.formatHex() || centerNode.style.borderColor);

            cG.append('rect')
                .attr('width', centerW).attr('height', centerH)
                .attr('rx', centerNode.style.borderRadius || 20)
                .attr('fill', `url(#${gradId})`)
                .attr('stroke', centerNode.style.borderColor)
                .attr('stroke-width', 3);

            if (centerNode.icon) {
                cG.append('text')
                    .attr('x', centerW / 2).attr('y', 36)
                    .attr('text-anchor', 'middle')
                    .attr('font-size', 30)
                    .text(centerNode.icon);
            }

            const clY = centerNode.icon ? 64 : (centerNode.description ? centerH / 2 - 6 : centerH / 2 + 6);
            cG.append('text')
                .attr('x', centerW / 2).attr('y', clY)
                .attr('text-anchor', 'middle')
                .attr('font-size', 18).attr('font-weight', '800')
                .attr('fill', centerNode.style.textColor)
                .attr('font-family', 'Inter, system-ui, sans-serif')
                .text(centerNode.label);

            if (centerNode.description) {
                const cdY = centerNode.icon ? 84 : centerH / 2 + 16;
                const lines = wrapText(centerNode.description, Math.floor((centerW - 30) / 7));
                lines.slice(0, 2).forEach((line, li) => {
                    cG.append('text')
                        .attr('x', centerW / 2).attr('y', cdY + li * 17)
                        .attr('text-anchor', 'middle')
                        .attr('font-size', 12)
                        .attr('fill', centerNode.style.textColor).attr('opacity', 0.65)
                        .attr('font-family', 'Inter, system-ui, sans-serif')
                        .text(li === 1 && lines.length > 2 ? line.slice(0, -3) + '…' : line);
                });
            }
        }

        // --- Draw satellite nodes ----------------------------------------
        satellites.forEach((node, i) => {
            const pos = satPositions.get(node.id)!;
            const g = svg.append('g')
                .attr('transform', `translate(${pos.x}, ${pos.y})`)
                .attr('filter', 'url(#ce-shadow)')
                .style('cursor', 'pointer');

            g.append('rect')
                .attr('width', satW).attr('height', satH)
                .attr('rx', node.style.borderRadius || 14)
                .attr('fill', node.style.backgroundColor)
                .attr('stroke', node.style.borderColor)
                .attr('stroke-width', 2);

            // Number badge (top-left)
            const badgeVal = node.badge || `${i + 1}`;
            const bSize = 24;
            const bG = g.append('g').attr('transform', 'translate(10, 10)');
            bG.append('circle')
                .attr('cx', bSize / 2).attr('cy', bSize / 2).attr('r', bSize / 2)
                .attr('fill', node.badgeColor || node.style.borderColor).attr('opacity', 0.2);
            bG.append('text')
                .attr('x', bSize / 2).attr('y', bSize / 2 + 1)
                .attr('text-anchor', 'middle').attr('dominant-baseline', 'central')
                .attr('font-size', 11).attr('font-weight', '700')
                .attr('fill', node.badgeColor || node.style.borderColor)
                .attr('font-family', 'Inter, system-ui, sans-serif')
                .text(badgeVal);

            // Icon
            if (node.icon) {
                g.append('text')
                    .attr('x', satW - 20).attr('y', 28)
                    .attr('text-anchor', 'middle')
                    .attr('font-size', 20)
                    .text(node.icon);
            }

            // Label
            const lY = 32 + bSize / 2;
            g.append('text')
                .attr('x', 14).attr('y', lY)
                .attr('font-size', node.style.fontSize || 13)
                .attr('font-weight', '700')
                .attr('fill', node.style.textColor)
                .attr('font-family', 'Inter, system-ui, sans-serif')
                .text(truncate(node.label, satW - 40));

            // Description
            if (node.description) {
                const dY = lY + 18;
                const ml = Math.floor((satW - 28) / 6.5);
                const lines = wrapText(node.description, ml);
                lines.slice(0, 2).forEach((line, li) => {
                    g.append('text')
                        .attr('x', 14).attr('y', dY + li * 16)
                        .attr('font-size', 10)
                        .attr('fill', node.style.textColor).attr('opacity', 0.6)
                        .attr('font-family', 'Inter, system-ui, sans-serif')
                        .text(li === 1 && lines.length > 2 ? line.slice(0, -3) + '…' : line);
                });
            }

            // Hover
            g.on('mouseenter', function () {
                d3.select(this).transition().duration(200)
                    .attr('transform', `translate(${pos.x}, ${pos.y - 4})`);
            })
                .on('mouseleave', function () {
                    d3.select(this).transition().duration(200)
                        .attr('transform', `translate(${pos.x}, ${pos.y})`);
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
