'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as joint from 'jointjs';
import { createArchitecturalShapes } from '../../utils/lab-utils';
import 'jointjs/dist/joint.css';
import { Button, Group, Paper as MantinePaper, Text, Divider, useComputedColorScheme } from '@mantine/core';

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
    const canvasRef = useRef<HTMLDivElement>(null);
    const [graph, setGraph] = useState<joint.dia.Graph | null>(null);
    const [paper, setPaper] = useState<joint.dia.Paper | null>(null);

    // History Management
    const historyRef = useRef<any[]>([]);
    const historyIndexRef = useRef<number>(-1);
    const isUndoing = useRef(false);

    const saveHistory = (g: joint.dia.Graph) => {
        if (isUndoing.current) return;

        const json = g.toJSON();
        // Clean tools from history
        json.cells = json.cells.filter((c: any) =>
            !c.type.startsWith('tools.')
        );

        // If we are in the middle of history, cut off the future
        if (historyIndexRef.current < historyRef.current.length - 1) {
            historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
        }

        // Limit history size (optional, e.g., 50 steps)
        if (historyRef.current.length > 50) {
            historyRef.current.shift();
            historyIndexRef.current--;
        }

        historyRef.current.push(json);
        historyIndexRef.current++;
    };

    const undo = () => {
        if (!graph || historyIndexRef.current <= 0) return;

        isUndoing.current = true;
        historyIndexRef.current--;
        const previousState = historyRef.current[historyIndexRef.current];
        graph.fromJSON(previousState);
        isUndoing.current = false;
        console.log("ArchitectureLab: Undo. Index:", historyIndexRef.current);
    };

    const redo = () => {
        if (!graph || historyIndexRef.current >= historyRef.current.length - 1) return;

        isUndoing.current = true;
        historyIndexRef.current++;
        const nextState = historyRef.current[historyIndexRef.current];
        graph.fromJSON(nextState);
        isUndoing.current = false;
        console.log("ArchitectureLab: Redo. Index:", historyIndexRef.current);
    };

    // Initialize JointJS
    useEffect(() => {
        if (!canvasRef.current) {
            console.error("ArchitectureLab: Canvas ref is null");
            return;
        }

        console.log("ArchitectureLab: Initializing JointJS...");
        let newGraph: joint.dia.Graph;
        let newPaper: joint.dia.Paper;

        // Small delay to ensure DOM is ready and layout is calculated
        const timer = setTimeout(() => {
            try {
                const container = canvasRef.current;
                if (!container) return;

                const containerWidth = container.offsetWidth || 800;
                console.log("ArchitectureLab: Container width:", containerWidth);

                // 1. Create Graph
                newGraph = new joint.dia.Graph({}, { cellNamespace: joint.shapes });

                // 2. Create Paper
                newPaper = new joint.dia.Paper({
                    el: container,
                    model: newGraph,
                    width: containerWidth,
                    height: 600,
                    gridSize: 10,
                    drawGrid: true,
                    clickThreshold: 1, // Ensure clicks are fired reliably
                    background: {
                        color: computedColorScheme === 'dark' ? '#1A1B1E' : '#f8f9fa'
                    },
                    interactive: mode === 'instructor' ? true : {
                        linkMove: true,
                        elementMove: true,
                        labelMove: false
                    },
                    defaultLink: new joint.shapes.standard.Link({
                        attrs: {
                            line: { stroke: '#333', strokeWidth: 2, targetMarker: { type: 'path', d: 'M 10 -5 0 0 10 5 z' } }
                        }
                    })
                });

                console.log("ArchitectureLab: Paper created successfully");

                // Load initial graph if provided
                if (initialGraph) {
                    console.log("ArchitectureLab: Loading initial graph data");
                    newGraph.fromJSON(initialGraph);
                }

                // Event listeners for graph changes
                if (onGraphChange) {
                    newGraph.on('change add remove', () => {
                        const json = newGraph.toJSON();
                        // Filter out tool elements from the saved JSON
                        json.cells = json.cells.filter((c: any) =>
                            c.type !== 'tools.ResizeHandle' &&
                            c.type !== 'tools.RemoveButton'
                        );
                        onGraphChange(json);
                    });
                }

                // Track history on important changes
                newGraph.on('add remove', (cell) => {
                    // Don't save history if it's a tool or link being created during drag
                    if (cell.get('type').startsWith('tools.')) return;
                    saveHistory(newGraph);
                });

                // For position changes, we want to save only on pointerup (drag end), which is handled by paper events usually on 'element:pointerup'
                // But JointJS graph events for batch change might be better.
                // Let's stick to paper events for drag end to avoid spam
                newPaper.on('element:pointerup', () => {
                    saveHistory(newGraph);
                });
                newPaper.on('link:pointerup', () => {
                    saveHistory(newGraph);
                });

                // Initial history state
                if (initialGraph) {
                    // push initial state
                    historyRef.current.push(initialGraph);
                    historyIndexRef.current = 0;
                } else {
                    // push empty state
                    saveHistory(newGraph);
                }


                // Embedding logic: When an element is moved, check if it's inside a 'Group' or 'Zone'
                newGraph.on('change:position', (cell) => {
                    if (cell.isLink()) return;

                    // Logic For Tool Sync: Move tools when main element moves
                    const tools = newGraph.getCells().filter(c =>
                        (c.get('type') === 'tools.ResizeHandle' || c.get('type') === 'tools.RemoveButton') &&
                        (c as any).get('relatedElementId') === cell.id
                    );

                    if (tools.length > 0) {
                        const bbox = cell.getBBox();
                        tools.forEach(t => {
                            const tool = t as joint.dia.Element;
                            if (tool.get('type') === 'tools.ResizeHandle') {
                                tool.position(bbox.x + bbox.width, bbox.y + bbox.height);
                            } else if (tool.get('type') === 'tools.RemoveButton') {
                                tool.position(bbox.x + bbox.width, bbox.y - 15);
                            }
                        });
                        return; // Don't run embedding logic on tools movement (triggered by us)
                    }

                    // Avoid embedding logic for tools themselves
                    if (cell.get('type').startsWith('tools.')) return;

                    const parent = newGraph.getCells().find(c =>
                        (c.get('type') === 'standard.Rectangle' && (c as any).attr('label/text')?.includes('Group') || (c as any).attr('label/text')?.includes('Zone')) &&
                        c.id !== cell.id &&
                        c.getBBox().containsPoint(cell.getBBox().center())
                    );

                    if (parent) {
                        parent.embed(cell);
                    } else {
                        // If moved out, unembed
                        const currentParent = cell.getParentCell();
                        if (currentParent) currentParent.unembed(cell);
                    }
                });

                // Edit text on double click (Elements)
                console.log("ArchitectureLab: Registering double click handler");
                newPaper.on('element:pointerdblclick', (elementView) => {
                    console.log("ArchitectureLab: Double click detected on", elementView.model.id);
                    handleEditLabel(elementView.model);
                });

                // Fallback for cell events
                newPaper.on('cell:pointerdblclick', (cellView) => {
                    console.log("ArchitectureLab: Cell double click detected on", cellView.model.id);
                    if (cellView.model.isElement()) {
                        handleEditLabel(cellView.model as joint.dia.Element);
                    }
                });

                const handleEditLabel = (element: joint.dia.Element) => {
                    if (element.get('type').startsWith('tools.')) return;

                    const type = element.get('type');
                    // HeaderedRectangle uses bodyText/text, others use label/text
                    const textPath = type === 'standard.HeaderedRectangle' ? 'bodyText/text' : 'label/text';

                    const currentText = element.attr(textPath);
                    console.log("ArchitectureLab: Current text:", currentText);

                    // Small timeout to prevent interference
                    setTimeout(() => {
                        const newText = prompt('Edit Label:', currentText);
                        if (newText !== null && newText !== currentText) {
                            element.attr(textPath, newText);
                            saveHistory(newGraph);
                        }
                    }, 50);
                };

                // Toggle link style on double click
                newPaper.on('link:pointerdblclick', (linkView) => {
                    const link = linkView.model;
                    const currentDash = link.attr('line/strokeDasharray');
                    if (currentDash) {
                        link.removeAttr('line/strokeDasharray');
                    } else {
                        link.attr('line/strokeDasharray', '5, 5');
                    }
                });

                // Tool Handling Logic
                const removeTools = () => {
                    const tools = newGraph.getCells().filter(c => c.get('type').startsWith('tools.'));
                    tools.forEach(t => t.remove());
                };

                const showTools = (elementView: joint.dia.ElementView) => {
                    if (mode !== 'instructor') return;
                    const element = elementView.model;
                    if (element.get('type').startsWith('tools.')) return; // Don't add tools to tools

                    removeTools(); // Clear existing tools

                    const bbox = element.getBBox();

                    // 1. Resize Handle (Bottom Right)
                    const resizeHandle = new joint.shapes.standard.Rectangle({
                        type: 'tools.ResizeHandle',
                        position: { x: bbox.x + bbox.width, y: bbox.y + bbox.height },
                        size: { width: 10, height: 10 },
                        attrs: {
                            body: { fill: '#339af0', stroke: '#1c7ed6', strokeWidth: 1, rx: 2, ry: 2, cursor: 'nwse-resize' }
                        }
                    });
                    resizeHandle.set('relatedElementId', element.id);

                    // 2. Remove Button (Top Right)
                    const removeButton = new joint.shapes.standard.Circle({
                        type: 'tools.RemoveButton',
                        position: { x: bbox.x + bbox.width, y: bbox.y - 15 },
                        size: { width: 16, height: 16 },
                        attrs: {
                            body: { fill: '#ff6b6b', stroke: '#c92a2a', strokeWidth: 1, cursor: 'pointer' },
                            label: { text: 'X', fill: 'white', fontSize: 10, fontWeight: 'bold', cursor: 'pointer' }
                        }
                    });
                    removeButton.set('relatedElementId', element.id);

                    newGraph.addCells([resizeHandle, removeButton]);
                };

                newPaper.on('element:pointerclick', (elementView) => {
                    const type = elementView.model.get('type');

                    if (type === 'tools.RemoveButton') {
                        // Handle Remove Click
                        const relatedId = elementView.model.get('relatedElementId');
                        const relatedCell = newGraph.getCell(relatedId);
                        if (relatedCell) relatedCell.remove();
                        elementView.model.remove(); // Remove button itself
                        // Also find and remove resize handle if exists
                        const handle = newGraph.getCells().find(c => c.get('type') === 'tools.ResizeHandle' && c.get('relatedElementId') === relatedId);
                        if (handle) handle.remove();

                    } else if (type !== 'tools.ResizeHandle') {
                        // Select Element -> Show Tools
                        showTools(elementView);
                    }
                });

                newPaper.on('blank:pointerclick', () => {
                    removeTools();
                });

                // Handle Resizing Logic (Dragging the ResizeHandle)
                newPaper.on('element:pointermove', (elementView, evt, x, y) => {
                    const element = elementView.model;
                    if (element.get('type') === 'tools.ResizeHandle') {
                        const relatedId = element.get('relatedElementId');
                        const relatedElement = newGraph.getCell(relatedId) as joint.dia.Element;

                        if (relatedElement) {
                            const currentPos = relatedElement.position();
                            // Calculate new size, ensuring explicit minimum 20x20
                            const newWidth = Math.max(20, x - currentPos.x);
                            const newHeight = Math.max(20, y - currentPos.y);

                            relatedElement.resize(newWidth, newHeight);

                            // Also update position of Remove Button if it exists
                            const removeBtn = newGraph.getCells().find(c => c.get('type') === 'tools.RemoveButton' && c.get('relatedElementId') === relatedId) as joint.dia.Element;
                            if (removeBtn) {
                                removeBtn.position(currentPos.x + newWidth, currentPos.y - 15);
                            }
                        }
                    }
                });

                setGraph(newGraph);
                setPaper(newPaper);
            } catch (error) {
                console.error("ArchitectureLab: Error initializing JointJS:", error);
            }
        }, 100);

        return () => {
            clearTimeout(timer);
            if (newPaper) {
                console.log("ArchitectureLab: Cleaning up paper");
                newPaper.remove();
            }
        };
    }, [mode]);

    // Update Paper Appearance on Theme Change
    useEffect(() => {
        if (!paper || !graph) return;

        const isDark = computedColorScheme === 'dark';
        const bgColor = isDark ? '#1A1B1E' : '#f8f9fa';
        // const gridColor = isDark ? '#FFFFFF' : '#a0a0a0'; 
        // We'll leave grid as default or current for now to avoid specific issues, just updating background as requested.

        paper.drawBackground({ color: bgColor });

        // Ensure grid visibility if needed (optional based on user request "grid can be in its original dark color")
        // But for now just background.

    }, [computedColorScheme, paper, graph]);

    const addShape = (type: string) => {
        if (!graph) return;

        const shapes = createArchitecturalShapes();
        // @ts-ignore
        const shape = shapes[type as keyof typeof shapes];

        if (shape) {
            const clone = shape.clone();
            clone.position(50, 50);

            graph.addCell(clone);

            // If it's a container, make it large and send to back
            if (type === 'Group' || type === 'Zone') {
                clone.toBack();
            }

            saveHistory(graph);
        }
    };

    const clearGraph = () => {
        if (graph && confirm('Are you sure you want to clear the canvas? This cannot be undone easily unless you rely on history.')) {
            graph.clear();
            saveHistory(graph);
        }
    };

    return (
        <div className={className}>
            {mode === 'instructor' && (
                <MantinePaper p="md" mb="md" withBorder>
                    <Group justify="space-between" mb="xs">
                        <Text size="sm" fw={500}>Component Palette</Text>
                        <Group gap="xs">
                            <Button size="xs" color="red" variant="subtle" onClick={clearGraph}>Clear Canvas</Button>
                            <Divider orientation="vertical" />
                            <Button size="xs" variant="outline" onClick={undo}>Undo</Button>
                            <Button size="xs" variant="outline" onClick={redo}>Redo</Button>
                        </Group>
                    </Group>
                    <Group>
                        <Button size="xs" variant="light" onClick={() => addShape('Server')}>Add Server</Button>
                        <Button size="xs" variant="light" onClick={() => addShape('Database')}>Add DB</Button>
                        <Button size="xs" variant="light" onClick={() => addShape('LoadBalancer')}>Add LB</Button>
                        <Button size="xs" variant="light" onClick={() => addShape('Client')}>Add Client</Button>
                        <Button size="xs" variant="light" onClick={() => addShape('Firewall')}>Add Firewall</Button>
                        <Button size="xs" variant="light" onClick={() => addShape('Cache')}>Add Cache</Button>
                        <Button size="xs" variant="light" onClick={() => addShape('Queue')}>Add Queue</Button>
                        <Button size="xs" variant="light" onClick={() => addShape('Storage')}>Add Storage</Button>
                        <Button size="xs" variant="light" onClick={() => addShape('Microservice')}>Add Service</Button>
                        <Button size="xs" variant="light" onClick={() => addShape('Router')}>Add Router</Button>
                        <Button size="xs" variant="light" onClick={() => addShape('CDN')}>Add CDN</Button>
                        <Button size="xs" variant="light" onClick={() => addShape('Func')}>Add Func</Button>
                        <Button size="xs" variant="filled" color="grape" onClick={() => addShape('Box')}>Add Box</Button>
                        <Button size="xs" variant="filled" color="grape" onClick={() => addShape('Group')}>Add VPC/Group</Button>
                        <Button size="xs" variant="filled" color="grape" onClick={() => addShape('Zone')}>Add Zone/Subnet</Button>
                        <Divider orientation="vertical" />
                        <Button size="xs" variant="outline" color="blue" onClick={() => addShape('Kubernetes')}>K8s</Button>
                        <Button size="xs" variant="outline" color="dark" onClick={() => addShape('Nextjs')}>Next.js</Button>
                        <Button size="xs" variant="outline" color="cyan" onClick={() => addShape('React')}>React</Button>
                        <Button size="xs" variant="outline" color="blue" onClick={() => addShape('Docker')}>Docker</Button>
                    </Group>
                </MantinePaper>
            )}

            <div
                ref={canvasRef}
                style={{
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    minHeight: '600px',
                    width: '100%'
                }}
            />
        </div>
    );
};

export default DiagramEditor;
