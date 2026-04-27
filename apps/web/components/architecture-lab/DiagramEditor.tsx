/** biome-ignore-all lint/a11y/noSvgWithoutTitle: <explanation> */
"use client";

import {
    ActionIcon,
    Box,
    Button,
    Divider,
    Group,
    Paper as MantinePaper,
    Modal,
    MultiSelect,
    ScrollArea,
    Stack,
    Text,
    Tooltip,
    useComputedColorScheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconZoomReset } from "@tabler/icons-react";
import * as d3 from "d3";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    calculateConnectionPoints,
    createArrowMarkers,
    type EdgeSide,
    getArrowheadPoints,
    renderLink,
    renderWaypointHandles,
    spreadOverlappingEdges,
} from "../../utils/d3-link-renderers";
import { renderShape } from "../../utils/d3-shape-renderers";
import { architecturalShapes, type NodeType } from "../../utils/lab-utils";
import {
    getArchitectureMetadata,
    getArchitectureSelectOptions,
    getArchitectureShapes,
    L2_ARCHITECTURE_TYPES,
    L3_ARCHITECTURE_TYPES,
    MAX_ADDITIONAL_SELECTIONS,
} from "../../utils/shape-libraries";
import { genericD3Shapes } from "../../utils/shape-libraries/generic-d3-shapes";
import {
    renderDeleteIcon,
    renderLinkHandle,
    renderResizeHandles,
    renderSelectionOutline,
    renderShapeLabel,
} from "./d3-diagram-utils";
import ShapePreview from "./ShapePreview";

interface LinkType {
    source: string; // ID
    target: string; // ID
    sourceEdge?: EdgeSide; // Which edge of source node to connect from
    targetEdge?: EdgeSide; // Which edge of target node to connect to
    waypoints?: { x: number; y: number }[]; // Custom waypoints for path (optional)
}

interface DiagramEditorProps {
    initialGraph?: any;
    mode: "instructor" | "student";
    onGraphChange?: (json: any) => void;
    className?: string;
    architectureType?: string; // Deprecated: kept for backward compatibility
    architectureTypes?: string[]; // New: array of architecture types for multi-select
    viewOnly?: boolean; // Read-only mode for students: hides sidebar/toolbar, shows only diagram
    canvasPan?: boolean; // Allow pan by dragging background + free wheel zoom (no Ctrl required)
}

const DiagramEditor: React.FC<DiagramEditorProps> = ({
    initialGraph,
    mode,
    onGraphChange,
    className,
    architectureType,
    architectureTypes,
    viewOnly = false,
    canvasPan = false,
}) => {
    // Normalize architecture types: handle both single type and array for backward compatibility
    const normalizedArchitectureTypes =
        architectureTypes || (architectureType ? [architectureType] : []);

    // Stable key for architecture types — used as a D3 effect dependency
    const archTypesKey = normalizedArchitectureTypes.join(",");

    // Additional architecture types selected by trainer via dropdown
    const [additionalArchTypes, setAdditionalArchTypes] = useState<string[]>([]);

    // Combined architecture types: prop-provided + user-selected
    const allActiveArchTypes = [
        ...new Set([...normalizedArchitectureTypes, ...additionalArchTypes]),
    ];

    const computedColorScheme = useComputedColorScheme("light");
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

    // Ref to always have access to latest links (for occupied-dot detection)
    const linksRef = useRef<LinkType[]>(links);
    linksRef.current = links;

    // Interaction State
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [selectedLinkIndex, setSelectedLinkIndex] = useState<number | null>(
        null,
    );

    // Drag performance optimization refs
    const dragRAFRef = useRef<number | null>(null);
    const pendingDragRef = useRef<{
        nodeId: string;
        x: number;
        y: number;
        containedUpdates: { id: string; x: number; y: number }[];
    } | null>(null);

    const [history, setHistory] = useState<
        { nodes: NodeType[]; links: LinkType[] }[]
    >([]);
    const [historyIndex, setHistoryIndex] = useState(-1);

    // Text Editing State
    const [editingNode, setEditingNode] = useState<{
        id: string;
        label: string;
        x: number;
        y: number;
        width: number;
        height: number;
    } | null>(null);

    // Drag and Drop State
    const [draggingShapeId, setDraggingShapeId] = useState<string | null>(null);

    // Dynamic canvas size - Auto-extends on drag
    // Start with a standard size that fits most screens, but allow expansion
    const [canvasSize, setCanvasSize] = useState({ width: 1050, height: 800 });
    const canvasSizeRef = useRef({ width: 1050, height: 800 });
    const CANVAS_PADDING = 200; // Extra space to add when extending

    // Clear canvas modal
    const [clearModalOpened, { open: openClearModal, close: closeClearModal }] =
        useDisclosure(false);

    // Save history
    const saveToHistory = useCallback(
        (newNodes: NodeType[], newLinks: LinkType[]) => {
            const entry = {
                nodes: JSON.parse(JSON.stringify(newNodes)),
                links: JSON.parse(JSON.stringify(newLinks)),
            };
            const newHistory = history.slice(0, historyIndex + 1);
            newHistory.push(entry);
            setHistory(newHistory);
            setHistoryIndex(newHistory.length - 1);
        },
        [history, historyIndex],
    );

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

    // Handle keyboard events for delete

    // D3 Render Logic
    useEffect(() => {
        console.log("D3 useEffect running, nodes:", nodes.length);
        nodes.forEach((n, i) =>
            console.log(`  Node[${i}]`, n.id, "dimensions:", n.width, "x", n.height),
        );
        if (!svgRef.current) return;
        const svg = d3.select(svgRef.current);

        // IMPORTANT: Save current zoom transform before clearing
        const currentTransform = zoomRef.current
            ? d3.zoomTransform(svgRef.current)
            : d3.zoomIdentity;

        svg.selectAll("*").remove(); // Clear canvas

        const width = 800; // Fixed inner width or dynamic
        const height = 600;

        // Define Arrow Markers (this also creates the grid pattern)
        // Arrow markers using isolated renderer
        createArrowMarkers(svg, computedColorScheme);

        // Add grid background rect (uses grid pattern from defs)
        svg
            .append("rect")
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("fill", "url(#grid)")
            .attr("opacity", 0.5);

        // Main Group for Zoom
        const g = svg.append("g");

        // Layers (render order: bottom → top)
        // - containerLayer: VPC / namespace / subnet shapes (below everything so other nodes stack on top)
        // - linkLayer:      arrows / connections
        // - nodeLayer:      regular shapes + their labels (above arrows so arrows clip cleanly at shape boundaries)
        // - containerLabelLayer: container labels ONLY, lifted above linkLayer so arrows
        //                   don't cross over text like "VPC (10.0.0.0/16)" or "Public Subnet AZ1".
        //                   Sits above nodeLayer too so labels remain readable even when a
        //                   container's bottom edge is occluded by an inner shape.
        const containerLayer = g.append("g").attr("class", "layer-containers");
        const linkLayer = g.append("g").attr("class", "layer-links");
        const nodeLayer = g.append("g").attr("class", "layer-nodes");
        const containerLabelLayer = g.append("g").attr("class", "layer-container-labels");

        // Zoom Behavior - Only zoom with Ctrl+wheel or pinch, disable pan on drag
        const zoom = d3
            .zoom<SVGSVGElement, unknown>()
            .scaleExtent([0.1, 4])
            .filter((event) => {
                // In viewOnly mode, allow pan on drag but not zoom on drag
                if (viewOnly) {
                    // Allow all drag events for panning in viewOnly mode
                    if (
                        event.type === "mousedown" ||
                        event.type === "mousemove" ||
                        event.type === "pointermove" ||
                        event.type === "pointerdown"
                    ) {
                        return true; // Allow drag-based panning in viewOnly
                    }
                }

                // In canvasPan mode, allow drag panning on background (not on nodes)
                if (canvasPan) {
                    if (
                        event.type === "mousedown" ||
                        event.type === "mousemove" ||
                        event.type === "pointermove" ||
                        event.type === "pointerdown"
                    ) {
                        // Only pan if the click is on empty canvas (not on a node or its children)
                        const isOnNode =
                            (event.target as Element)?.closest?.('[id^="node-"]') !== null;
                        return !isOnNode;
                    }
                    // Allow wheel zoom without Ctrl in canvasPan mode
                    if (event.type === "wheel") return true;
                }

                // In edit mode, block all mouse/pointer drag events
                // We handle node dragging separately, so zoom should not pan
                if (
                    event.type === "mousedown" ||
                    event.type === "mousemove" ||
                    event.type === "pointermove" ||
                    event.type === "pointerdown"
                ) {
                    return false; // Block all drag-based pan/zoom in edit mode
                }

                // Allow zoom only on wheel if Ctrl/Cmd is pressed
                if (event.type === "wheel") {
                    return event.ctrlKey || event.metaKey;
                }

                // Allow touch events for pinch zoom (multi-touch only)
                if (event.type === "touchstart" || event.type === "touchmove") {
                    return event.touches && event.touches.length > 1;
                }

                // Block everything else
                return false;
            })
            .on("zoom", (event) => {
                g.attr("transform", event.transform);
            });

        zoomRef.current = zoom;

        svg.call(zoom).on("dblclick.zoom", null);

        // Show grab cursor on background when canvasPan is enabled
        if (canvasPan) {
            svg.style("cursor", "grab");
            svg.on("mousedown.cursor", () => svg.style("cursor", "grabbing"));
            svg.on("mouseup.cursor", () => svg.style("cursor", "grab"));
        }

        // IMPORTANT: Restore the saved transform after setting up zoom
        svg.call(zoom.transform, currentTransform);
        g.attr("transform", currentTransform.toString());

        // State for drag
        let dragStartPos = { x: 0, y: 0 };
        let containerStartPos = { x: 0, y: 0 }; // Track container's starting position
        let hasDragged = false;
        // Store original positions of contained nodes to avoid mutating React state
        let containedNodesState: { id: string; startX: number; startY: number }[] =
            [];

        // 1. Node Drag Definition
        const nodeDrag = d3
            .drag<SVGGElement, NodeType>()
            .filter((event) => !event.ctrlKey && !event.button)
            .on("start", (event, d) => {
                event.sourceEvent.stopPropagation();
                event.sourceEvent.preventDefault();
                dragStartPos = { x: event.x, y: event.y };
                containerStartPos = { x: d.x || 0, y: d.y || 0 }; // Capture container's original position
                hasDragged = false;
                d3.select(event.sourceEvent.target).attr("cursor", "grabbing");

                // If container, identify contained nodes and store their ORIGINAL positions
                const currentNodes = nodesRef.current;
                containedNodesState = [];

                // Container types - includes all shapes that can contain other shapes
                const containerTypes = [
                    "pool",
                    "group",
                    "zone",
                    "container",
                    "namespace",
                    "vpc",
                    "node",
                    "virtualnetwork",
                ];
                if (containerTypes.includes(d.type || "")) {
                    const containerRect = {
                        x: d.x || 0,
                        y: d.y || 0,
                        w: d.width,
                        h: d.height,
                    };
                    // Only consider non-container nodes as children to prevent
                    // containers from being dragged together when they overlap
                    currentNodes.forEach((n) => {
                        // Skip other containers - they should not be treated as children
                        if (containerTypes.includes(n.type || "")) return;
                        if (n.id !== d.id && n.x !== undefined && n.y !== undefined) {
                            const isInside =
                                n.x >= containerRect.x &&
                                n.y >= containerRect.y &&
                                n.x + n.width <= containerRect.x + containerRect.w &&
                                n.y + n.height <= containerRect.y + containerRect.h;

                            if (isInside) {
                                containedNodesState.push({
                                    id: n.id!,
                                    startX: n.x,
                                    startY: n.y,
                                });
                            }
                        }
                    });
                }
            })
            .on("drag", (event, d) => {
                event.sourceEvent.stopPropagation();
                event.sourceEvent.preventDefault();

                const dx = Math.abs(event.x - dragStartPos.x);
                const dy = Math.abs(event.y - dragStartPos.y);
                if (dx > 3 || dy > 3) hasDragged = true;

                // Calculate total delta from start position (NOT incremental moveDx/moveDy)
                const totalDeltaX = event.x - dragStartPos.x;
                const totalDeltaY = event.y - dragStartPos.y;

                // Calculate new container position (for D3 DOM only)
                const newContainerX = containerStartPos.x + totalDeltaX;
                const newContainerY = containerStartPos.y + totalDeltaY;

                // Store the new position on d for canvas expansion checks
                // (This is a D3 datum mutation, not React state mutation)
                d.x = newContainerX;
                d.y = newContainerY;

                // Collect contained node updates - calculate from ORIGINAL positions + delta
                // Do NOT mutate React state (nodesRef.current) during drag
                const containedUpdates: { id: string; x: number; y: number }[] = [];
                if (containedNodesState.length > 0) {
                    containedNodesState.forEach((item) => {
                        // Calculate new position from stored original position + total delta
                        const newX = item.startX + totalDeltaX;
                        const newY = item.startY + totalDeltaY;
                        containedUpdates.push({
                            id: item.id,
                            x: newX,
                            y: newY,
                        });
                    });
                }

                // Store pending drag update
                pendingDragRef.current = {
                    nodeId: d.id!,
                    x: newContainerX,
                    y: newContainerY,
                    containedUpdates,
                };

                // Use RAF to batch DOM updates for smooth 60fps
                if (!dragRAFRef.current) {
                    dragRAFRef.current = requestAnimationFrame(() => {
                        if (pendingDragRef.current) {
                            const { nodeId, x, y, containedUpdates } = pendingDragRef.current;

                            // Update main node transform
                            d3.select(`#node-${nodeId}`).attr(
                                "transform",
                                `translate(${x},${y})`,
                            );
                            // Keep the container's label (in containerLabelLayer)
                            // in sync — no-op if this node isn't a container.
                            d3.select(`#container-label-${nodeId}`).attr(
                                "transform",
                                `translate(${x},${y})`,
                            );

                            // Update contained nodes transforms
                            containedUpdates.forEach((update) => {
                                d3.select(`#node-${update.id}`).attr(
                                    "transform",
                                    `translate(${update.x},${update.y})`,
                                );
                                // Same sync for any contained container (nested case)
                                d3.select(`#container-label-${update.id}`).attr(
                                    "transform",
                                    `translate(${update.x},${update.y})`,
                                );
                            });

                            // Check if we need to extend canvas bounds
                            const nodeRight = x + d.width + CANVAS_PADDING;
                            const nodeBottom = y + d.height + CANVAS_PADDING;

                            let needsUpdate = false;
                            let newWidth = canvasSizeRef.current.width;
                            let newHeight = canvasSizeRef.current.height;

                            if (nodeRight > canvasSizeRef.current.width) {
                                newWidth = Math.max(
                                    nodeRight,
                                    canvasSizeRef.current.width + CANVAS_PADDING,
                                );
                                needsUpdate = true;
                            }
                            if (nodeBottom > canvasSizeRef.current.height) {
                                newHeight = Math.max(
                                    nodeBottom,
                                    canvasSizeRef.current.height + CANVAS_PADDING,
                                );
                                needsUpdate = true;
                            }

                            if (needsUpdate) {
                                canvasSizeRef.current = { width: newWidth, height: newHeight };
                                setCanvasSize({ width: newWidth, height: newHeight });
                            }

                            // Auto-scroll to keep dragged node visible
                            if (wrapperRef.current) {
                                const wrapper = wrapperRef.current;
                                const transform = zoomRef.current
                                    ? d3.zoomTransform(svgRef.current!)
                                    : d3.zoomIdentity;

                                // Calculate node position in screen coordinates relative to wrapper
                                const nodeScreenX =
                                    x * transform.k + transform.x - wrapper.scrollLeft;
                                const nodeScreenY =
                                    y * transform.k + transform.y - wrapper.scrollTop;
                                const nodeScreenRight = nodeScreenX + d.width * transform.k;
                                const nodeScreenBottom = nodeScreenY + d.height * transform.k;

                                const scrollMargin = 30;
                                const scrollSpeed = 15;

                                // Scroll right if node is near or beyond right edge
                                if (nodeScreenRight > wrapper.clientWidth - scrollMargin) {
                                    wrapper.scrollLeft += scrollSpeed;
                                }
                                // Scroll down if node is near or beyond bottom edge
                                if (nodeScreenBottom > wrapper.clientHeight - scrollMargin) {
                                    wrapper.scrollTop += scrollSpeed;
                                }
                                // Scroll left if node is near or beyond left edge
                                if (nodeScreenX < scrollMargin) {
                                    wrapper.scrollLeft = Math.max(
                                        0,
                                        wrapper.scrollLeft - scrollSpeed,
                                    );
                                }
                                // Scroll up if node is near or beyond top edge
                                if (nodeScreenY < scrollMargin) {
                                    wrapper.scrollTop = Math.max(
                                        0,
                                        wrapper.scrollTop - scrollSpeed,
                                    );
                                }
                            }

                            pendingDragRef.current = null;
                        }
                        dragRAFRef.current = null;
                    });
                }
            })
            .on("end", (event, d) => {
                event.sourceEvent.stopPropagation();
                event.sourceEvent.preventDefault();

                // Cancel any pending RAF and apply final position immediately
                if (dragRAFRef.current) {
                    cancelAnimationFrame(dragRAFRef.current);
                    dragRAFRef.current = null;
                }
                if (pendingDragRef.current) {
                    const { nodeId, x, y, containedUpdates } = pendingDragRef.current;
                    d3.select(`#node-${nodeId}`).attr(
                        "transform",
                        `translate(${x},${y})`,
                    );
                    containedUpdates.forEach((update) => {
                        d3.select(`#node-${update.id}`).attr(
                            "transform",
                            `translate(${update.x},${update.y})`,
                        );
                    });
                    pendingDragRef.current = null;
                }

                d3.select(event.sourceEvent.target).attr("cursor", "grab");
                if (!hasDragged) {
                    const now = Date.now();
                    const isDoubleClick = now - lastClickTimeRef.current < 300;
                    lastClickTimeRef.current = now;

                    if (isDoubleClick) {
                        const nodeGroup = document.getElementById(`node-${d.id}`);
                        const wrapperRect = wrapperRef.current?.getBoundingClientRect();
                        if (nodeGroup && wrapperRect) {
                            const nodeRect = nodeGroup.getBoundingClientRect();
                            const screenX =
                                nodeRect.left - wrapperRect.left + nodeRect.width / 2;
                            const screenY =
                                nodeRect.top - wrapperRect.top + nodeRect.height / 2;
                            setEditingNode({
                                id: d.id!,
                                label: d.label,
                                x: screenX,
                                y: screenY,
                                width: d.width,
                                height: d.height,
                            });
                        }
                    } else {
                        setSelectedNodeId((prev) => (prev === d.id ? null : d.id!));
                    }
                } else {
                    // Calculate final total delta for state update
                    const finalDeltaX = (d.x ?? 0) - containerStartPos.x;
                    const finalDeltaY = (d.y ?? 0) - containerStartPos.y;

                    const updatedNodes = nodesRef.current.map((n) => {
                        // Update the dragged container node
                        if (n.id === d.id) return { ...n, x: d.x, y: d.y };
                        // Update contained nodes using their original positions + total delta
                        const contained = containedNodesState.find((c) => c.id === n.id);
                        if (contained) {
                            return {
                                ...n,
                                x: contained.startX + finalDeltaX,
                                y: contained.startY + finalDeltaY,
                            };
                        }
                        return n;
                    });
                    setNodes(updatedNodes);
                    saveToHistory(updatedNodes, links);
                    containedNodesState = [];
                }
            });

        // 2. Link Drag Definition
        // We use local variables for the temp line + arrowhead, NOT React state
        let tempLinkLine: d3.Selection<
            SVGLineElement,
            unknown,
            null,
            undefined
        > | null = null;
        let tempLinkArrow: d3.Selection<
            SVGPolygonElement,
            unknown,
            null,
            undefined
        > | null = null;

        const linkDrag = d3
            .drag<SVGCircleElement, NodeType>()
            .on("start", function (event, d) {
                event.sourceEvent.stopPropagation();
                event.sourceEvent.preventDefault();

                // Detect which edge handle the drag started from
                const edgeAttr = d3.select(this).attr("data-edge") as EdgeSide | null;
                (this as any).__sourceEdge = edgeAttr || "bottom";

                // Start position is the handle's position (edge midpoint)
                const handleCx = parseFloat(d3.select(this).attr("cx"));
                const handleCy = parseFloat(d3.select(this).attr("cy"));
                const startX = (d.x || 0) + handleCx;
                const startY = (d.y || 0) + handleCy;

                tempLinkLine = linkLayer
                    .append("line")
                    .attr("x1", startX)
                    .attr("y1", startY)
                    .attr("x2", startX)
                    .attr("y2", startY)
                    .attr("stroke", "blue")
                    .attr("stroke-width", 2)
                    .attr("stroke-dasharray", "5,5")
                    .style("pointer-events", "none");
                tempLinkArrow = linkLayer
                    .append("polygon")
                    .attr("points", getArrowheadPoints(startX, startY, startX, startY))
                    .attr("fill", "blue")
                    .style("pointer-events", "none");
            })
            .on("drag", function (event, d) {
                event.sourceEvent.stopPropagation();
                event.sourceEvent.preventDefault();
                if (!tempLinkLine) return;
                const [mx, my] = d3.pointer(event, g.node());
                const handleCx = parseFloat(d3.select(this).attr("cx"));
                const handleCy = parseFloat(d3.select(this).attr("cy"));
                const startX = (d.x || 0) + handleCx;
                const startY = (d.y || 0) + handleCy;
                tempLinkLine
                    .attr("x1", startX)
                    .attr("y1", startY)
                    .attr("x2", mx)
                    .attr("y2", my);
                if (tempLinkArrow) {
                    tempLinkArrow.attr("points", getArrowheadPoints(mx, my, startX, startY));
                }
            })
            .on("end", function (event, d) {
                event.sourceEvent.stopPropagation();
                event.sourceEvent.preventDefault();
                const sourceEdge = (this as any).__sourceEdge as EdgeSide;

                if (tempLinkLine) {
                    tempLinkLine.remove();
                    tempLinkLine = null;
                }
                if (tempLinkArrow) {
                    tempLinkArrow.remove();
                    tempLinkArrow = null;
                }

                const [mx, my] = d3.pointer(event, g.node());
                const PADDING = 20;

                const candidates = nodes.filter(
                    (n) =>
                        n.id !== d.id &&
                        mx >= (n.x || 0) - PADDING &&
                        mx <= (n.x || 0) + n.width + PADDING &&
                        my >= (n.y || 0) - PADDING &&
                        my <= (n.y || 0) + n.height + PADDING,
                );

                candidates.sort((a, b) => {
                    const isContainerA = ["pool", "group", "zone", "container"].includes(
                        a.type || "",
                    );
                    const isContainerB = ["pool", "group", "zone", "container"].includes(
                        b.type || "",
                    );
                    if (isContainerA && !isContainerB) return 1;
                    if (!isContainerA && isContainerB) return -1;
                    const areaA = a.width * a.height;
                    const areaB = b.width * b.height;
                    return areaA - areaB;
                });

                const targetNode = candidates.length > 0 ? candidates[0] : undefined;

                if (targetNode) {
                    // Detect which of the 12 anchor points on the target node is closest
                    const tnx = targetNode.x || 0;
                    const tny = targetNode.y || 0;
                    const S = 0.25;
                    const C = 0.5;
                    const E = 0.75;

                    // Calculate all 12 anchor point positions
                    const anchorPoints: { edge: EdgeSide; x: number; y: number }[] = [
                        { edge: "top-start", x: tnx + targetNode.width * S, y: tny },
                        { edge: "top-center", x: tnx + targetNode.width * C, y: tny },
                        { edge: "top-end", x: tnx + targetNode.width * E, y: tny },
                        { edge: "right-start", x: tnx + targetNode.width, y: tny + targetNode.height * S },
                        { edge: "right-center", x: tnx + targetNode.width, y: tny + targetNode.height * C },
                        { edge: "right-end", x: tnx + targetNode.width, y: tny + targetNode.height * E },
                        { edge: "bottom-start", x: tnx + targetNode.width * S, y: tny + targetNode.height },
                        { edge: "bottom-center", x: tnx + targetNode.width * C, y: tny + targetNode.height },
                        { edge: "bottom-end", x: tnx + targetNode.width * E, y: tny + targetNode.height },
                        { edge: "left-start", x: tnx, y: tny + targetNode.height * S },
                        { edge: "left-center", x: tnx, y: tny + targetNode.height * C },
                        { edge: "left-end", x: tnx, y: tny + targetNode.height * E },
                    ];

                    // Collect already-occupied target dots on this node
                    const currentLinks = linksRef.current;
                    const occupiedTargetEdges = new Set(
                        currentLinks
                            .filter((l) => l.target === targetNode.id && l.targetEdge)
                            .map((l) => l.targetEdge),
                    );
                    const occupiedSourceEdges = new Set(
                        currentLinks
                            .filter((l) => l.source === targetNode.id && l.sourceEdge)
                            .map((l) => l.sourceEdge),
                    );

                    // Sort anchors by distance to drop position
                    const sorted = [...anchorPoints].sort((a, b) => {
                        const da = (mx - a.x) ** 2 + (my - a.y) ** 2;
                        const db = (mx - b.x) ** 2 + (my - b.y) ** 2;
                        return da - db;
                    });

                    // Pick closest unoccupied dot; fall back to closest if all occupied
                    const closestAnchor =
                        sorted.find(
                            (a) => !occupiedTargetEdges.has(a.edge) && !occupiedSourceEdges.has(a.edge),
                        ) || sorted[0];

                    const newLink: LinkType = {
                        source: d.id!,
                        target: targetNode.id!,
                        sourceEdge,
                        targetEdge: closestAnchor.edge,
                    };
                    if (
                        !links.some(
                            (l) => l.source === newLink.source && l.target === newLink.target,
                        )
                    ) {
                        const newLinks = [...links, newLink];
                        setLinks(newLinks);
                        saveToHistory(nodes, newLinks);
                    }
                }
            });

        // 3. Resize Drag Definition
        let resizeStartInfo: any = null;
        const resizeDrag = d3
            .drag<SVGCircleElement, unknown>()
            .on("start", function (event) {
                event.sourceEvent.stopPropagation();
                const corner = d3.select(this).attr("data-corner");
                const nodeId = d3.select(this).attr("data-node-id");
                const node = nodes.find((n) => n.id === nodeId);
                if (node) {
                    const [mx, my] = d3.pointer(event, g.node());
                    resizeStartInfo = {
                        nodeId,
                        corner,
                        origWidth: node.width,
                        origHeight: node.height,
                        origX: node.x || 0,
                        origY: node.y || 0,
                        startMouseX: mx,
                        startMouseY: my,
                        finalWidth: node.width,
                        finalHeight: node.height,
                        finalX: node.x || 0,
                        finalY: node.y || 0,
                    };
                }
            })
            .on("drag", (event) => {
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
                    case "se":
                        newWidth = Math.max(minSize, resizeStartInfo.origWidth + dx);
                        newHeight = Math.max(minSize, resizeStartInfo.origHeight + dy);
                        break;
                    case "sw":
                        newWidth = Math.max(minSize, resizeStartInfo.origWidth - dx);
                        newHeight = Math.max(minSize, resizeStartInfo.origHeight + dy);
                        newX =
                            resizeStartInfo.origX + (resizeStartInfo.origWidth - newWidth);
                        break;
                    case "ne":
                        newWidth = Math.max(minSize, resizeStartInfo.origWidth + dx);
                        newHeight = Math.max(minSize, resizeStartInfo.origHeight - dy);
                        newY =
                            resizeStartInfo.origY + (resizeStartInfo.origHeight - newHeight);
                        break;
                    case "nw":
                        newWidth = Math.max(minSize, resizeStartInfo.origWidth - dx);
                        newHeight = Math.max(minSize, resizeStartInfo.origHeight - dy);
                        newX =
                            resizeStartInfo.origX + (resizeStartInfo.origWidth - newWidth);
                        newY =
                            resizeStartInfo.origY + (resizeStartInfo.origHeight - newHeight);
                        break;
                }

                resizeStartInfo.finalWidth = newWidth;
                resizeStartInfo.finalHeight = newHeight;
                resizeStartInfo.finalX = newX;
                resizeStartInfo.finalY = newY;
                const nodeGroup = d3.select(`#node-${resizeStartInfo.nodeId}`);
                nodeGroup.attr("transform", `translate(${newX},${newY})`);
                // Container labels live in a separate top layer; keep their
                // transform in lock-step with the resized node.
                d3.select(`#container-label-${resizeStartInfo.nodeId}`).attr(
                    "transform",
                    `translate(${newX},${newY})`,
                );
                nodeGroup
                    .select('rect[stroke="blue"]')
                    .attr("width", newWidth + 10)
                    .attr("height", newHeight + 10);
                nodeGroup.selectAll(".resize-handle").each(function () {
                    const handle = d3.select(this);
                    const corner = handle.attr("data-corner");
                    switch (corner) {
                        case "nw":
                            handle.attr("cx", 0).attr("cy", 0);
                            break;
                        case "ne":
                            handle.attr("cx", newWidth).attr("cy", 0);
                            break;
                        case "sw":
                            handle.attr("cx", 0).attr("cy", newHeight);
                            break;
                        case "se":
                            handle.attr("cx", newWidth).attr("cy", newHeight);
                            break;
                    }
                });
            })
            .on("end", () => {
                if (resizeStartInfo) {
                    const updatedNodes = nodesRef.current.map((n) => {
                        if (n.id === resizeStartInfo.nodeId) {
                            return {
                                ...n,
                                width: resizeStartInfo.finalWidth,
                                height: resizeStartInfo.finalHeight,
                                x: resizeStartInfo.finalX,
                                y: resizeStartInfo.finalY,
                            };
                        }
                        return n;
                    });
                    setNodes(updatedNodes);
                    saveToHistory(updatedNodes, links);
                    resizeStartInfo = null;
                }
            });

        // 4. Render Batch Helper
        const renderNodeBatch = (
            targetLayer: d3.Selection<SVGGElement, unknown, null, undefined>,
            batchNodes: NodeType[],
        ) => {
            const selection = targetLayer
                .selectAll<SVGGElement, NodeType>("g")
                .data(batchNodes, (d: NodeType) => d.id || "") // Key function to prevent duplicate elements
                .enter()
                .append("g")
                .attr("id", (d) => `node-${d.id}`)
                .attr("transform", (d) => `translate(${d.x || 0},${d.y || 0})`);

            // Only add interactions if NOT in viewOnly mode
            if (!viewOnly) {
                selection
                    .attr("cursor", "grab")
                    .on("click", (event, d) => {
                        if (event.detail === 2) {
                            event.stopPropagation();
                            const nodeGroup = document.getElementById(`node-${d.id}`);
                            const wrapperRect = wrapperRef.current?.getBoundingClientRect();
                            if (nodeGroup && wrapperRect) {
                                const nodeRect = nodeGroup.getBoundingClientRect();
                                const screenX =
                                    nodeRect.left - wrapperRect.left + nodeRect.width / 2;
                                const screenY =
                                    nodeRect.top - wrapperRect.top + nodeRect.height / 2;
                                setEditingNode({
                                    id: d.id!,
                                    label: d.label,
                                    x: screenX,
                                    y: screenY,
                                    width: d.width,
                                    height: d.height,
                                });
                            }
                        } else {
                            setSelectedNodeId((prev) => (prev === d.id ? null : d.id!));
                        }
                    })
                    .call(nodeDrag);
            }

            // Render each shape using isolated renderers
            selection.each(function (d) {
                const el = d3.select(this);
                const color =
                    computedColorScheme === "dark" && d.stroke === "#333"
                        ? "#FFF"
                        : d.stroke;
                const fill = d.fill === "transparent" ? "transparent" : d.fill;

                // Use isolated shape renderer
                renderShape({
                    element: el,
                    shape: d,
                    fill,
                    color,
                    architecture: architectureType,
                    architectureTypes: normalizedArchitectureTypes,
                });

                // Only render interactive elements if NOT in viewOnly mode
                if (!viewOnly) {
                    // Render selection outline if selected
                    if (selectedNodeId === d.id) {
                        renderSelectionOutline(el, d);
                        renderResizeHandles(el, d);
                    }

                    // Add link handle for all shapes (including containers)
                    renderLinkHandle(el, d);
                    el.on("mouseenter", () => {
                        el.selectAll(".link-handle").attr("opacity", 1);
                        delIcon.style("display", "block");
                    }).on("mouseleave", () => {
                        el.selectAll(".link-handle").attr("opacity", 0);
                        delIcon.style("display", "none");
                    });

                    // Render delete icon
                    const delIcon = renderDeleteIcon(el, d, () => {
                        const nodeId = d.id!;
                        const newNodes = nodes.filter((n) => n.id !== nodeId);
                        // Remove links connected to the deleted node
                        const newLinks = links.filter(
                            (l) => l.source !== nodeId && l.target !== nodeId,
                        );
                        setNodes(newNodes);
                        setLinks(newLinks);
                        saveToHistory(newNodes, newLinks);
                        setSelectedNodeId(null);
                    });
                }

                // Render shape label (always show, even in viewOnly).
                // Container labels are rendered in a separate top-layer pass below
                // (so they sit above arrows). Skip them here to avoid double-render.
                const isContainerType = renderContainerTypes.includes(d.type || "");
                if (!isContainerType) {
                    renderShapeLabel(el, d, computedColorScheme);
                }
            });
        };

        /**
         * Render container labels into `containerLabelLayer` (above linkLayer).
         * Each label group gets id `container-label-${nodeId}` so drag handlers
         * can keep its transform in sync with the container's group.
         */
        const renderContainerLabels = (containers: NodeType[]) => {
            containers.forEach((d) => {
                const labelG = containerLabelLayer
                    .append("g")
                    .attr("id", `container-label-${d.id}`)
                    .attr("transform", `translate(${d.x || 0},${d.y || 0})`);
                renderShapeLabel(
                    labelG as unknown as d3.Selection<SVGGElement, NodeType, null, undefined>,
                    d,
                    computedColorScheme,
                );
            });
        };

        // 5. Execution
        // Container types that should be rendered in the container layer (behind other nodes)
        // Includes Kubernetes namespace, AWS VPC, Azure virtualnetwork, and GCP node
        const renderContainerTypes = [
            "pool",
            "group",
            "zone",
            "container",
            "namespace",
            "vpc",
            "node",
            "virtualnetwork",
        ];
        const containerNodes = nodes.filter((n) =>
            renderContainerTypes.includes(n.type || ""),
        );
        const regularNodes = nodes.filter(
            (n) => !renderContainerTypes.includes(n.type || ""),
        );

        renderNodeBatch(containerLayer, containerNodes);
        // Link Rendering (Reuse existing loop context? No we removed it.)
        // We need to re-implement link rendering here or copy it back.
        // Wait, I removed the link logic in Chunk 1. I need to put it back here!

        // Spread overlapping edges so links sharing the same node + side
        // use different anchor positions (start / center / end)
        const spreadLinks = spreadOverlappingEdges(links, nodes);

        // Calculate offsets for overlapping arrows
        // Group links by source-target pairs
        const linkOffsets = new Map<number, number>();
        const linkGroups = new Map<string, number[]>();

        spreadLinks.forEach((link, i) => {
            const key = `${link.source}-${link.target}`;
            const group = linkGroups.get(key) ?? [];
            group.push(i);
            linkGroups.set(key, group);
        });

        // Assign offsets to links in the same group
        const OFFSET_SPACING = 20; // pixels between parallel arrows
        linkGroups.forEach((indices) => {
            if (indices.length > 1) {
                // Multiple arrows between same nodes - spread them out
                const totalOffset = (indices.length - 1) * OFFSET_SPACING;
                const startOffset = -totalOffset / 2;
                indices.forEach((linkIdx, posIdx) => {
                    linkOffsets.set(linkIdx, startOffset + posIdx * OFFSET_SPACING);
                });
            } else {
                // Single arrow - no offset needed
                linkOffsets.set(indices[0], 0);
            }
        });

        // Link Rendering using isolated renderer
        const linkGroup = linkLayer; // Alias for consistency
        spreadLinks.forEach((link, i) => {
            const sourceNode = nodes.find((n) => n.id === link.source);
            const targetNode = nodes.find((n) => n.id === link.target);
            if (!sourceNode || !targetNode) return;

            const isSelected = !viewOnly && selectedLinkIndex === i;
            const offset = linkOffsets.get(i) || 0;

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
                    offset, // Pass offset to spread overlapping arrows
                    onLinkClick: viewOnly
                        ? undefined
                        : () => {
                            setSelectedLinkIndex(isSelected ? null : i);
                            setSelectedNodeId(null);
                        },
                    onDeleteClick: viewOnly
                        ? undefined
                        : () => {
                            const nl = links.filter((_, idx) => idx !== i);
                            setLinks(nl);
                            setSelectedLinkIndex(null);
                            saveToHistory(nodes, nl);
                        },
                },
            );

            // Render waypoint handles for selected link (only if NOT viewOnly)
            if (isSelected && !viewOnly) {
                const { x1, y1, x2, y2 } = calculateConnectionPoints(
                    sourceNode,
                    targetNode,
                    link.sourceEdge,
                    link.targetEdge,
                );
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
                    g,
                );
            }
        });

        renderNodeBatch(nodeLayer, regularNodes);

        // Render container labels last, into the top label layer so they sit
        // above arrows. Done AFTER linkLayer is populated so the layer ordering
        // is correct in the SVG tree.
        renderContainerLabels(containerNodes);

        // Only apply drag behaviors if NOT in viewOnly mode
        if (!viewOnly) {
            g.selectAll(".resize-handle").call(resizeDrag as any);
            g.selectAll(".link-handle").call(linkDrag as any);
        }
    }, [
        nodes,
        links,
        selectedNodeId,
        selectedLinkIndex,
        computedColorScheme,
        setEditingNode,
        viewOnly,
        canvasPan,
        archTypesKey,
    ]);

    const addShape = (shapeId: string, x?: number, y?: number) => {
        // Find shape definition from common shapes, architecture-specific shapes, or architecturalShapes
        let shapeDef:
            | (typeof commonShapes)[number]
            | (typeof architectureSpecificShapes)[number]
            | (typeof architecturalShapes)[keyof typeof architecturalShapes]
            | undefined;

        // First, check if it's a common shape (from genericD3Shapes)
        const commonShape = commonShapes.find(
            (s) => s.id === shapeId || s.type === shapeId.toLowerCase(),
        );
        if (commonShape) {
            shapeDef = commonShape;
        } else {
            // Check if it's an architecture-specific shape
            const archShape = architectureSpecificShapes.find(
                (s) => s.id === shapeId || s.type === shapeId.toLowerCase(),
            );
            if (archShape) {
                shapeDef = archShape;
            } else {
                // Try to find in architecturalShapes (legacy/fallback)
                const type = Object.keys(architecturalShapes).find(
                    (k) => k.toLowerCase() === shapeId.toLowerCase(),
                );
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
            type: shapeDef.type || "rect",
            label: shapeDef.name || shapeDef.label || "Node",
            width: shapeDef.width || 50,
            height: shapeDef.height || 50,
            fill: shapeDef.fill || "#fff",
            stroke: shapeDef.stroke || "#000",
            strokeWidth: shapeDef.strokeWidth || 1,
            rx: shapeDef.rx,
            strokeDashArray: shapeDef.strokeDashArray,
            pathData: shapeDef.pathData,
        };
        console.log("Adding new shape:", newNode.type, "label:", newNode.label);

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
        setNodes([]);
        setLinks([]);
        saveToHistory([], []);
        closeClearModal();
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

    const deleteSelectedNode = useCallback(() => {
        if (selectedNodeId) {
            const newNodes = nodes.filter((n) => n.id !== selectedNodeId);
            // Remove links connected to the deleted node
            const newLinks = links.filter(
                (l) => l.source !== selectedNodeId && l.target !== selectedNodeId,
            );
            setNodes(newNodes);
            setLinks(newLinks);
            setSelectedNodeId(null);
            saveToHistory(newNodes, newLinks);
        }
    }, [selectedNodeId, nodes, links, saveToHistory]);

    // Keyboard handler for Delete key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Delete or Backspace key
            if ((e.key === "Delete" || e.key === "Backspace") && selectedNodeId) {
                // Prevent default behavior (e.g., browser back navigation)
                e.preventDefault();
                deleteSelectedNode();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [selectedNodeId, deleteSelectedNode]);

    // Common shapes (left sidebar) - directly from genericD3Shapes metadata
    const commonShapes = Object.values(genericD3Shapes);

    // Architecture-specific shapes based on architectureTypes + additional user-selected types
    // Fetch shapes from all active architecture types and group them by architecture
    const architectureShapesGrouped = allActiveArchTypes
        .map((archType) => ({
            architectureType: archType,
            architectureName: getArchitectureMetadata(archType).name,
            shapes: getArchitectureShapes(archType),
        }))
        .filter((group) => group.shapes.length > 0);

    // Flat list of all architecture shapes for backward compatibility
    const architectureSpecificShapes = architectureShapesGrouped.flatMap(
        (group) => group.shapes,
    );

    return (
        <div className={className}>
            {mode === "instructor" && !viewOnly && (
                <>
                    {/* Architecture-specific shapes - Top Bar */}
                    <MantinePaper withBorder p="md" mb="md">
                        <Group justify="space-between" mb="sm">
                            <Group gap="xs">
                                <Text size="sm" fw={600} mb={0}>
                                    Architecture Shapes
                                </Text>
                                <Text size="xs" c="dimmed">
                                    (Drag to canvas)
                                </Text>
                            </Group>
                            <Group gap="xs">
                                <Button
                                    size="xs"
                                    color="red"
                                    variant="subtle"
                                    onClick={openClearModal}
                                >
                                    Clear
                                </Button>
                                <Divider orientation="vertical" />
                                <Button
                                    size="xs"
                                    variant="outline"
                                    onClick={undo}
                                    disabled={historyIndex <= 0}
                                >
                                    Undo
                                </Button>
                                <Button
                                    size="xs"
                                    variant="outline"
                                    onClick={redo}
                                    disabled={historyIndex >= history.length - 1}
                                >
                                    Redo
                                </Button>
                            </Group>
                        </Group>

                        {/* Additional shape categories dropdown */}
                        <MultiSelect
                            size="xs"
                            placeholder="Add more shape categories..."
                            label="Additional Shape Categories"
                            data={[
                                ...getArchitectureSelectOptions(
                                    L2_ARCHITECTURE_TYPES,
                                    normalizedArchitectureTypes,
                                ),
                                ...getArchitectureSelectOptions(
                                    L3_ARCHITECTURE_TYPES,
                                    normalizedArchitectureTypes,
                                ),
                            ]}
                            value={additionalArchTypes}
                            onChange={setAdditionalArchTypes}
                            maxValues={MAX_ADDITIONAL_SELECTIONS}
                            searchable
                            clearable
                            mb="md"
                            style={{ maxWidth: 500 }}
                        />

                        <Group gap="md" style={{ flexWrap: "wrap" }}>
                            {architectureShapesGrouped.map((group) => (
                                <React.Fragment key={group.architectureType}>
                                    {/* Section header for each architecture type */}
                                    <Box w="100%">
                                        <Text size="xs" fw={700} c="dimmed" tt="uppercase" mt="xs">
                                            {group.architectureName}
                                        </Text>
                                    </Box>

                                    {/* Shapes for this architecture */}
                                    {group.shapes.map((shape) => (
                                        <Tooltip
                                            key={shape.id}
                                            label={shape.name}
                                            position="bottom"
                                            withArrow
                                        >
                                            <MantinePaper
                                                p="xs"
                                                withBorder
                                                draggable
                                                style={{
                                                    cursor: "grab",
                                                    textAlign: "center",
                                                    backgroundColor: "#fff",
                                                    transition: "transform 0.2s",
                                                }}
                                                onDragStart={(e) => {
                                                    setDraggingShapeId(shape.id);
                                                    e.currentTarget.style.cursor = "grabbing";
                                                }}
                                                onDragEnd={(e) => {
                                                    e.currentTarget.style.cursor = "grab";
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.transform = "scale(1.05)";
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.transform = "scale(1)";
                                                }}
                                                onClick={() => addShape(shape.id)}
                                            >
                                                <ShapePreview
                                                    shape={shape}
                                                    size={30}
                                                    architecture={group.architectureType}
                                                />
                                            </MantinePaper>
                                        </Tooltip>
                                    ))}
                                </React.Fragment>
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
                            <Text size="xs" fw={400} mb="xs" ta="center">
                                Common
                            </Text>

                            <ScrollArea
                                h="88.5vh"
                                type="always"
                                offsetScrollbars
                                scrollbarSize={8}
                            >
                                <Stack gap="xs">
                                    {commonShapes.map((shape) => (
                                        <Tooltip
                                            key={shape.id}
                                            label={shape.name}
                                            position="right"
                                            withArrow
                                        >
                                            <MantinePaper
                                                p={4}
                                                withBorder
                                                draggable
                                                style={{
                                                    cursor: "grab",
                                                    backgroundColor: "#fff",
                                                    transition: "transform 0.2s",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                }}
                                                onDragStart={(e) => {
                                                    setDraggingShapeId(shape.id);
                                                    e.currentTarget.style.cursor = "grabbing";
                                                }}
                                                onDragEnd={(e) => {
                                                    e.currentTarget.style.cursor = "grab";
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.transform = "scale(1.08)";
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.transform = "scale(1)";
                                                }}
                                                onClick={() => addShape(shape.id)}
                                            >
                                                <ShapePreview
                                                    shape={shape}
                                                    size={30}
                                                    architecture={architectureType}
                                                />
                                            </MantinePaper>
                                        </Tooltip>
                                    ))}
                                </Stack>
                            </ScrollArea>
                        </MantinePaper>

                        {/* Canvas */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                                ref={wrapperRef}
                                style={{
                                    position: "relative",
                                    width: "100%",
                                    height: "970px",
                                    border: "1px solid #ddd",
                                    overflow: "auto",
                                }}
                                onDrop={handleCanvasDrop}
                                onDragOver={handleCanvasDragOver}
                            >
                                <svg
                                    ref={svgRef}
                                    width={canvasSize.width}
                                    height={canvasSize.height}
                                    style={{
                                        background:
                                            computedColorScheme === "dark" ? "#1A1B1E" : "#f8f9fa",
                                        minWidth: "100%",
                                        minHeight: "100%",
                                    }}
                                >
                                    {/* D3 manages all SVG content - defs, markers, grid, layers, nodes, links */}
                                </svg>

                                {/* Floating Controls */}
                                <div
                                    style={{
                                        position: "absolute",
                                        top: 10,
                                        right: 10,
                                        zIndex: 100,
                                    }}
                                >
                                    <Tooltip label="Reset Zoom">
                                        <ActionIcon
                                            variant="default"
                                            size="lg"
                                            onClick={resetZoom}
                                            bg="var(--mantine-color-body)"
                                        >
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
                                            position: "absolute",
                                            left: editingNode.x - 60,
                                            top: editingNode.y - 14,
                                            width: "120px",
                                            height: "28px",
                                            textAlign: "center",
                                            fontSize: "14px",
                                            fontWeight: "bold",
                                            border: "2px solid #228be6",
                                            borderRadius: "4px",
                                            outline: "none",
                                            zIndex: 1000,
                                            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                const newLabel = e.currentTarget.value;
                                                const newNodes = nodes.map((n) =>
                                                    n.id === editingNode.id
                                                        ? { ...n, label: newLabel }
                                                        : n,
                                                );
                                                setNodes(newNodes);
                                                saveToHistory(newNodes, links);
                                                setEditingNode(null);
                                            } else if (e.key === "Escape") {
                                                setEditingNode(null);
                                            }
                                        }}
                                        onBlur={(e) => {
                                            const newLabel = e.currentTarget.value;
                                            if (newLabel !== editingNode.label) {
                                                const newNodes = nodes.map((n) =>
                                                    n.id === editingNode.id
                                                        ? { ...n, label: newLabel }
                                                        : n,
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

            {/* viewOnly canvas — no sidebar, no toolbar, with zoom controls */}
            {viewOnly && (
                <div
                    ref={wrapperRef}
                    style={{
                        position: "relative",
                        width: "100%",
                        height: "600px",
                        overflow: "auto",
                    }}
                >
                    <svg
                        ref={svgRef}
                        width="100%"
                        height="100%"
                        style={{
                            background:
                                computedColorScheme === "dark" ? "#1A1B1E" : "#f8f9fa",
                            minWidth: "100%",
                            minHeight: "100%",
                        }}
                    >
                        {/* D3 manages all SVG content - defs, markers, grid, layers, nodes, links */}
                    </svg>

                    {/* Floating zoom controls for viewOnly mode */}
                    <div
                        style={{ position: "absolute", top: 10, right: 10, zIndex: 100 }}
                    >
                        <Tooltip label="Reset Zoom">
                            <ActionIcon
                                variant="default"
                                size="lg"
                                onClick={resetZoom}
                                bg="var(--mantine-color-body)"
                                style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}
                            >
                                <IconZoomReset size={18} />
                            </ActionIcon>
                        </Tooltip>
                    </div>
                </div>
            )}

            {mode === "student" && (
                <div
                    ref={wrapperRef}
                    style={{
                        position: "relative",
                        width: "100%",
                        height: "600px",
                        border: "1px solid #ddd",
                        overflow: "hidden",
                    }}
                >
                    <svg
                        ref={svgRef}
                        width="100%"
                        height="100%"
                        style={{
                            background:
                                computedColorScheme === "dark" ? "#1A1B1E" : "#f8f9fa",
                        }}
                    >
                        {/* D3 manages all SVG content - defs, markers, grid, layers, nodes, links */}
                    </svg>

                    {/* Floating Controls */}
                    <div
                        style={{ position: "absolute", top: 10, right: 10, zIndex: 100 }}
                    >
                        <Tooltip label="Reset Zoom">
                            <ActionIcon
                                variant="default"
                                size="lg"
                                onClick={resetZoom}
                                bg="var(--mantine-color-body)"
                            >
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
                                position: "absolute",
                                left: editingNode.x - 60,
                                top: editingNode.y - 14,
                                width: "120px",
                                height: "28px",
                                textAlign: "center",
                                fontSize: "14px",
                                fontWeight: "bold",
                                border: "2px solid #228be6",
                                borderRadius: "4px",
                                outline: "none",
                                zIndex: 1000,
                                boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    const newLabel = e.currentTarget.value;
                                    const newNodes = nodes.map((n) =>
                                        n.id === editingNode.id ? { ...n, label: newLabel } : n,
                                    );
                                    setNodes(newNodes);
                                    saveToHistory(newNodes, links);
                                    setEditingNode(null);
                                } else if (e.key === "Escape") {
                                    setEditingNode(null);
                                }
                            }}
                            onBlur={(e) => {
                                const newLabel = e.currentTarget.value;
                                if (newLabel !== editingNode.label) {
                                    const newNodes = nodes.map((n) =>
                                        n.id === editingNode.id ? { ...n, label: newLabel } : n,
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

            {mode === "student" && (
                <Text size="xs" c="dimmed" mt="xs">
                    Click a node to select (blue outline), then click another node to link
                    them. Drag to move.
                </Text>
            )}

            {/* Clear Canvas Confirmation Modal */}
            <Modal
                opened={clearModalOpened}
                onClose={closeClearModal}
                title="Clear Canvas"
                centered
            >
                <Stack>
                    <Text>Are you sure you want to clear the canvas?</Text>
                    <Text size="sm" c="dimmed">
                        This will remove all shapes and connections. This action cannot be
                        undone.
                    </Text>
                    <Group justify="flex-end" mt="md">
                        <Button variant="default" onClick={closeClearModal}>
                            Cancel
                        </Button>
                        <Button color="red" onClick={clearGraph}>
                            Clear Canvas
                        </Button>
                    </Group>
                </Stack>
            </Modal>
        </div>
    );
};

export default DiagramEditor;
