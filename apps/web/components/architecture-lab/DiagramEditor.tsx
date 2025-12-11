'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { architecturalShapes, NodeType } from '../../utils/lab-utils';
import { Button, Group, Paper as MantinePaper, Text, Divider, useComputedColorScheme, ActionIcon, Tooltip } from '@mantine/core';
import { IconZoomReset } from '@tabler/icons-react';

interface LinkType {
    source: string; // ID
    target: string; // ID
    waypoints?: { x: number; y: number }[]; // Custom waypoints for path (optional)
}

interface DiagramEditorProps {
    initialGraph?: any;
    mode: 'instructor' | 'student';
    onGraphChange?: (json: any) => void;
    className?: string;
}

const DiagramEditor: React.FC<DiagramEditorProps> = ({
    initialGraph,
    mode,
    onGraphChange,
    className
}) => {
    const computedColorScheme = useComputedColorScheme('light');
    const svgRef = useRef<SVGSVGElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
    const lastClickTimeRef = useRef<number>(0); // For double-click detection

    // State
    const [nodes, setNodes] = useState<NodeType[]>([]);
    const [links, setLinks] = useState<LinkType[]>([]);

    // Ref to always have access to latest nodes (for D3 drag callbacks)
    const nodesRef = useRef<NodeType[]>(nodes);
    nodesRef.current = nodes;

    // Interaction State
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [selectedLinkIndex, setSelectedLinkIndex] = useState<number | null>(null);
    const [tempLink, setTempLink] = useState<{ x1: number, y1: number, x2: number, y2: number } | null>(null);

    const [history, setHistory] = useState<{ nodes: NodeType[], links: LinkType[] }[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);

    // Text Editing State
    const [editingNode, setEditingNode] = useState<{ id: string, label: string, x: number, y: number, width: number, height: number } | null>(null);

    // Save history
    const saveToHistory = useCallback((newNodes: NodeType[], newLinks: LinkType[]) => {
        const entry = { nodes: JSON.parse(JSON.stringify(newNodes)), links: JSON.parse(JSON.stringify(newLinks)) };
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(entry);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    }, [history, historyIndex]);

    // Better approach:
    // 1. Ref to track the stringified version of what we have currently.
    // 2. Ref to track what we emitted.

    const prevGraphStr = useRef<string>("");

    useEffect(() => {
        if (initialGraph) {
            const nextStr = JSON.stringify(initialGraph);
            // If the incoming graph is different from what we thought we had...
            if (nextStr !== prevGraphStr.current) {
                setNodes(initialGraph.nodes || []);
                setLinks(initialGraph.links || []);
                prevGraphStr.current = nextStr;
            }
        }
    }, [initialGraph]);

    // Notify parent of changes
    useEffect(() => {
        if (onGraphChange) {
            const currentStr = JSON.stringify({ nodes, links });
            // Only emit if different from what we last thought we had (or what we last got)
            if (currentStr !== prevGraphStr.current) {
                prevGraphStr.current = currentStr; // Update our "known state"
                onGraphChange({ nodes, links });
            }
        }
    }, [nodes, links, onGraphChange]);


    // D3 Render Logic
    useEffect(() => {
        console.log('D3 useEffect running, nodes:', nodes.length);
        nodes.forEach((n, i) => console.log(`  Node[${i}]`, n.id, 'dimensions:', n.width, 'x', n.height));
        if (!svgRef.current) return;
        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove(); // Clear canvas

        const width = 800; // Fixed inner width or dynamic
        const height = 600;

        // Define Arrow Markers
        const defs = svg.append('defs');
        defs.append('marker')
            .attr('id', 'arrow')
            .attr('viewBox', '0 -5 10 10')
            .attr('refX', 8) // adjusted for connection
            .attr('refY', 0)
            .attr('markerWidth', 6)
            .attr('markerHeight', 6)
            .attr('orient', 'auto')
            .append('path')
            .attr('d', 'M0,-5L10,0L0,5')
            .attr('fill', computedColorScheme === 'dark' ? '#FFF' : '#333');

        defs.append('marker')
            .attr('id', 'arrow-temp')
            .attr('viewBox', '0 -5 10 10')
            .attr('refX', 8)
            .attr('refY', 0)
            .attr('markerWidth', 6)
            .attr('markerHeight', 6)
            .attr('orient', 'auto')
            .append('path')
            .attr('d', 'M0,-5L10,0L0,5')
            .attr('fill', 'blue');

        // Main Group for Zoom
        const g = svg.append('g');

        // Layers
        const containerLayer = g.append('g').attr('class', 'layer-containers');
        const linkLayer = g.append('g').attr('class', 'layer-links');
        const nodeLayer = g.append('g').attr('class', 'layer-nodes');

        // Zoom Behavior
        const zoom = d3.zoom<SVGSVGElement, unknown>()
            .scaleExtent([0.1, 4])
            .on('zoom', (event) => {
                g.attr('transform', event.transform);
            });

        zoomRef.current = zoom;

        svg.call(zoom).on('dblclick.zoom', null);

        // State for drag
        let dragStartPos = { x: 0, y: 0 };
        let hasDragged = false;
        let containedNodesState: { id: string; startX: number; startY: number }[] = [];

        // 1. Node Drag Definition
        const nodeDrag = d3.drag<SVGGElement, NodeType>()
            .filter(event => !event.ctrlKey && !event.button)
            .on('start', (event, d) => {
                event.sourceEvent.stopPropagation();
                dragStartPos = { x: event.x, y: event.y };
                hasDragged = false;
                d3.select(event.sourceEvent.target).attr('cursor', 'grabbing');

                // If container, identify contained nodes
                const currentNodes = nodesRef.current;
                containedNodesState = [];
                if (['pool', 'group', 'zone', 'container'].includes(d.type || '')) {
                    const containerRect = { x: d.x || 0, y: d.y || 0, w: d.width, h: d.height };
                    currentNodes.forEach(n => {
                        if (n.id !== d.id && n.x && n.y) {
                            const isInside =
                                n.x >= containerRect.x &&
                                n.y >= containerRect.y &&
                                (n.x + n.width) <= (containerRect.x + containerRect.w) &&
                                (n.y + n.height) <= (containerRect.y + containerRect.h);

                            if (isInside) {
                                containedNodesState.push({ id: n.id!, startX: n.x, startY: n.y });
                            }
                        }
                    });
                }
            })
            .on('drag', (event, d) => {
                const dx = Math.abs(event.x - dragStartPos.x);
                const dy = Math.abs(event.y - dragStartPos.y);
                if (dx > 3 || dy > 3) hasDragged = true;

                const moveDx = event.dx;
                const moveDy = event.dy;
                d.x = event.x;
                d.y = event.y;

                d3.select(event.sourceEvent.target.parentNode).attr('transform', `translate(${d.x},${d.y})`);

                if (containedNodesState.length > 0) {
                    containedNodesState.forEach(item => {
                        const childNode = nodesRef.current.find(n => n.id === item.id);
                        if (childNode) {
                            childNode.x = (childNode.x || 0) + moveDx;
                            childNode.y = (childNode.y || 0) + moveDy;
                            d3.select(`#node-${childNode.id}`).attr('transform', `translate(${childNode.x},${childNode.y})`);
                        }
                    });
                }
            })
            .on('end', (event, d) => {
                d3.select(event.sourceEvent.target).attr('cursor', 'grab');
                if (!hasDragged) {
                    const now = Date.now();
                    const isDoubleClick = (now - lastClickTimeRef.current) < 300;
                    lastClickTimeRef.current = now;

                    if (isDoubleClick) {
                        const nodeGroup = document.getElementById(`node-${d.id}`);
                        const wrapperRect = wrapperRef.current?.getBoundingClientRect();
                        if (nodeGroup && wrapperRect) {
                            const nodeRect = nodeGroup.getBoundingClientRect();
                            const screenX = nodeRect.left - wrapperRect.left + nodeRect.width / 2;
                            const screenY = nodeRect.top - wrapperRect.top + nodeRect.height / 2;
                            setEditingNode({
                                id: d.id!, label: d.label, x: screenX, y: screenY, width: d.width, height: d.height
                            });
                        }
                    } else {
                        setSelectedNodeId(prev => prev === d.id ? null : d.id!);
                    }
                } else {
                    const updatedNodes = nodesRef.current.map(n => {
                        if (n.id === d.id) return { ...n, x: d.x, y: d.y };
                        const contained = containedNodesState.find(c => c.id === n.id);
                        if (contained && n.x && n.y) return { ...n, x: n.x, y: n.y };
                        return n;
                    });
                    setNodes(updatedNodes);
                    saveToHistory(updatedNodes, links);
                    containedNodesState = [];
                }
            });

        // 2. Link Drag Definition
        // We use a local variable to hold the temp line, NOT React state
        let tempLinkLine: d3.Selection<SVGLineElement, unknown, null, undefined> | null = null;

        const linkDrag = d3.drag<SVGCircleElement, NodeType>()
            .on('start', (event, d) => {
                event.sourceEvent.stopPropagation();
                const startX = (d.x || 0) + d.width / 2;
                const startY = (d.y || 0) + d.height / 2;

                tempLinkLine = linkLayer.append('line') // Render into linkLayer
                    .attr('x1', startX)
                    .attr('y1', startY)
                    .attr('x2', startX)
                    .attr('y2', startY)
                    .attr('stroke', 'blue')
                    .attr('stroke-width', 2)
                    .attr('stroke-dasharray', '5,5')
                    .attr('marker-end', 'url(#arrow-temp)')
                    .style('pointer-events', 'none');
            })
            .on('drag', (event, d) => {
                if (!tempLinkLine) return;
                const [mx, my] = d3.pointer(event, g.node());
                const startX = (d.x || 0) + d.width / 2;
                const startY = (d.y || 0) + d.height / 2;
                tempLinkLine.attr('x1', startX).attr('y1', startY).attr('x2', mx).attr('y2', my);
            })
            .on('end', (event, d) => {
                if (tempLinkLine) {
                    tempLinkLine.remove();
                    tempLinkLine = null;
                }

                const [mx, my] = d3.pointer(event, g.node());
                const PADDING = 20;

                const candidates = nodes.filter(n =>
                    n.id !== d.id &&
                    mx >= (n.x || 0) - PADDING && mx <= (n.x || 0) + n.width + PADDING &&
                    my >= (n.y || 0) - PADDING && my <= (n.y || 0) + n.height + PADDING
                );

                candidates.sort((a, b) => {
                    const isContainerA = ['pool', 'group', 'zone', 'container'].includes(a.type || '');
                    const isContainerB = ['pool', 'group', 'zone', 'container'].includes(b.type || '');
                    if (isContainerA && !isContainerB) return 1;
                    if (!isContainerA && isContainerB) return -1;
                    const areaA = a.width * a.height;
                    const areaB = b.width * b.height;
                    return areaA - areaB;
                });

                const targetNode = candidates.length > 0 ? candidates[0] : undefined;

                if (targetNode) {
                    const newLink = { source: d.id!, target: targetNode.id! };
                    if (!links.some(l => (l.source === newLink.source && l.target === newLink.target))) {
                        const newLinks = [...links, newLink];
                        setLinks(newLinks);
                        saveToHistory(nodes, newLinks);
                    }
                }
            });

        // 3. Resize Drag Definition
        let resizeStartInfo: any = null;
        const resizeDrag = d3.drag<SVGCircleElement, unknown>()
            .on('start', function (event) {
                event.sourceEvent.stopPropagation();
                const corner = d3.select(this).attr('data-corner');
                const nodeId = d3.select(this).attr('data-node-id');
                const node = nodes.find(n => n.id === nodeId);
                if (node) {
                    const [mx, my] = d3.pointer(event, g.node());
                    resizeStartInfo = {
                        nodeId, corner,
                        origWidth: node.width, origHeight: node.height,
                        origX: node.x || 0, origY: node.y || 0,
                        startMouseX: mx, startMouseY: my,
                        finalWidth: node.width, finalHeight: node.height,
                        finalX: node.x || 0, finalY: node.y || 0,
                    };
                }
            })
            .on('drag', function (event) {
                if (!resizeStartInfo) return;
                const [mx, my] = d3.pointer(event, g.node());
                const dx = mx - resizeStartInfo.startMouseX;
                const dy = my - resizeStartInfo.startMouseY;
                let newWidth = resizeStartInfo.origWidth;
                let newHeight = resizeStartInfo.origHeight;
                let newX = resizeStartInfo.origX;
                let newY = resizeStartInfo.origY;
                const minSize = 40;

                switch (resizeStartInfo.corner) {
                    case 'se': newWidth = Math.max(minSize, resizeStartInfo.origWidth + dx); newHeight = Math.max(minSize, resizeStartInfo.origHeight + dy); break;
                    case 'sw': newWidth = Math.max(minSize, resizeStartInfo.origWidth - dx); newHeight = Math.max(minSize, resizeStartInfo.origHeight + dy); newX = resizeStartInfo.origX + (resizeStartInfo.origWidth - newWidth); break;
                    case 'ne': newWidth = Math.max(minSize, resizeStartInfo.origWidth + dx); newHeight = Math.max(minSize, resizeStartInfo.origHeight - dy); newY = resizeStartInfo.origY + (resizeStartInfo.origHeight - newHeight); break;
                    case 'nw': newWidth = Math.max(minSize, resizeStartInfo.origWidth - dx); newHeight = Math.max(minSize, resizeStartInfo.origHeight - dy); newX = resizeStartInfo.origX + (resizeStartInfo.origWidth - newWidth); newY = resizeStartInfo.origY + (resizeStartInfo.origHeight - newHeight); break;
                }

                resizeStartInfo.finalWidth = newWidth; resizeStartInfo.finalHeight = newHeight; resizeStartInfo.finalX = newX; resizeStartInfo.finalY = newY;
                const nodeGroup = d3.select(`#node-${resizeStartInfo.nodeId}`);
                nodeGroup.attr('transform', `translate(${newX},${newY})`);
                nodeGroup.select('rect[stroke="blue"]').attr('width', newWidth + 10).attr('height', newHeight + 10);
                nodeGroup.selectAll('.resize-handle').each(function () {
                    const handle = d3.select(this);
                    const corner = handle.attr('data-corner');
                    switch (corner) {
                        case 'nw': handle.attr('cx', 0).attr('cy', 0); break;
                        case 'ne': handle.attr('cx', newWidth).attr('cy', 0); break;
                        case 'sw': handle.attr('cx', 0).attr('cy', newHeight); break;
                        case 'se': handle.attr('cx', newWidth).attr('cy', newHeight); break;
                    }
                });
            })
            .on('end', function () {
                if (resizeStartInfo) {
                    const updatedNodes = nodesRef.current.map(n => {
                        if (n.id === resizeStartInfo.nodeId) {
                            return { ...n, width: resizeStartInfo.finalWidth, height: resizeStartInfo.finalHeight, x: resizeStartInfo.finalX, y: resizeStartInfo.finalY };
                        }
                        return n;
                    });
                    setNodes(updatedNodes);
                    saveToHistory(updatedNodes, links);
                    resizeStartInfo = null;
                }
            });

        // 4. Render Batch Helper
        const renderNodeBatch = (targetLayer: d3.Selection<SVGGElement, unknown, null, undefined>, batchNodes: NodeType[]) => {
            const selection = targetLayer.selectAll<SVGGElement, NodeType>('g')
                .data(batchNodes)
                .enter().append('g')
                .attr('id', d => `node-${d.id}`)
                .attr('transform', d => `translate(${d.x || 0},${d.y || 0})`)
                .attr('cursor', 'grab')
                .on('click', (event, d) => {
                    if (event.detail === 2) {
                        event.stopPropagation();
                        const nodeGroup = document.getElementById(`node-${d.id}`);
                        const wrapperRect = wrapperRef.current?.getBoundingClientRect();
                        if (nodeGroup && wrapperRect) {
                            const nodeRect = nodeGroup.getBoundingClientRect();
                            const screenX = nodeRect.left - wrapperRect.left + nodeRect.width / 2;
                            const screenY = nodeRect.top - wrapperRect.top + nodeRect.height / 2;
                            setEditingNode({ id: d.id!, label: d.label, x: screenX, y: screenY, width: d.width, height: d.height });
                        }
                    } else {
                        setSelectedNodeId(prev => prev === d.id ? null : d.id!);
                    }
                });

            selection.each(function (d) {
                const el = d3.select(this);
                const color = computedColorScheme === 'dark' && d.stroke === '#333' ? '#FFF' : d.stroke;
                const fill = d.fill === 'transparent' ? 'transparent' : d.fill;

                if (['rect', 'group', 'zone'].includes(d.type || '')) {
                    el.append('rect').attr('width', d.width).attr('height', d.height).attr('fill', fill).attr('stroke', color).attr('stroke-width', d.strokeWidth).attr('rx', d.rx || 0).attr('stroke-dasharray', d.strokeDashArray || '');
                } else if (d.type === 'circle') {
                    el.append('circle').attr('cx', d.width / 2).attr('cy', d.height / 2).attr('r', d.width / 2).attr('fill', fill).attr('stroke', color).attr('stroke-width', d.strokeWidth).attr('stroke-dasharray', d.strokeDashArray || '');
                } else if (d.type === 'path' && d.pathData) {
                    el.append('path').attr('d', d.pathData).attr('fill', fill).attr('stroke', color).attr('stroke-width', d.strokeWidth);
                } else if (d.type === 'database') {
                    el.append('path').attr('d', `M0,${d.height * 0.15} v${d.height * 0.7} c0,${d.height * 0.15} ${d.width},${d.height * 0.15} ${d.width},0 v-${d.height * 0.7}`).attr('fill', fill).attr('stroke', color).attr('stroke-width', 2);
                    el.append('ellipse').attr('cx', d.width / 2).attr('cy', d.height * 0.15).attr('rx', d.width / 2).attr('ry', d.height * 0.15).attr('fill', fill).attr('stroke', color).attr('stroke-width', 2);
                    el.append('path').attr('d', `M0,${d.height * 0.15} c0,${d.height * 0.15} ${d.width},${d.height * 0.15} ${d.width},0`).attr('fill', 'none').attr('stroke', color).attr('stroke-width', 2);
                } else if (d.type === 'diamond') {
                    el.append('path').attr('d', `M${d.width / 2},0 L${d.width},${d.height / 2} L${d.width / 2},${d.height} L0,${d.height / 2} Z`).attr('fill', fill).attr('stroke', color).attr('stroke-width', 2);
                } else if (d.type === 'pool') {
                    const headerWidth = 40;
                    el.append('rect').attr('width', d.width).attr('height', d.height).attr('fill', d.fill === 'transparent' ? 'transparent' : d.fill).attr('stroke', color).attr('stroke-width', 2);
                    el.append('rect').attr('x', 0).attr('y', 0).attr('width', headerWidth).attr('height', d.height).attr('fill', '#f0f0f0').attr('stroke', color).attr('stroke-width', 2);
                    el.append('text').text(d.label).attr('x', -d.height / 2).attr('y', headerWidth / 2).attr('transform', 'rotate(-90)').attr('text-anchor', 'middle').attr('dominant-baseline', 'middle').attr('fill', '#000').style('font-size', '14px').style('pointer-events', 'none');
                } else if (d.type === 'cloud') {
                    // Cloud path... retained for simplicity
                    el.append('path').attr('d', `M${d.width * 0.2},${d.height * 0.6} Q${d.width * 0.1},${d.height * 0.4} ${d.width * 0.3},${d.height * 0.3} Q${d.width * 0.4},${d.height * 0.1} ${d.width * 0.6},${d.height * 0.3} Q${d.width * 0.8},${d.height * 0.1} ${d.width * 0.9},${d.height * 0.4} Q${d.width},${d.height * 0.6} ${d.width * 0.8},${d.height * 0.8} Q${d.width * 0.5},${d.height} ${d.width * 0.2},${d.height * 0.8} Q${d.width * 0.1},${d.height * 0.9} ${d.width * 0.2},${d.height * 0.6} Z`).attr('fill', fill).attr('stroke', color).attr('stroke-width', 2);

                } else if (d.type === 'cloud') {
                    // Better cloud path
                    const w = d.width;
                    const h = d.height;
                    const path = `M ${w * 0.2} ${h * 0.6} 
                                   Q ${w * 0.1} ${h * 0.4} ${w * 0.3} ${h * 0.3} 
                                   Q ${w * 0.4} ${h * 0.1} ${w * 0.6} ${h * 0.3} 
                                   Q ${w * 0.8} ${h * 0.1} ${w * 0.9} ${h * 0.4} 
                                   Q ${w} ${h * 0.6} ${w * 0.8} ${h * 0.8} 
                                   Q ${w * 0.5} ${h} ${w * 0.2} ${h * 0.8} 
                                   Q ${w * 0.1} ${h * 0.9} ${w * 0.2} ${h * 0.6} Z`;
                    el.append('path').attr('d', path).attr('fill', fill).attr('stroke', color).attr('stroke-width', 2);

                } else if (d.type === 'heart') {
                    const w = d.width;
                    const h = d.height;
                    const dPath = `
                        M ${w / 2} ${h * 0.3}
                        C ${w / 2} ${h * 0.05}, ${0} ${h * 0.05}, ${0} ${h * 0.4}
                        C ${0} ${h * 0.65}, ${w * 0.3} ${h * 0.8}, ${w / 2} ${h}
                        C ${w * 0.7} ${h * 0.8}, ${w} ${h * 0.65}, ${w} ${h * 0.4}
                        C ${w} ${h * 0.05}, ${w / 2} ${h * 0.05}, ${w / 2} ${h * 0.3}
                        Z
                    `;
                    el.append('path').attr('d', dPath).attr('fill', fill).attr('stroke', color).attr('stroke-width', 2);

                } else if (d.type === 'star') {
                    const w = d.width;
                    const h = d.height;
                    const cx = w / 2;
                    const cy = h / 2;
                    const outerRadius = Math.min(w, h) / 2;
                    const innerRadius = outerRadius / 2;
                    let dPath = "";
                    for (let i = 0; i < 10; i++) {
                        const r = i % 2 === 0 ? outerRadius : innerRadius;
                        const angle = (Math.PI / 5) * i - Math.PI / 2;
                        const x = cx + Math.cos(angle) * r;
                        const y = cy + Math.sin(angle) * r;
                        dPath += (i === 0 ? "M" : "L") + x + "," + y;
                    }
                    dPath += "Z";
                    el.append('path').attr('d', dPath).attr('fill', fill).attr('stroke', color).attr('stroke-width', 2);

                } else if (d.type === 'container') {
                    el.append('rect').attr('x', -5).attr('y', -5).attr('width', d.width + 10).attr('height', d.height + 10).attr('fill', 'none');
                }

                if (selectedNodeId === d.id) {
                    el.append('rect').attr('x', -5).attr('y', -5).attr('width', d.width + 10).attr('height', d.height + 10).attr('fill', 'none').attr('stroke', 'blue').attr('stroke-width', 2).attr('stroke-dasharray', '4,2');
                    const handlePositions = [{ cx: 0, cy: 0, c: 'nw-resize', k: 'nw' }, { cx: d.width, cy: 0, c: 'ne-resize', k: 'ne' }, { cx: 0, cy: d.height, c: 'sw-resize', k: 'sw' }, { cx: d.width, cy: d.height, c: 'se-resize', k: 'se' }];
                    handlePositions.forEach(p => el.append('circle').classed('resize-handle', true).attr('cx', p.cx).attr('cy', p.cy).attr('r', 4).attr('fill', 'white').attr('stroke', 'blue').attr('stroke-width', 2).attr('cursor', p.c).attr('data-corner', p.k).attr('data-node-id', d.id));
                }

                if (d.type !== 'pool') {
                    const fontSize = d.width < 60 ? '11px' : '14px';
                    el.append('foreignObject').attr('x', 4).attr('y', 4).attr('width', d.width - 8).attr('height', d.height - 8).style('pointer-events', 'none').append('xhtml:div').style('width', '100%').style('height', '100%').style('display', 'flex').style('align-items', 'center').style('justify-content', 'center').style('text-align', 'center').style('font-weight', 'bold').style('font-size', fontSize).style('color', d.fill === '#000000' ? '#FFF' : '#333').style('word-wrap', 'break-word').text(d.label);
                }

                // Add Link Handle for non-containers
                if (!['pool', 'group', 'zone'].includes(d.type || '')) {
                    const lh = el.append('circle').classed('link-handle', true).attr('cx', d.width / 2).attr('cy', d.height).attr('r', 8).attr('fill', 'blue').attr('stroke', 'white').attr('stroke-width', 2).attr('opacity', 0).attr('cursor', 'crosshair');
                    el.on('mouseenter', () => { lh.attr('opacity', 1); delIcon.style('display', 'block'); })
                        .on('mouseleave', () => { lh.attr('opacity', 0); delIcon.style('display', 'none'); });
                } else {
                    el.on('mouseenter', () => delIcon.style('display', 'block'))
                        .on('mouseleave', () => delIcon.style('display', 'none'));
                }

                // Delete Icon for Node
                const delIcon = el.append('g')
                    .attr('transform', `translate(${d.width}, -10)`) // Floating slightly above top-right
                    .attr('cursor', 'pointer')
                    .style('display', 'none')
                    .on('mousedown', (e) => e.stopPropagation()) // Prevent node drag from catching this
                    .on('click', (e) => {
                        e.stopPropagation();
                        if (confirm('Delete this node?')) {
                            // Helper to remove node and its links
                            const nodeId = d.id!;
                            const newNodes = nodes.filter(n => n.id !== nodeId);
                            const newLinks = links.filter(l => l.source !== nodeId && l.target !== nodeId);

                            setNodes(newNodes);
                            setLinks(newLinks);
                            saveToHistory(newNodes, newLinks);
                            setSelectedNodeId(null);
                        }
                    });

                delIcon.append('circle')
                    .attr('r', 10)
                    .attr('fill', '#e74c3c')
                    .attr('stroke', '#fff')
                    .attr('stroke-width', 1);

                delIcon.append('text')
                    .attr('text-anchor', 'middle')
                    .attr('dy', '0.35em')
                    .attr('fill', 'white')
                    .attr('font-size', '14px')
                    .attr('font-weight', 'bold')
                    .text('×');

            });
            selection.call(nodeDrag);
        };

        // 5. Execution
        const containerNodes = nodes.filter(n => ['pool', 'group', 'zone'].includes(n.type || ''));
        const regularNodes = nodes.filter(n => !['pool', 'group', 'zone'].includes(n.type || ''));

        renderNodeBatch(containerLayer, containerNodes);
        // Link Rendering (Reuse existing loop context? No we removed it.)
        // We need to re-implement link rendering here or copy it back.
        // Wait, I removed the link logic in Chunk 1. I need to put it back here!

        const linkGroup = linkLayer; // Alias
        // ... Re-paste link rendering ...
        const getWaypointPath = (x1: number, y1: number, x2: number, y2: number, waypoints?: { x: number; y: number }[]) => {
            if (!waypoints || waypoints.length === 0) {
                const midX = (x1 + x2) / 2;
                return { path: `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`, waypoints: [{ x: midX, y: y1 }, { x: midX, y: y2 }] };
            }
            let pathD = `M ${x1} ${y1}`; waypoints.forEach(wp => pathD += ` L ${wp.x} ${wp.y}`); pathD += ` L ${x2} ${y2}`;
            return { path: pathD, waypoints };
        };

        links.forEach((link, i) => {
            const sourceNode = nodes.find(n => n.id === link.source);
            const targetNode = nodes.find(n => n.id === link.target);
            if (!sourceNode || !targetNode) return;
            // ... connection points logic ...
            let sx = sourceNode.x || 0, sy = sourceNode.y || 0, tx = targetNode.x || 0, ty = targetNode.y || 0;
            let x1, y1, x2, y2;
            if (tx > sx + sourceNode.width) { x1 = sx + sourceNode.width; y1 = sy + sourceNode.height / 2; x2 = tx; y2 = ty + targetNode.height / 2; }
            else if (tx + targetNode.width < sx) { x1 = sx; y1 = sy + sourceNode.height / 2; x2 = tx + targetNode.width; y2 = ty + targetNode.height / 2; }
            else if (ty > sy + sourceNode.height) { x1 = sx + sourceNode.width / 2; y1 = sy + sourceNode.height; x2 = tx + targetNode.width / 2; y2 = ty; }
            else { x1 = sx + sourceNode.width / 2; y1 = sy; x2 = tx + targetNode.width / 2; y2 = ty + targetNode.height; }

            const pathResult = getWaypointPath(x1, y1, x2, y2, link.waypoints);
            const isSelected = selectedLinkIndex === i;
            const lw = linkGroup.append('g').attr('class', 'link-wrapper');
            const vp = lw.append('path').attr('d', pathResult.path).attr('class', 'visible-path').attr('stroke', isSelected ? '#3498db' : (computedColorScheme === 'dark' ? '#FFF' : '#333')).attr('stroke-width', isSelected ? 3 : 2).attr('fill', 'none').attr('marker-end', 'url(#arrow)');
            lw.append('path').attr('d', pathResult.path).attr('stroke', 'transparent').attr('stroke-width', 20).attr('fill', 'none').attr('cursor', 'pointer')
                .on('click', (e) => { e.stopPropagation(); setSelectedLinkIndex(isSelected ? null : i); setSelectedNodeId(null); });

            // Delete icon
            const diPos = pathResult.waypoints && pathResult.waypoints.length > 0 ? { x: pathResult.waypoints[0].x, y: pathResult.waypoints[0].y - 20 } : { x: (x1 + x2) / 2, y: (y1 + y2) / 2 };
            const di = lw.append('g').attr('transform', `translate(${diPos.x},${diPos.y})`).attr('cursor', 'pointer').style('display', 'none').on('click', (e) => { e.stopPropagation(); const nl = links.filter((_, idx) => idx !== i); setLinks(nl); setSelectedLinkIndex(null); saveToHistory(nodes, nl); });
            di.append('circle').attr('r', 12).attr('fill', '#e74c3c');
            di.append('text').attr('text-anchor', 'middle').attr('dy', '0.35em').attr('fill', 'white').text('×');

            lw.on('mouseenter', () => { if (!isSelected) vp.attr('stroke', '#3498db').attr('stroke-width', 3); di.style('display', 'block'); })
                .on('mouseleave', () => { if (!isSelected) vp.attr('stroke', computedColorScheme === 'dark' ? '#FFF' : '#333').attr('stroke-width', 2); di.style('display', 'none'); });

            // Waypoint handles
            if (isSelected && pathResult.waypoints) {
                pathResult.waypoints.forEach((wp, wpi) => {
                    const cp = lw.append('circle').attr('cx', wp.x).attr('cy', wp.y).attr('r', 7).attr('fill', '#3498db').attr('stroke', '#FFF').attr('stroke-width', 2).attr('cursor', 'move');
                    const cd = d3.drag<SVGCircleElement, unknown>().on('drag', function (e) {
                        const [mx, my] = d3.pointer(e, g.node());
                        d3.select(this).attr('cx', mx).attr('cy', my);
                        // Reconstruct path locally for drag viz
                        let np = `M ${x1} ${y1}`;
                        pathResult.waypoints!.forEach((w, wi) => { if (wi === wpi) np += ` L ${mx} ${my}`; else np += ` L ${w.x} ${w.y}`; });
                        np += ` L ${x2} ${y2}`;
                        vp.attr('d', np); lw.select('path[stroke="transparent"]').attr('d', np);
                    }).on('end', (e) => {
                        const [mx, my] = d3.pointer(e, g.node());
                        const nl = [...links]; const nw = [...(nl[i].waypoints || [])]; nw[wpi] = { x: mx, y: my };
                        nl[i] = { ...nl[i], waypoints: nw }; setLinks(nl); saveToHistory(nodes, nl);
                    });
                    cp.call(cd);
                });
            }
        });


        renderNodeBatch(nodeLayer, regularNodes);

        g.selectAll('.resize-handle').call(resizeDrag as any);
        g.selectAll('.link-handle').call(linkDrag as any);
    }, [nodes, links, selectedNodeId, selectedLinkIndex, computedColorScheme, setEditingNode]);


    const handleNodeClick = (id: string) => {
        // Just select
        setSelectedNodeId(id === selectedNodeId ? null : id);
    };

    const addShape = (type: string) => {
        const shapeDef = architecturalShapes[type];
        if (!shapeDef) return;

        const newNode: NodeType = {
            ...shapeDef,
            id: Date.now().toString(),
            x: 50 + Math.random() * 50,
            y: 50 + Math.random() * 50,
            type: shapeDef.type || 'rect',
            label: shapeDef.label || 'Node',
            width: shapeDef.width || 50,
            height: shapeDef.height || 50,
            fill: shapeDef.fill || '#fff',
            stroke: shapeDef.stroke || '#000',
            strokeWidth: shapeDef.strokeWidth || 1,
        };
        console.log('Adding new shape:', newNode.type, 'pathData:', newNode.pathData);

        const newNodes = [...nodes, newNode];
        setNodes(newNodes);
        saveToHistory(newNodes, links);
    };

    const clearGraph = () => {
        if (confirm('Clear canvas?')) {
            setNodes([]);
            setLinks([]);
            saveToHistory([], []);
        }
    };

    const undo = () => {
        if (historyIndex > 0) {
            const prev = history[historyIndex - 1];
            setNodes(prev.nodes);
            setLinks(prev.links);
            setHistoryIndex(historyIndex - 1);
        }
    };

    const redo = () => {
        if (historyIndex < history.length - 1) {
            const next = history[historyIndex + 1];
            setNodes(next.nodes);
            setLinks(next.links);
            setHistoryIndex(historyIndex + 1);
        }
    };

    const resetZoom = () => {
        if (svgRef.current && zoomRef.current) {
            d3.select(svgRef.current)
                .transition()
                .duration(750)
                .call(zoomRef.current.transform, d3.zoomIdentity);
        }
    };


    return (
        <div className={className}>
            {mode === 'instructor' && (
                <MantinePaper p="md" mb="md" withBorder>
                    <Group justify="space-between" mb="xs">
                        <Text size="sm" fw={500}>D3 Component Palette</Text>
                        <Group gap="xs">
                            <Button size="xs" color="red" variant="subtle" onClick={clearGraph}>Clear</Button>
                            <Divider orientation="vertical" />
                            <Button size="xs" variant="outline" onClick={undo} disabled={historyIndex <= 0}>Undo</Button>
                            <Button size="xs" variant="outline" onClick={redo} disabled={historyIndex >= history.length - 1}>Redo</Button>
                        </Group>
                    </Group>
                    <Group>
                        <Button size="xs" variant="light" onClick={() => addShape('Server')}>Add Server</Button>
                        <Button size="xs" variant="light" onClick={() => addShape('Database')}>Add DB</Button>
                        <Button size="xs" variant="light" onClick={() => addShape('LoadBalancer')}>Add LB</Button>
                        <Button size="xs" variant="light" onClick={() => addShape('Client')}>Add Client</Button>
                        <Divider orientation="vertical" />
                        <Button size="xs" variant="outline" color="blue" onClick={() => addShape('Kubernetes')}>K8s</Button>
                        <Button size="xs" variant="outline" color="dark" onClick={() => addShape('Nextjs')}>Next.js</Button>
                        <Button size="xs" variant="outline" color="cyan" onClick={() => addShape('React')}>React</Button>
                        <Button size="xs" variant="outline" color="blue" onClick={() => addShape('Docker')}>Docker</Button>
                        <Divider orientation="vertical" />
                        <Button size="xs" variant="filled" color="grape" onClick={() => addShape('Group')}>Group</Button>
                        <Button size="xs" variant="filled" color="grape" onClick={() => addShape('Zone')}>Zone</Button>
                        <Button size="xs" variant="filled" color="indigo" onClick={() => addShape('Pool')}>Pool</Button>
                        <Button size="xs" variant="filled" color="red" onClick={() => addShape('Heart')}>Heart</Button>
                        <Button size="xs" variant="filled" color="yellow" onClick={() => addShape('Star')}>Star</Button>
                        <Button size="xs" variant="filled" color="cyan" onClick={() => addShape('Cloud')}>Cloud</Button>
                    </Group>
                </MantinePaper>
            )}

            <div ref={wrapperRef} style={{ position: 'relative', width: '100%', height: '600px', border: '1px solid #ddd', overflow: 'hidden' }}>
                <svg
                    ref={svgRef}
                    width="100%"
                    height="100%"
                    style={{ background: computedColorScheme === 'dark' ? '#1A1B1E' : '#f8f9fa' }}
                >
                    <defs>
                        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e0e0e0" strokeWidth="0.5" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" opacity={0.5} />
                </svg>

                {/* Floating Controls */}
                <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 100 }}>
                    <Tooltip label="Reset Zoom">
                        <ActionIcon variant="default" size="lg" onClick={resetZoom} bg="var(--mantine-color-body)">
                            <IconZoomReset size={20} />
                        </ActionIcon>
                    </Tooltip>
                </div>

                {/* React Overlay Input for Text Editing */}
                {editingNode && (
                    <input
                        type="text"
                        defaultValue={editingNode.label}
                        autoFocus
                        onFocus={(e) => e.target.select()}
                        style={{
                            position: 'absolute',
                            left: editingNode.x - 60, // x is already node center in screen coords
                            top: editingNode.y - 14, // y is already node center in screen coords
                            width: '120px',
                            height: '28px',
                            textAlign: 'center',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            border: '2px solid #228be6',
                            borderRadius: '4px',
                            outline: 'none',
                            zIndex: 1000,
                            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                const newLabel = e.currentTarget.value;
                                const newNodes = nodes.map(n =>
                                    n.id === editingNode.id ? { ...n, label: newLabel } : n
                                );
                                setNodes(newNodes);
                                saveToHistory(newNodes, links);
                                setEditingNode(null);
                            } else if (e.key === 'Escape') {
                                setEditingNode(null);
                            }
                        }}
                        onBlur={(e) => {
                            const newLabel = e.currentTarget.value;
                            if (newLabel !== editingNode.label) {
                                const newNodes = nodes.map(n =>
                                    n.id === editingNode.id ? { ...n, label: newLabel } : n
                                );
                                setNodes(newNodes);
                                saveToHistory(newNodes, links);
                            }
                            setEditingNode(null);
                        }}
                    />
                )}
            </div>
            {mode === 'student' && (
                <Text size="xs" c="dimmed" mt="xs">
                    Click a node to select (blue outline), then click another node to link them. Drag to move.
                </Text>
            )}
        </div>
    );
};

export default DiagramEditor;
