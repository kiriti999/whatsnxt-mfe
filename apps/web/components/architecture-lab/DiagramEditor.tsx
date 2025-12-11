'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as go from 'gojs';
import { ReactDiagram } from 'gojs-react';
import { architecturalShapes, createArchitecturalShapes } from '../../utils/lab-utils';
import { Button, Group, Paper as MantinePaper, Text, Divider, useComputedColorScheme } from '@mantine/core';

interface DiagramEditorProps {
    initialGraph?: any;
    mode: 'instructor' | 'student';
    onGraphChange?: (json: any) => void;
    className?: string;
}

// Initialize Diagram Function
const initDiagram = () => {
    const $ = go.GraphObject.make;

    const diagram = $(go.Diagram, {
        'undoManager.isEnabled': true,
        'clickCreatingTool.archetypeNodeData': { text: 'new node', color: 'lightblue' },
        'grid.visible': true, // Enable Grid
        model: $(go.GraphLinksModel, {
            linkKeyProperty: 'key'
        })
    });

    // Node Template
    diagram.nodeTemplate =
        $(go.Node, 'Auto',
            { locationSpot: go.Spot.Center },
            new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
            $(go.Shape, 'RoundedRectangle',
                {
                    name: 'SHAPE', fill: 'white', strokeWidth: 0,
                    portId: '', fromLinkable: true, toLinkable: true, cursor: 'pointer'
                },
                // Shape binding
                new go.Binding('figure', 'category', (c) => {
                    // Map categories to shapes if needed, generic fallback
                    switch (c) {
                        case 'Database': return 'Cylinder1';
                        case 'Client': return 'Circle';
                        case 'Process': return 'RoundedRectangle';
                        default: return 'RoundedRectangle';
                    }
                })
            ),
            // Dynamic Shape Style Binding
            $(go.Shape,
                { strokeWidth: 2, margin: 0 },
                new go.Binding('figure', 'category', (c) => {
                    // Specific shapes mapping
                    const map: any = {
                        'Database': 'Cylinder1',
                        'Client': 'Circle',
                        'LoadBalancer': 'Diamond', // Approx
                        'Firewall': 'CreateRequest', // Approx path
                        'React': 'Ellipse',
                        'Nextjs': 'Rectangle',
                        'Kubernetes': 'Hexagon',
                        'Docker': 'Terminator', // Approx
                        'CDN': 'Ellipse',
                        'Router': 'Diamond',
                        'Microservice': 'Hexagon',
                        'Func': 'Rectangle',
                    };
                    return map[c] || 'RoundedRectangle';
                }),
                new go.Binding('fill', 'fill'),
                new go.Binding('stroke', 'stroke'),
                new go.Binding('strokeDashArray', 'dash'),
                new go.Binding('geometryString', 'path') // For custom paths if we added them
            ),

            $(go.TextBlock,
                { margin: 8, editable: true, font: "bold 14px sans-serif" },
                new go.Binding('text').makeTwoWay(),
                new go.Binding('stroke', 'stroke')
            )
        );

    // Standard Node Template
    const nodeTemplate = $(go.Node, 'Auto',
        { locationSpot: go.Spot.Center, resizable: true, resizeObjectName: 'SHAPE' },
        new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
        $(go.Shape,
            {
                name: 'SHAPE', strokeWidth: 2, portId: '', fromLinkable: true, toLinkable: true, cursor: 'pointer'
            },
            new go.Binding('figure', 'category', (c) => {
                const map: any = {
                    'Database': 'Cylinder1',
                    'Client': 'Circle',
                    'LoadBalancer': 'Diamond',
                    'React': 'Ellipse',
                    'Nextjs': 'Rectangle',
                    'Kubernetes': 'Hexagon',
                    'Docker': 'Terminator', // Approx
                    'CDN': 'Ellipse',
                    'Router': 'Diamond',
                    'Microservice': 'Hexagon',
                    'Func': 'Rectangle',
                    'Server': 'RoundedRectangle',
                    'Box': 'Rectangle',
                    'Firewall': 'CreateRequest',
                };
                return map[c] || 'RoundedRectangle';
            }),
            new go.Binding('fill', 'fill'),
            new go.Binding('stroke', 'stroke'),
            new go.Binding('desiredSize', 'size', go.Size.parse).makeTwoWay(go.Size.stringify),
            new go.Binding('strokeDashArray', 'dash')
        ),
        $(go.TextBlock,
            { margin: 8, editable: true, font: "bold 14px sans-serif" },
            new go.Binding('text').makeTwoWay(),
            new go.Binding('stroke', 'stroke', (s) => s === '#FFF' ? '#333' : s) // Text color adjustment?
        )
    );

    // Map template
    diagram.nodeTemplateMap.add('', nodeTemplate); // Default
    // We can map all standard categories to this Default template since we use bindings.
    // Explicitly add for keys just in case
    ['Server', 'Database', 'LoadBalancer', 'Client', 'Firewall', 'Cache', 'Queue', 'Storage',
        'Microservice', 'Router', 'CDN', 'Func', 'Box', 'Kubernetes', 'Nextjs', 'React', 'Docker'].forEach(cat => {
            diagram.nodeTemplateMap.add(cat, nodeTemplate);
        });

    // Group Template
    diagram.groupTemplateMap.add('Group',
        $(go.Group, 'Auto',
            {
                layout: $(go.GridLayout, { wrappingColumn: 2 }),
                // Enable dropping items into group
                mouseDrop: (e, grp) => {
                    if (!(grp instanceof go.Group)) return;
                    const ok = grp.addMembers(grp.diagram.selection, true);
                    if (!ok) grp.diagram.currentTool.doCancel();
                },
                handlesDragDropForMembers: true
            },
            new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
            $(go.Shape, 'Rectangle',
                { fill: 'transparent', stroke: '#333', strokeWidth: 2 }),
            $(go.Panel, 'Vertical',
                $(go.TextBlock,         // group title
                    { alignment: go.Spot.Left, font: 'Bold 12pt Sans-Serif', margin: 5 },
                    new go.Binding('text', 'text')),
                $(go.Placeholder, { padding: 5 })
            )
        )
    );
    diagram.groupTemplateMap.add('Zone',
        $(go.Group, 'Auto',
            {
                layout: $(go.GridLayout, { wrappingColumn: 2 }),
                mouseDrop: (e, grp) => {
                    if (!(grp instanceof go.Group)) return;
                    const ok = grp.addMembers(grp.diagram.selection, true);
                    if (!ok) grp.diagram.currentTool.doCancel();
                },
                handlesDragDropForMembers: true
            },
            new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
            $(go.Shape, 'Rectangle',
                { fill: 'transparent', stroke: '#333', strokeWidth: 2, strokeDashArray: [5, 5] }),
            $(go.Panel, 'Vertical',
                $(go.TextBlock,         // group title
                    { alignment: go.Spot.Left, font: 'Bold 12pt Sans-Serif', margin: 5 },
                    new go.Binding('text', 'text')),
                $(go.Placeholder, { padding: 5 })
            )
        )
    );

    // Link Template
    diagram.linkTemplate =
        $(go.Link,
            { routing: go.Link.Orthogonal, corner: 5 },
            $(go.Shape, { strokeWidth: 2, stroke: '#333' }),
            $(go.Shape, { toArrow: 'Standard', stroke: null, fill: '#333' })
        );

    return diagram;
};


const DiagramEditor: React.FC<DiagramEditorProps> = ({
    initialGraph,
    mode,
    onGraphChange,
    className
}) => {
    const computedColorScheme = useComputedColorScheme('light');
    const diagramRef = useRef<ReactDiagram>(null);
    const [nodeDataArray, setNodeDataArray] = useState<any[]>([]);
    const [linkDataArray, setLinkDataArray] = useState<any[]>([]);

    // Initialize from initialGraph
    useEffect(() => {
        if (initialGraph && initialGraph.nodeDataArray) {
            setNodeDataArray(initialGraph.nodeDataArray);
            setLinkDataArray(initialGraph.linkDataArray || []);
        } else {
            // Reset if empty
            setNodeDataArray([]);
            setLinkDataArray([]);
        }
    }, [initialGraph]);

    const handleModelChange = (changes: any) => {
        // Sync GoJS model state to React State to prevent data loss on re-render
        // when adding new nodes via state buttons
        const diagram = diagramRef.current?.getDiagram();
        if (diagram) {
            const json = JSON.parse(diagram.model.toJson());
            setNodeDataArray(json.nodeDataArray);
            setLinkDataArray(json.linkDataArray || []);

            if (onGraphChange) {
                onGraphChange(json);
            }
        }
    };

    const addShape = (type: string) => {
        const shapeData = (architecturalShapes as any)[type];
        if (!shapeData) return;

        // Clone data
        const newNode = { ...shapeData, key: Date.now() }; // Simple unique key
        // Offset location more randomly to avoid stacking
        const diagram = diagramRef.current?.getDiagram();
        if (diagram) {
            const loc = diagram.viewportBounds.center;
            // Spread out more (+/- 50px)
            const offsetX = (Math.random() * 100) - 50;
            const offsetY = (Math.random() * 100) - 50;
            newNode.loc = `${loc.x + offsetX} ${loc.y + offsetY}`;
        } else {
            newNode.loc = "100 100";
        }

        setNodeDataArray(prev => [...prev, newNode]);
    };

    const clearGraph = () => {
        if (confirm('Clear canvas?')) {
            setNodeDataArray([]);
            setLinkDataArray([]);
        }
    };

    // Theme adaptation
    useEffect(() => {
        const diagram = diagramRef.current?.getDiagram();
        if (diagram) {
            diagram.div!.style.backgroundColor = computedColorScheme === 'dark' ? '#1A1B1E' : '#f8f9fa';
        }
    }, [computedColorScheme]);


    return (
        <div className={className}>
            {mode === 'instructor' && (
                <MantinePaper p="md" mb="md" withBorder>
                    <Group justify="space-between" mb="xs">
                        <Text size="sm" fw={500}>Component Palette</Text>
                        <Group gap="xs">
                            <Button size="xs" color="red" variant="subtle" onClick={clearGraph}>Clear Canvas</Button>
                            <Divider orientation="vertical" />
                            <Button size="xs" variant="outline" onClick={() => diagramRef.current?.getDiagram()?.commandHandler.undo()}>Undo</Button>
                            <Button size="xs" variant="outline" onClick={() => diagramRef.current?.getDiagram()?.commandHandler.redo()}>Redo</Button>
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
                    </Group>
                </MantinePaper>
            )}

            <ReactDiagram
                ref={diagramRef}
                initDiagram={initDiagram}
                divClassName='diagram-component'
                style={{ width: '100%', height: '600px', border: '1px solid #ddd' }}
                nodeDataArray={nodeDataArray}
                linkDataArray={linkDataArray}
                onModelChange={handleModelChange}
                skipsDiagramUpdate={false}
            />
        </div>
    );
};

export default DiagramEditor;
