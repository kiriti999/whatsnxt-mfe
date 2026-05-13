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
 * Supports single tree or two side-by-side trees (for comparisons).
 * Detects multiple root nodes automatically and renders them in parallel columns.
 */
export const MindMapRenderer: React.FC<MindMapRendererProps> = ({ data, width, height }) => {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!svgRef.current || !data?.nodes?.length) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        const nodes = data.nodes;
        const edges = data.edges || [];

        const defs = svg.append('defs');
        const textColor = getTextColor(data.backgroundColor);
        const padding = 60;
        const nodeW = 180;
        const nodeH = 60;
        const titleOff = data.subtitle ? 92 : 72;

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

        // Detect roots (nodes not referenced as edge targets)
        const childIds = new Set(edges.map(e => e.target));
        const roots = nodes.filter(n => !childIds.has(n.id));
        const isDual = roots.length >= 2;

        if (isDual) {
            renderDualMindMaps(svg, defs, data, nodes, edges, roots, { padding, nodeW, nodeH, titleOff, textColor });
        } else {
            renderSingleMindMap(svg, defs, data, nodes, edges, { padding, nodeW, nodeH, titleOff, textColor });
        }

    }, [data, width, height]);

    return <svg ref={svgRef} style={{ width: '100%', height: '100%', minHeight: 400 }} />;
};

interface RenderOpts {
    padding: number;
    nodeW: number;
    nodeH: number;
    titleOff: number;
    textColor: string;
}

function renderSingleMindMap(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    defs: d3.Selection<SVGDefsElement, unknown, null, undefined>,
    data: DiagramData,
    nodes: DiagramNode[],
    edges: DiagramEdge[],
    opts: RenderOpts,
) {
    const { padding, nodeW, nodeH, titleOff, textColor } = opts;
    const hierarchy = buildHierarchy(nodes, edges);
    const root = d3.hierarchy(hierarchy);

    const leafCount = root.leaves().length;
    const treeH = Math.max(400, leafCount * (nodeH + 20));
    const depthCount = root.height + 1;
    const treeW = Math.max(600, depthCount * (nodeW + 80));

    d3.tree<HierarchyNode>().size([treeH, treeW - nodeW])(root);

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    root.each((d) => {
        minX = Math.min(minX, d.x); maxX = Math.max(maxX, d.x);
        minY = Math.min(minY, d.y); maxY = Math.max(maxY, d.y);
    });

    const totalW = (maxY - minY) + nodeW + padding * 2;
    const totalH = (maxX - minX) + nodeH + titleOff + padding * 2;
    const offsetX = -minX + titleOff + padding;
    const offsetY = -minY + padding;

    svg.attr('viewBox', `0 0 ${totalW} ${totalH}`)
        .attr('width', '100%')
        .attr('preserveAspectRatio', 'xMidYMid meet');

    svg.append('rect').attr('width', totalW).attr('height', totalH)
        .attr('fill', data.backgroundColor || '#ffffff').attr('rx', 16);

    renderTitle(svg, data, totalW, textColor);
    renderTreeLinks(svg, root, nodes, offsetX, offsetY);
    renderTreeNodes(svg, defs, root, nodes, offsetX, offsetY, nodeW, nodeH);
}

function renderDualMindMaps(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    defs: d3.Selection<SVGDefsElement, unknown, null, undefined>,
    data: DiagramData,
    nodes: DiagramNode[],
    edges: DiagramEdge[],
    roots: DiagramNode[],
    opts: RenderOpts,
) {
    const { padding, nodeW, nodeH, titleOff, textColor } = opts;

    // Split nodes and edges into two trees by root
    const trees = roots.slice(0, 2).map(rootNode => {
        const treeNodeIds = getSubtreeIds(rootNode.id, edges);
        const treeNodes = nodes.filter(n => treeNodeIds.has(n.id));
        const treeEdges = edges.filter(e => treeNodeIds.has(e.source) && treeNodeIds.has(e.target));
        return { rootNode, treeNodes, treeEdges };
    });

    // Compute layout for each tree separately
    const layouts = trees.map(({ treeNodes, treeEdges }) => {
        const hierarchy = buildHierarchy(treeNodes, treeEdges);
        const root = d3.hierarchy(hierarchy);
        const leafCount = Math.max(1, root.leaves().length);
        const treeH = Math.max(400, leafCount * (nodeH + 20));
        const depthCount = root.height + 1;
        const treeW = Math.max(500, depthCount * (nodeW + 80));
        d3.tree<HierarchyNode>().size([treeH, treeW - nodeW])(root);
        return root;
    });

    // Measure each tree
    const bounds = layouts.map(root => {
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        root.each(d => {
            minX = Math.min(minX, d.x); maxX = Math.max(maxX, d.x);
            minY = Math.min(minY, d.y); maxY = Math.max(maxY, d.y);
        });
        return { minX, maxX, minY, maxY,
            w: (maxY - minY) + nodeW + padding * 2,
            h: (maxX - minX) + nodeH + padding * 2,
        };
    });

    const gapBetween = 60;
    const totalW = bounds[0].w + bounds[1].w + gapBetween;
    const totalH = Math.max(bounds[0].h, bounds[1].h) + titleOff + padding;

    svg.attr('viewBox', `0 0 ${totalW} ${totalH}`)
        .attr('width', '100%')
        .attr('preserveAspectRatio', 'xMidYMid meet');

    svg.append('rect').attr('width', totalW).attr('height', totalH)
        .attr('fill', data.backgroundColor || '#ffffff').attr('rx', 16);

    renderTitle(svg, data, totalW, textColor);

    // Draw a vertical divider
    svg.append('line')
        .attr('x1', bounds[0].w + gapBetween / 2)
        .attr('y1', titleOff)
        .attr('x2', bounds[0].w + gapBetween / 2)
        .attr('y2', totalH - padding)
        .attr('stroke', '#e5e7eb')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '6,4');

    // Render each tree with horizontal offset
    layouts.forEach((root, i) => {
        const b = bounds[i];
        const xShift = i === 0 ? 0 : bounds[0].w + gapBetween;
        const offsetX = -b.minX + titleOff + padding;
        const offsetY = -b.minY + padding + xShift; // note: tree is rotated (x→y, y→x)

        // For side-by-side: tree i is shifted in y by xShift
        const treeNodes = trees[i].treeNodes;
        renderTreeLinks(svg, root, nodes, offsetX, offsetY - xShift, xShift);
        renderTreeNodes(svg, defs, root, nodes, offsetX, offsetY - xShift, nodeW, nodeH, xShift);

        // Column label
        svg.append('text')
            .attr('x', xShift + bounds[i].w / 2)
            .attr('y', titleOff - 10)
            .attr('text-anchor', 'middle')
            .attr('font-size', 13)
            .attr('font-weight', '600')
            .attr('fill', trees[i].rootNode.style.borderColor || '#64748b')
            .attr('font-family', 'Inter, system-ui, sans-serif')
            .text(trees[i].rootNode.label);
    });
}

function renderTreeLinks(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    root: d3.HierarchyNode<HierarchyNode>,
    nodes: DiagramNode[],
    offsetX: number,
    offsetY: number,
    xShift = 0,
) {
    const linkGen = d3.linkHorizontal<d3.HierarchyPointLink<HierarchyNode>, d3.HierarchyPointNode<HierarchyNode>>()
        .x(d => (d as any).y + offsetY + xShift)
        .y(d => (d as any).x + offsetX);

    const links = root.links() as unknown as d3.HierarchyPointLink<HierarchyNode>[];
    links.forEach(link => {
        const sourceNode = findOriginalNode(nodes, link.source.data.id);
        const color = sourceNode?.style.borderColor || '#94a3b8';
        svg.append('path')
            .attr('data-edge-id', `mm-${link.source.data.id}-${link.target.data.id}`)
            .attr('d', linkGen(link) || '')
            .attr('fill', 'none')
            .attr('stroke', color)
            .attr('stroke-width', Math.max(1.5, 3 - link.source.depth))
            .attr('stroke-opacity', 0.4);
    });
}

function renderTreeNodes(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    defs: d3.Selection<SVGDefsElement, unknown, null, undefined>,
    root: d3.HierarchyNode<HierarchyNode>,
    nodes: DiagramNode[],
    offsetX: number,
    offsetY: number,
    nodeW: number,
    nodeH: number,
    xShift = 0,
) {
    root.each(d => {
        const origNode = findOriginalNode(nodes, d.data.id);
        if (!origNode) return;

        const isRoot = d.depth === 0;
        const nw = isRoot ? nodeW + 40 : nodeW;
        const nh = isRoot ? nodeH + 20 : nodeH;
        const nx = (d as any).y + offsetY + xShift - (isRoot ? 20 : 0);
        const ny = (d as any).x + offsetX - nh / 2;

        const g = svg.append('g')
            .attr('data-node-id', origNode.id)
            .attr('transform', `translate(${nx}, ${ny})`)
            .attr('filter', 'url(#mm-shadow)')
            .style('cursor', 'pointer');

        if (isRoot) {
            const gradId = `mm-root-grad-${origNode.id}`;
            const grad = defs.append('linearGradient')
                .attr('id', gradId).attr('x1', '0%').attr('y1', '0%')
                .attr('x2', '100%').attr('y2', '100%');
            grad.append('stop').attr('offset', '0%').attr('stop-color', origNode.style.backgroundColor);
            grad.append('stop').attr('offset', '100%').attr('stop-color', origNode.style.borderColor);
            g.append('rect').attr('width', nw).attr('height', nh).attr('rx', 16)
                .attr('fill', `url(#${gradId})`).attr('stroke', origNode.style.borderColor).attr('stroke-width', 3);
        } else {
            g.append('rect').attr('width', nw).attr('height', nh)
                .attr('rx', origNode.style.borderRadius || 10)
                .attr('fill', origNode.style.backgroundColor)
                .attr('stroke', origNode.style.borderColor).attr('stroke-width', 1.5);
            g.append('rect').attr('x', 0).attr('y', 0).attr('width', 4).attr('height', nh)
                .attr('rx', 2).attr('fill', origNode.style.borderColor);
        }

        let labelY = nh / 2;
        if (origNode.icon) {
            if (isRoot) {
                g.append('text').attr('x', nw / 2).attr('y', 24)
                    .attr('text-anchor', 'middle').attr('font-size', 24).text(origNode.icon);
                labelY = nh / 2 + 10;
            } else {
                g.append('text').attr('x', 14).attr('y', 14).attr('font-size', 16).text(origNode.icon);
            }
        }

        const fontSize = isRoot ? 16 : (origNode.style.fontSize || 12);
        g.append('text')
            .attr('x', isRoot ? nw / 2 : 14)
            .attr('y', origNode.description ? labelY - 4 : labelY + 4)
            .attr('text-anchor', isRoot ? 'middle' : 'start')
            .attr('dominant-baseline', origNode.description ? 'auto' : 'central')
            .attr('font-size', fontSize).attr('font-weight', isRoot ? '800' : '700')
            .attr('fill', origNode.style.textColor).attr('font-family', 'Inter, system-ui, sans-serif')
            .text(truncate(origNode.label, nw - 20));

        if (origNode.description) {
            const maxChar = Math.floor((nw - 20) / 6);
            const line = origNode.description.length > maxChar
                ? origNode.description.substring(0, maxChar - 2) + '…'
                : origNode.description;
            g.append('text')
                .attr('x', isRoot ? nw / 2 : 14)
                .attr('y', labelY + 12)
                .attr('text-anchor', isRoot ? 'middle' : 'start')
                .attr('font-size', 10).attr('fill', origNode.style.textColor).attr('opacity', 0.6)
                .attr('font-family', 'Inter, system-ui, sans-serif').text(line);
        }

        g.on('mouseenter', function () {
            d3.select(this).transition().duration(200).attr('transform', `translate(${nx}, ${ny - 3})`);
        }).on('mouseleave', function () {
            d3.select(this).transition().duration(200).attr('transform', `translate(${nx}, ${ny})`);
        });
    });
}

function getSubtreeIds(rootId: string, edges: DiagramEdge[]): Set<string> {
    const ids = new Set<string>([rootId]);
    const queue = [rootId];
    while (queue.length) {
        const current = queue.shift()!;
        for (const edge of edges) {
            if (edge.source === current && !ids.has(edge.target)) {
                ids.add(edge.target);
                queue.push(edge.target);
            }
        }
    }
    return ids;
}

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
    // Use subtitle as main title (skip diagram type prefix)
    if (data.subtitle) {
        svg.append('text')
            .attr('x', totalW / 2).attr('y', 44)
            .attr('text-anchor', 'middle')
            .attr('font-size', 22).attr('font-weight', '700')
            .attr('fill', textColor)
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
