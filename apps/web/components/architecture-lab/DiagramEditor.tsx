'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { architecturalShapes, NodeType } from '../../utils/lab-utils';
import { renderShape } from '../../utils/d3-shape-renderers';
import {
    renderSelectionOutline,
    renderResizeHandles,
    renderShapeLabel,
    renderLinkHandle,
    renderDeleteIcon
} from './d3-diagram-utils';
import {
    createArrowMarkers,
    renderLink,
    renderWaypointHandles,
    calculateConnectionPoints,
} from '../../utils/d3-link-renderers';
import { Button, Group, Paper as MantinePaper, Text, Divider, useComputedColorScheme, ActionIcon, Tooltip, Stack, ScrollArea } from '@mantine/core';
import { IconZoomReset } from '@tabler/icons-react';
import ShapePreview from './ShapePreview';
import { genericD3Shapes, ShapeDefinition } from '../../utils/shape-libraries/generic-d3-shapes';
import { awsD3Shapes, AWSShapeDefinition } from '../../utils/shape-libraries/aws-d3-shapes';
import { kubernetesD3Shapes, KubernetesShapeDefinition } from '../../utils/shape-libraries/kubernetes-d3-shapes';

// Union type for all shape definitions
type ArchitectureShapeDefinition = ShapeDefinition | AWSShapeDefinition | KubernetesShapeDefinition;


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
    architectureType?: string;
}

const DiagramEditor: React.FC<DiagramEditorProps> = ({
    initialGraph,
    mode,
    onGraphChange,
    className,
    architectureType,
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

    const [history, setHistory] = useState<{ nodes: NodeType[], links: LinkType[] }[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);

    // Text Editing State
    const [editingNode, setEditingNode] = useState<{ id: string, label: string, x: number, y: number, width: number, height: number } | null>(null);

    // Drag and Drop State
    const [draggingShapeId, setDraggingShapeId] = useState<string | null>(null);

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
        
        // IMPORTANT: Save current zoom transform before clearing
        const currentTransform = zoomRef.current ? 
            d3.zoomTransform(svgRef.current) : 
            d3.zoomIdentity;
        
        svg.selectAll('*').remove(); // Clear canvas

        const width = 800; // Fixed inner width or dynamic
        const height = 600;

        // Define Arrow Markers
        // Arrow markers using isolated renderer
        createArrowMarkers(svg, computedColorScheme);

        // Main Group for Zoom
        const g = svg.append('g');

        // Layers
        const containerLayer = g.append('g').attr('class', 'layer-containers');
        const linkLayer = g.append('g').attr('class', 'layer-links');
        const nodeLayer = g.append('g').attr('class', 'layer-nodes');

        // Zoom Behavior - Only zoom with Ctrl+wheel or pinch, disable pan on drag
        const zoom = d3.zoom<SVGSVGElement, unknown>()
            .scaleExtent([0.1, 4])
            .filter((event) => {
                // Block all mouse/pointer drag events (mousedown, mousemove)
                // We handle node dragging separately, so zoom should not pan
                if (event.type === 'mousedown' || event.type === 'mousemove' || 
                    event.type === 'pointermove' || event.type === 'pointerdown') {
                    return false; // Block all drag-based pan/zoom
                }
                
                // Allow zoom only on wheel if Ctrl/Cmd is pressed
                if (event.type === 'wheel') {
                    return event.ctrlKey || event.metaKey;
                }
                
                // Allow touch events for pinch zoom (multi-touch only)
                if (event.type === 'touchstart' || event.type === 'touchmove') {
                    return event.touches && event.touches.length > 1;
                }
                
                // Block everything else
                return false;
            })
            .on('zoom', (event) => {
                g.attr('transform', event.transform);
            });

        zoomRef.current = zoom;

        svg.call(zoom).on('dblclick.zoom', null);
        
        // IMPORTANT: Restore the saved transform after setting up zoom
        svg.call(zoom.transform, currentTransform);
        g.attr('transform', currentTransform.toString());

        // State for drag
        let dragStartPos = { x: 0, y: 0 };
        let hasDragged = false;
        let containedNodesState: { id: string; startX: number; startY: number }[] = [];

        // 1. Node Drag Definition
        const nodeDrag = d3.drag<SVGGElement, NodeType>()
            .filter(event => !event.ctrlKey && !event.button)
            .on('start', (event, d) => {
                event.sourceEvent.stopPropagation();
                event.sourceEvent.preventDefault();
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
                event.sourceEvent.stopPropagation();
                event.sourceEvent.preventDefault();
                
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
                event.sourceEvent.stopPropagation();
                event.sourceEvent.preventDefault();
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
                event.sourceEvent.preventDefault();
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
                event.sourceEvent.stopPropagation();
                event.sourceEvent.preventDefault();
                if (!tempLinkLine) return;
                const [mx, my] = d3.pointer(event, g.node());
                const startX = (d.x || 0) + d.width / 2;
                const startY = (d.y || 0) + d.height / 2;
                tempLinkLine.attr('x1', startX).attr('y1', startY).attr('x2', mx).attr('y2', my);
            })
            .on('end', (event, d) => {
                event.sourceEvent.stopPropagation();
                event.sourceEvent.preventDefault();
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



            selection.call(nodeDrag);

            // Render each shape using isolated renderers
            selection.each(function (d) {
                const el = d3.select(this);
                const color = computedColorScheme === 'dark' && d.stroke === '#333' ? '#FFF' : d.stroke;
                const fill = d.fill === 'transparent' ? 'transparent' : d.fill;

                // Use isolated shape renderer
                renderShape({ element: el, shape: d, fill, color, architecture: architectureType });

                // Render selection outline if selected
                if (selectedNodeId === d.id) {
                    renderSelectionOutline(el, d);
                    renderResizeHandles(el, d);
                }

                // Render shape label
                renderShapeLabel(el, d);

                // Add link handle for non-containers
                if (!['pool', 'group', 'zone'].includes(d.type || '')) {
                    const lh = renderLinkHandle(el, d);
                    el.on('mouseenter', () => {
                        lh.attr('opacity', 1);
                        delIcon.style('display', 'block');
                    }).on('mouseleave', () => {
                        lh.attr('opacity', 0);
                        delIcon.style('display', 'none');
                    });
                } else {
                    el.on('mouseenter', () => delIcon.style('display', 'block'))
                        .on('mouseleave', () => delIcon.style('display', 'none'));
                }

                // Render delete icon
                const delIcon = renderDeleteIcon(el, d, () => {
                    const nodeId = d.id!;
                    const newNodes = nodes.filter(n => n.id !== nodeId);
                    const newLinks = links.filter(l => l.source !== nodeId && l.target !== nodeId);
                    setNodes(newNodes);
                    setLinks(newLinks);
                    saveToHistory(newNodes, newLinks);
                    setSelectedNodeId(null);
                });
            });
        };

        // 5. Execution
        const containerNodes = nodes.filter(n => ['pool', 'group', 'zone'].includes(n.type || ''));
        const regularNodes = nodes.filter(n => !['pool', 'group', 'zone'].includes(n.type || ''));

        renderNodeBatch(containerLayer, containerNodes);
        // Link Rendering (Reuse existing loop context? No we removed it.)
        // We need to re-implement link rendering here or copy it back.
        // Wait, I removed the link logic in Chunk 1. I need to put it back here!

        // Link Rendering using isolated renderer
        const linkGroup = linkLayer; // Alias for consistency
        links.forEach((link, i) => {
            const sourceNode = nodes.find(n => n.id === link.source);
            const targetNode = nodes.find(n => n.id === link.target);
            if (!sourceNode || !targetNode) return;

            const isSelected = selectedLinkIndex === i;

            // Render link using isolated renderer
            const { linkWrapper, visiblePath, pathResult } = renderLink(
                linkGroup,
                link,
                i,
                sourceNode,
                targetNode,
                {
                    isSelected,
                    colorScheme: computedColorScheme,
                    onLinkClick: () => {
                        setSelectedLinkIndex(isSelected ? null : i);
                        setSelectedNodeId(null);
                    },
                    onDeleteClick: () => {
                        const nl = links.filter((_, idx) => idx !== i);
                        setLinks(nl);
                        setSelectedLinkIndex(null);
                        saveToHistory(nodes, nl);
                    }
                }
            );

            // Render waypoint handles for selected link
            if (isSelected) {
                const { x1, y1, x2, y2 } = calculateConnectionPoints(sourceNode, targetNode);
                renderWaypointHandles(
                    linkWrapper,
                    pathResult,
                    visiblePath,
                    x1,
                    y1,
                    x2,
                    y2,
                    (wpi, mx, my) => {
                        const nl = [...links];
                        const nw = [...(nl[i].waypoints || [])];
                        nw[wpi] = { x: mx, y: my };
                        nl[i] = { ...nl[i], waypoints: nw };
                        setLinks(nl);
                        saveToHistory(nodes, nl);
                    },
                    g
                );
            }
        });


        renderNodeBatch(nodeLayer, regularNodes);

        g.selectAll('.resize-handle').call(resizeDrag as any);
        g.selectAll('.link-handle').call(linkDrag as any);
    }, [nodes, links, selectedNodeId, selectedLinkIndex, computedColorScheme, setEditingNode]);


    const addShape = (shapeId: string, x?: number, y?: number) => {
        // Find shape definition from common shapes, architecture-specific shapes, or architecturalShapes
        let shapeDef;
        
        // First, check if it's a common shape (from genericD3Shapes)
        const commonShape = commonShapes.find(s => s.id === shapeId || s.type === shapeId.toLowerCase());
        if (commonShape) {
            shapeDef = commonShape;
        } else {
            // Check if it's an architecture-specific shape
            const archShape = architectureSpecificShapes.find(s => s.id === shapeId || s.type === shapeId.toLowerCase());
            if (archShape) {
                shapeDef = archShape;
            } else {
                // Try to find in architecturalShapes (legacy/fallback)
                const type = Object.keys(architecturalShapes).find(k => k.toLowerCase() === shapeId.toLowerCase());
                if (type) {
                    shapeDef = architecturalShapes[type];
                }
            }
        }
        
        if (!shapeDef) {
            console.warn(`Shape definition not found for: ${shapeId}`);
            return;
        }

        // Create new node with only the properties needed by NodeType
        const newNode: NodeType = {
            id: Date.now().toString(),
            x: x !== undefined ? x : 50 + Math.random() * 50,
            y: y !== undefined ? y : 50 + Math.random() * 50,
            type: shapeDef.type || 'rect',
            label: shapeDef.name || shapeDef.label || 'Node',
            width: shapeDef.width || 50,
            height: shapeDef.height || 50,
            fill: shapeDef.fill || '#fff',
            stroke: shapeDef.stroke || '#000',
            strokeWidth: shapeDef.strokeWidth || 1,
            rx: shapeDef.rx,
            strokeDashArray: shapeDef.strokeDashArray,
            pathData: shapeDef.pathData,
        };
        console.log('Adding new shape:', newNode.type, 'label:', newNode.label);

        const newNodes = [...nodes, newNode];
        setNodes(newNodes);
        saveToHistory(newNodes, links);
    };

    const handleCanvasDrop = (e: React.DragEvent) => {
        e.preventDefault();
        
        if (!draggingShapeId || !svgRef.current || !zoomRef.current) return;

        // Get the SVG element's bounding rect
        const svgRect = svgRef.current.getBoundingClientRect();
        
        // Calculate position relative to SVG
        const clientX = e.clientX - svgRect.left;
        const clientY = e.clientY - svgRect.top;
        
        // Get current zoom transform
        const transform = d3.zoomTransform(svgRef.current);
        
        // Convert screen coordinates to canvas coordinates (accounting for zoom/pan)
        const canvasX = (clientX - transform.x) / transform.k;
        const canvasY = (clientY - transform.y) / transform.k;
        
        // Add shape at drop position
        addShape(draggingShapeId, canvasX, canvasY);
        setDraggingShapeId(null);
    };

    const handleCanvasDragOver = (e: React.DragEvent) => {
        e.preventDefault(); // Allow drop
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


    // Common shapes (left sidebar) - directly from genericD3Shapes metadata
    const commonShapes = Object.values(genericD3Shapes);

    // Architecture-specific shapes based on architectureType - load from respective libraries
    const getArchitectureShapes = (): ArchitectureShapeDefinition[] => {
        switch (architectureType) {
            case 'AWS':
                return Object.values(awsD3Shapes);
            case 'Kubernetes':
                return Object.values(kubernetesD3Shapes);
            case 'Generic':
            default:
                // For Generic, return a subset of architecture shapes from genericD3Shapes
                return Object.values(genericD3Shapes).filter(shape => 
                    ['client', 'server', 'mobile', 'router', 'firewall', 'database', 'cache', 'loadbalancer', 'api'].includes(shape.type)
                );
        }
    };

    const architectureSpecificShapes = getArchitectureShapes();

    return (
        <div className={className}>
            {mode === 'instructor' && (
                <>
                    {/* Architecture-specific shapes - Top Bar */}
                    <MantinePaper withBorder p="md" mb="md">
                        <Group justify="space-between" mb="sm">
                            <Group gap="xs">
                                <Text size="sm" fw={600}>Architecture Shapes</Text>
                                <Text size="xs" c="dimmed">(Drag to canvas)</Text>
                            </Group>
                            <Group gap="xs">
                                <Button size="xs" color="red" variant="subtle" onClick={clearGraph}>Clear</Button>
                                <Divider orientation="vertical" />
                                <Button size="xs" variant="outline" onClick={undo} disabled={historyIndex <= 0}>Undo</Button>
                                <Button size="xs" variant="outline" onClick={redo} disabled={historyIndex >= history.length - 1}>Redo</Button>
                            </Group>
                        </Group>

                        <Group gap="md" style={{ flexWrap: 'wrap' }}>
                            {architectureSpecificShapes.map((shape) => (
                                <Tooltip key={shape.id} label={shape.name} position="bottom" withArrow>
                                    <MantinePaper
                                        p="xs"
                                        withBorder
                                        draggable
                                        style={{
                                            cursor: 'grab',
                                            textAlign: 'center',
                                            backgroundColor: '#fafafa',
                                            transition: 'transform 0.2s',
                                        }}
                                        onDragStart={(e) => {
                                            setDraggingShapeId(shape.id);
                                            e.currentTarget.style.cursor = 'grabbing';
                                        }}
                                        onDragEnd={(e) => {
                                            e.currentTarget.style.cursor = 'grab';
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'scale(1.05)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'scale(1)';
                                        }}
                                        onClick={() => addShape(shape.id)}
                                    >
                                        <ShapePreview shape={shape} size={30} />
                                    </MantinePaper>
                                </Tooltip>
                            ))}
                        </Group>
                    </MantinePaper>

                    {/* Main canvas with common shapes on left */}
                    <Group align="flex-start" gap="sm">
                        {/* Common Shapes - Left Sidebar with ScrollArea */}
                        <MantinePaper 
                            withBorder 
                            p="xs" 
                            style={{ 
                                width: 85, 
                                flexShrink: 0,
                            }}
                        >
                            <Text size="xs" fw={600} mb="xs" ta="center">Common</Text>
                            
                            <ScrollArea h="88.5vh" type="always" offsetScrollbars scrollbarSize={8}>
                                <Stack gap="xs">
                                    {commonShapes.map((shape) => (
                                        <Tooltip key={shape.id} label={shape.name} position="right" withArrow>
                                            <MantinePaper
                                                p={4}
                                                withBorder
                                                draggable
                                                style={{
                                                    cursor: 'grab',
                                                    backgroundColor: '#fafafa',
                                                    transition: 'transform 0.2s',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                }}
                                                onDragStart={(e) => {
                                                    setDraggingShapeId(shape.id);
                                                    e.currentTarget.style.cursor = 'grabbing';
                                                }}
                                                onDragEnd={(e) => {
                                                    e.currentTarget.style.cursor = 'grab';
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.transform = 'scale(1.08)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.transform = 'scale(1)';
                                                }}
                                                onClick={() => addShape(shape.id)}
                                            >
                                                <ShapePreview shape={shape} size={30} architecture={architectureType} />
                                            </MantinePaper>
                                        </Tooltip>
                                    ))}
                                </Stack>
                            </ScrollArea>
                        </MantinePaper>

                        {/* Canvas */}
                        <div style={{ flex: 1 }}>
                            <div 
                                ref={wrapperRef} 
                                style={{ position: 'relative', width: '100%', height: '600px', border: '1px solid #ddd', overflow: 'hidden' }}
                                onDrop={handleCanvasDrop}
                                onDragOver={handleCanvasDragOver}
                            >
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
                                            left: editingNode.x - 60,
                                            top: editingNode.y - 14,
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
                        </div>
                    </Group>
                </>
            )}

            {mode === 'student' && (
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
                                left: editingNode.x - 60,
                                top: editingNode.y - 14,
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
            )}

            {mode === 'student' && (
                <Text size="xs" c="dimmed" mt="xs">
                    Click a node to select (blue outline), then click another node to link them. Drag to move.
                </Text>
            )}
        </div>
    );
};

export default DiagramEditor;
