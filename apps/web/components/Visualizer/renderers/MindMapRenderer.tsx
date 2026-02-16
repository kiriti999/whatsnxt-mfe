'use client';

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { DiagramData, DiagramNode, DiagramEdge } from '../types';

interface MindMapRendererProps {
    data: DiagramData;
    width: number;
    height: number;
}

/**
 * Mind Map Renderer — hierarchical tree branching from a central node.
 *
 * Uses D3 tree layout to compute positions. The root node is rendered as a
 * large prominent card, with branches radiating outward. Edges use smooth
 * cubic Bézier curves. Multiple depth levels are supported.
 */
export const MindMapRenderer: React.FC<MindMapRendererProps> = ({ data, width, height }) => {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!svgRef.current || !data?.nodes?.length) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        const nodes = data.nodes;
        const edges = data.edges || [];

        // Build hierarchy from edges
        const hierarchy = buildHierarchy(nodes, edges);
        const root = d3.hierarchy(hierarchy);

        // Layout dimensions
        const padding = 60;
        const nodeW = 180;
        const nodeH = 60;
        const titleOff = data.subtitle ? 92 : 72;

        // Compute tree layout
        const leafCount = root.leaves().length;
        const treeHeight = Math.max(400, leafCount * (nodeH + 20));
        const depthCount = root.height + 1;
        const treeWidth = Math.max(600, depthCount * (nodeW + 80));

        const treeLayout = d3.tree<HierarchyNode>()
            .size([treeHeight, treeWidth - nodeW]);

        treeLayout(root);

        // Compute bounds
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        root.each((d) => {
            minX = Math.min(minX, d.x);
            maxX = Math.max(maxX, d.x);
            minY = Math.min(minY, d.y);
            maxY = Math.max(maxY, d.y);
        });

        const totalW = (maxY - minY) + nodeW + padding * 2;
        const totalH = (maxX - minX) + nodeH + titleOff + padding * 2;
        const offsetX = -minX + titleOff + padding;
        const offsetY = -minY + padding;

        svg.attr('viewBox', `0 0 ${totalW} ${totalH}`)
            .attr('width', '100%')
            .attr('preserveAspectRatio', 'xMidYMid meet');

        const defs = svg.append('defs');
        const textColor = getTextColor(data.backgroundColor);

        // Shadow filter
        const filter = defs.append('filter')
            .attr('id', 'mm-shadow')
            .attr('x', '-10%').attr('y', '-10%')
            .attr('width', '130%').attr('height', '130%');
        filter.append('feDropShadow')
            .attr('dx', 0).attr('dy', 3)
            .attr('stdDeviation', 5)
            .attr('flood-color', '#000')
            .attr('flood-opacity', 0.08);

        // Background
        svg.append('rect')
            .attr('width', totalW).attr('height', totalH)
            .attr('fill', data.backgroundColor || '#ffffff')
            .attr('rx', 16);

        // Title
        renderTitle(svg, data, totalW, textColor);

        // Draw links (curved)
        const linkGenerator = d3.linkHorizontal<d3.HierarchyPointLink<HierarchyNode>, d3.HierarchyPointNode<HierarchyNode>>()
            .x((d) => d.y + offsetY)
            .y((d) => d.x + offsetX);

        const links = root.links() as unknown as d3.HierarchyPointLink<HierarchyNode>[];
        links.forEach((link) => {
            const sourceNode = findOriginalNode(nodes, link.source.data.id);
            const color = sourceNode?.style.borderColor || '#94a3b8';

            svg.append('path')
                .attr('d', linkGenerator(link) || '')
                .attr('fill', 'none')
                .attr('stroke', color)
                .attr('stroke-width', Math.max(1.5, 3 - link.source.depth))
                .attr('stroke-opacity', 0.4);
        });

        // Draw nodes
        root.each((d) => {
            const origNode = findOriginalNode(nodes, d.data.id);
            if (!origNode) return;

            const isRoot = d.depth === 0;
            const nw = isRoot ? nodeW + 40 : nodeW;
            const nh = isRoot ? nodeH + 20 : nodeH;
            const nx = d.y + offsetY - (isRoot ? 20 : 0);
            const ny = d.x + offsetX - nh / 2;

            const g = svg.append('g')
                .attr('transform', `translate(${nx}, ${ny})`)
                .attr('filter', 'url(#mm-shadow)')
                .style('cursor', 'pointer');

            // Node background
            if (isRoot) {
                const gradId = 'mm-root-grad';
                const grad = defs.append('linearGradient')
                    .attr('id', gradId)
                    .attr('x1', '0%').attr('y1', '0%')
                    .attr('x2', '100%').attr('y2', '100%');
                grad.append('stop').attr('offset', '0%')
                    .attr('stop-color', origNode.style.backgroundColor);
                grad.append('stop').attr('offset', '100%')
                    .attr('stop-color', origNode.style.borderColor);

                g.append('rect')
                    .attr('width', nw).attr('height', nh)
                    .attr('rx', 16)
                    .attr('fill', `url(#${gradId})`)
                    .attr('stroke', origNode.style.borderColor)
                    .attr('stroke-width', 3);
            } else {
                g.append('rect')
                    .attr('width', nw).attr('height', nh)
                    .attr('rx', origNode.style.borderRadius || 10)
                    .attr('fill', origNode.style.backgroundColor)
                    .attr('stroke', origNode.style.borderColor)
                    .attr('stroke-width', 1.5);
            }

            // Depth indicator (left accent)
            if (!isRoot) {
                g.append('rect')
                    .attr('x', 0).attr('y', 0)
                    .attr('width', 4).attr('height', nh)
                    .attr('rx', 2)
                    .attr('fill', origNode.style.borderColor);
            }

            // Icon
            const contentX = isRoot ? nw / 2 : 14;
            let labelY = nh / 2;

            if (origNode.icon) {
                if (isRoot) {
                    g.append('text')
                        .attr('x', nw / 2).attr('y', 24)
                        .attr('text-anchor', 'middle')
                        .attr('font-size', 24)
                        .text(origNode.icon);
                    labelY = nh / 2 + 10;
                } else {
                    g.append('text')
                        .attr('x', 14).attr('y', 14)
                        .attr('font-size', 16)
                        .text(origNode.icon);
                }
            }

            // Label
            const fontSize = isRoot ? 16 : (origNode.style.fontSize || 12);
            g.append('text')
                .attr('x', isRoot ? nw / 2 : 14)
                .attr('y', origNode.description ? labelY - 4 : labelY + 4)
                .attr('text-anchor', isRoot ? 'middle' : 'start')
                .attr('dominant-baseline', origNode.description ? 'auto' : 'central')
                .attr('font-size', fontSize)
                .attr('font-weight', isRoot ? '800' : '700')
                .attr('fill', origNode.style.textColor)
                .attr('font-family', 'Inter, system-ui, sans-serif')
                .text(truncate(origNode.label, nw - 20));

            // Description (compact)
            if (origNode.description) {
                const descMaxChar = Math.floor((nw - 20) / 6);
                const descLine = origNode.description.length > descMaxChar
                    ? origNode.description.substring(0, descMaxChar - 2) + '…'
                    : origNode.description;
                g.append('text')
                    .attr('x', isRoot ? nw / 2 : 14)
                    .attr('y', labelY + 12)
                    .attr('text-anchor', isRoot ? 'middle' : 'start')
                    .attr('font-size', 10)
                    .attr('fill', origNode.style.textColor).attr('opacity', 0.6)
                    .attr('font-family', 'Inter, system-ui, sans-serif')
                    .text(descLine);
            }

            // Hover
            g.on('mouseenter', function () {
                d3.select(this).transition().duration(200)
                    .attr('transform', `translate(${nx}, ${ny - 3})`);
            }).on('mouseleave', function () {
                d3.select(this).transition().duration(200)
                    .attr('transform', `translate(${nx}, ${ny})`);
            });
        });

    }, [data, width, height]);

    return <svg ref={svgRef} style={{ width: '100%', height: '100%', minHeight: 400 }} />;
};

// --- hierarchy builder -------------------------------------------------

interface HierarchyNode {
    id: string;
    children: HierarchyNode[];
}

function buildHierarchy(nodes: DiagramNode[], edges: DiagramEdge[]): HierarchyNode {
    const nodeMap = new Map<string, HierarchyNode>();
    const childIds = new Set<string>();

    for (const node of nodes) {
        nodeMap.set(node.id, { id: node.id, children: [] });
    }

    for (const edge of edges) {
        const parent = nodeMap.get(edge.source);
        const child = nodeMap.get(edge.target);
        if (parent && child) {
            parent.children.push(child);
            childIds.add(edge.target);
        }
    }

    // Find root (node not referenced as a child)
    const rootId = nodes.find(n => !childIds.has(n.id))?.id || nodes[0].id;
    return nodeMap.get(rootId) || { id: rootId, children: [] };
}

function findOriginalNode(nodes: DiagramNode[], id: string): DiagramNode | undefined {
    return nodes.find(n => n.id === id);
}

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
