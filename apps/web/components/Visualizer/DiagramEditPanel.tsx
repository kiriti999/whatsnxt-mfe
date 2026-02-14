'use client';

import React, { useState, useCallback } from 'react';
import {
    Paper,
    Text,
    TextInput,
    ColorInput,
    Select,
    Button,
    Group,
    Stack,
    Accordion,
    ActionIcon,
    Tooltip,
    ScrollArea,
    Divider,
    Textarea,
} from '@mantine/core';
import {
    IconX,
    IconTrash,
    IconPlus,
    IconArrowBackUp,
    IconArrowForwardUp,
    IconEdit,
} from '@tabler/icons-react';
import type { DiagramData, DiagramNode, DiagramEdge } from './types';
import styles from './visualizer.module.css';

interface DiagramEditPanelProps {
    diagramData: DiagramData;
    selectedNodeId: string | null;
    onSelectNode: (id: string | null) => void;
    onUpdateDiagram: (data: DiagramData) => void;
    onClose: () => void;
    canUndo: boolean;
    canRedo: boolean;
    onUndo: () => void;
    onRedo: () => void;
}

export function DiagramEditPanel({
    diagramData,
    selectedNodeId,
    onSelectNode,
    onUpdateDiagram,
    onClose,
    canUndo,
    canRedo,
    onUndo,
    onRedo,
}: DiagramEditPanelProps) {
    const selectedNode = selectedNodeId
        ? diagramData.nodes.find((n) => n.id === selectedNodeId) || null
        : null;

    // --- Diagram-level edits ---
    const updateTitle = useCallback(
        (title: string) => {
            onUpdateDiagram({ ...diagramData, title });
        },
        [diagramData, onUpdateDiagram],
    );

    const updateSubtitle = useCallback(
        (subtitle: string) => {
            onUpdateDiagram({ ...diagramData, subtitle });
        },
        [diagramData, onUpdateDiagram],
    );

    const updateBgColor = useCallback(
        (backgroundColor: string) => {
            if (/^#[0-9a-fA-F]{6}$/.test(backgroundColor) || backgroundColor === '') {
                onUpdateDiagram({ ...diagramData, backgroundColor: backgroundColor || '#ffffff' });
            }
        },
        [diagramData, onUpdateDiagram],
    );

    // --- Node-level edits ---
    const updateNode = useCallback(
        (nodeId: string, updates: Partial<DiagramNode>) => {
            const newNodes = diagramData.nodes.map((n) =>
                n.id === nodeId ? { ...n, ...updates } : n,
            );
            onUpdateDiagram({ ...diagramData, nodes: newNodes });
        },
        [diagramData, onUpdateDiagram],
    );

    const updateNodeStyle = useCallback(
        (nodeId: string, styleUpdates: Partial<DiagramNode['style']>) => {
            const newNodes = diagramData.nodes.map((n) =>
                n.id === nodeId
                    ? { ...n, style: { ...n.style, ...styleUpdates } }
                    : n,
            );
            onUpdateDiagram({ ...diagramData, nodes: newNodes });
        },
        [diagramData, onUpdateDiagram],
    );

    const deleteNode = useCallback(
        (nodeId: string) => {
            const newNodes = diagramData.nodes.filter((n) => n.id !== nodeId);
            const newEdges = diagramData.edges.filter(
                (e) => e.source !== nodeId && e.target !== nodeId,
            );
            onSelectNode(null);
            onUpdateDiagram({ ...diagramData, nodes: newNodes, edges: newEdges });
        },
        [diagramData, onUpdateDiagram, onSelectNode],
    );

    const addNode = useCallback(() => {
        const newId = `node-${Date.now()}`;
        const newNode: DiagramNode = {
            id: newId,
            label: 'New Node',
            description: 'Describe this node...',
            type: 'card',
            style: {
                backgroundColor: '#eef2ff',
                borderColor: '#6366f1',
                textColor: '#1a1a2e',
                borderRadius: 12,
            },
            icon: '📌',
            badge: `${diagramData.nodes.length + 1}`,
        };
        onUpdateDiagram({
            ...diagramData,
            nodes: [...diagramData.nodes, newNode],
        });
        onSelectNode(newId);
    }, [diagramData, onUpdateDiagram, onSelectNode]);

    // --- Edge-level edits ---
    const deleteEdge = useCallback(
        (edgeId: string) => {
            const newEdges = diagramData.edges.filter((e) => e.id !== edgeId);
            onUpdateDiagram({ ...diagramData, edges: newEdges });
        },
        [diagramData, onUpdateDiagram],
    );

    const updateEdgeLabel = useCallback(
        (edgeId: string, label: string) => {
            const newEdges = diagramData.edges.map((e) =>
                e.id === edgeId ? { ...e, label } : e,
            );
            onUpdateDiagram({ ...diagramData, edges: newEdges });
        },
        [diagramData, onUpdateDiagram],
    );

    return (
        <Paper className={styles.editPanel} shadow="lg" withBorder>
            {/* Edit Panel Header */}
            <div className={styles.editPanelHeader}>
                <Group justify="space-between">
                    <Group gap="xs">
                        <IconEdit size={18} />
                        <Text size="sm" fw={700}>
                            Edit Diagram
                        </Text>
                    </Group>
                    <Group gap={4}>
                        <Tooltip label="Undo (⌘Z)">
                            <ActionIcon
                                variant="subtle"
                                size="sm"
                                onClick={onUndo}
                                disabled={!canUndo}
                            >
                                <IconArrowBackUp size={16} />
                            </ActionIcon>
                        </Tooltip>
                        <Tooltip label="Redo (⌘⇧Z)">
                            <ActionIcon
                                variant="subtle"
                                size="sm"
                                onClick={onRedo}
                                disabled={!canRedo}
                            >
                                <IconArrowForwardUp size={16} />
                            </ActionIcon>
                        </Tooltip>
                        <ActionIcon variant="subtle" size="sm" onClick={onClose}>
                            <IconX size={16} />
                        </ActionIcon>
                    </Group>
                </Group>
            </div>

            <ScrollArea className={styles.editPanelBody} offsetScrollbars>
                <Accordion
                    variant="separated"
                    defaultValue={selectedNodeId ? 'node' : 'diagram'}
                    styles={{
                        item: { border: 'none', backgroundColor: 'transparent' },
                        control: { padding: '8px 0' },
                    }}
                >
                    {/* Diagram Settings */}
                    <Accordion.Item value="diagram">
                        <Accordion.Control>
                            <Text size="xs" fw={700} tt="uppercase" c="dimmed">
                                Diagram Settings
                            </Text>
                        </Accordion.Control>
                        <Accordion.Panel>
                            <Stack gap="sm">
                                <TextInput
                                    label="Title"
                                    value={diagramData.title}
                                    onChange={(e) => updateTitle(e.currentTarget.value)}
                                    size="xs"
                                />
                                <TextInput
                                    label="Subtitle"
                                    value={diagramData.subtitle || ''}
                                    onChange={(e) => updateSubtitle(e.currentTarget.value)}
                                    size="xs"
                                />
                                <ColorInput
                                    label="Background Color"
                                    value={diagramData.backgroundColor}
                                    onChange={updateBgColor}
                                    size="xs"
                                    format="hex"
                                />
                            </Stack>
                        </Accordion.Panel>
                    </Accordion.Item>

                    {/* Node List */}
                    <Accordion.Item value="nodes">
                        <Accordion.Control>
                            <Group justify="space-between" w="100%">
                                <Text size="xs" fw={700} tt="uppercase" c="dimmed">
                                    Nodes ({diagramData.nodes.length})
                                </Text>
                            </Group>
                        </Accordion.Control>
                        <Accordion.Panel>
                            <Stack gap="xs">
                                {diagramData.nodes.map((node) => (
                                    <div
                                        key={node.id}
                                        className={`${styles.editNodeItem} ${selectedNodeId === node.id ? styles.editNodeItemSelected : ''}`}
                                        onClick={() => onSelectNode(node.id)}
                                    >
                                        <Group justify="space-between" wrap="nowrap">
                                            <Group gap="xs" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
                                                {node.icon && <span>{node.icon}</span>}
                                                <Text size="xs" fw={600} truncate>
                                                    {node.label}
                                                </Text>
                                            </Group>
                                            <ActionIcon
                                                variant="subtle"
                                                size="xs"
                                                color="red"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteNode(node.id);
                                                }}
                                            >
                                                <IconTrash size={12} />
                                            </ActionIcon>
                                        </Group>
                                    </div>
                                ))}
                                <Button
                                    variant="light"
                                    size="xs"
                                    leftSection={<IconPlus size={14} />}
                                    onClick={addNode}
                                    fullWidth
                                >
                                    Add Node
                                </Button>
                            </Stack>
                        </Accordion.Panel>
                    </Accordion.Item>

                    {/* Selected Node Editor */}
                    {selectedNode && (
                        <Accordion.Item value="node">
                            <Accordion.Control>
                                <Text size="xs" fw={700} tt="uppercase" c="dimmed">
                                    Edit: {selectedNode.label}
                                </Text>
                            </Accordion.Control>
                            <Accordion.Panel>
                                <Stack gap="sm">
                                    <TextInput
                                        label="Label"
                                        value={selectedNode.label}
                                        onChange={(e) =>
                                            updateNode(selectedNode.id, {
                                                label: e.currentTarget.value,
                                            })
                                        }
                                        size="xs"
                                    />
                                    <Textarea
                                        label="Description"
                                        value={selectedNode.description || ''}
                                        onChange={(e) =>
                                            updateNode(selectedNode.id, {
                                                description: e.currentTarget.value,
                                            })
                                        }
                                        size="xs"
                                        minRows={2}
                                        autosize
                                    />
                                    <TextInput
                                        label="Icon (emoji)"
                                        value={selectedNode.icon || ''}
                                        onChange={(e) =>
                                            updateNode(selectedNode.id, {
                                                icon: e.currentTarget.value,
                                            })
                                        }
                                        size="xs"
                                    />
                                    <TextInput
                                        label="Badge"
                                        value={selectedNode.badge || ''}
                                        onChange={(e) =>
                                            updateNode(selectedNode.id, {
                                                badge: e.currentTarget.value,
                                            })
                                        }
                                        size="xs"
                                    />
                                    <Divider labelPosition="center" label="Colors" />
                                    <ColorInput
                                        label="Background"
                                        value={selectedNode.style.backgroundColor}
                                        onChange={(c) =>
                                            /^#[0-9a-fA-F]{6}$/.test(c) &&
                                            updateNodeStyle(selectedNode.id, {
                                                backgroundColor: c,
                                            })
                                        }
                                        size="xs"
                                        format="hex"
                                    />
                                    <ColorInput
                                        label="Border"
                                        value={selectedNode.style.borderColor}
                                        onChange={(c) =>
                                            /^#[0-9a-fA-F]{6}$/.test(c) &&
                                            updateNodeStyle(selectedNode.id, {
                                                borderColor: c,
                                            })
                                        }
                                        size="xs"
                                        format="hex"
                                    />
                                    <ColorInput
                                        label="Text Color"
                                        value={selectedNode.style.textColor}
                                        onChange={(c) =>
                                            /^#[0-9a-fA-F]{6}$/.test(c) &&
                                            updateNodeStyle(selectedNode.id, {
                                                textColor: c,
                                            })
                                        }
                                        size="xs"
                                        format="hex"
                                    />
                                    <Button
                                        variant="light"
                                        color="red"
                                        size="xs"
                                        leftSection={<IconTrash size={14} />}
                                        onClick={() => deleteNode(selectedNode.id)}
                                        mt="xs"
                                        fullWidth
                                    >
                                        Delete Node
                                    </Button>
                                </Stack>
                            </Accordion.Panel>
                        </Accordion.Item>
                    )}

                    {/* Edges */}
                    {diagramData.edges.length > 0 && (
                        <Accordion.Item value="edges">
                            <Accordion.Control>
                                <Text size="xs" fw={700} tt="uppercase" c="dimmed">
                                    Edges ({diagramData.edges.length})
                                </Text>
                            </Accordion.Control>
                            <Accordion.Panel>
                                <Stack gap="xs">
                                    {diagramData.edges.map((edge) => {
                                        const srcNode = diagramData.nodes.find(
                                            (n) => n.id === edge.source,
                                        );
                                        const tgtNode = diagramData.nodes.find(
                                            (n) => n.id === edge.target,
                                        );
                                        return (
                                            <div key={edge.id} className={styles.editNodeItem}>
                                                <Group
                                                    justify="space-between"
                                                    wrap="nowrap"
                                                    gap="xs"
                                                >
                                                    <Text
                                                        size="xs"
                                                        c="dimmed"
                                                        truncate
                                                        style={{ flex: 1, minWidth: 0 }}
                                                    >
                                                        {srcNode?.label || edge.source} →{' '}
                                                        {tgtNode?.label || edge.target}
                                                    </Text>
                                                    <ActionIcon
                                                        variant="subtle"
                                                        size="xs"
                                                        color="red"
                                                        onClick={() => deleteEdge(edge.id)}
                                                    >
                                                        <IconTrash size={12} />
                                                    </ActionIcon>
                                                </Group>
                                                <TextInput
                                                    placeholder="Edge label"
                                                    value={edge.label || ''}
                                                    onChange={(e) =>
                                                        updateEdgeLabel(
                                                            edge.id,
                                                            e.currentTarget.value,
                                                        )
                                                    }
                                                    size="xs"
                                                    mt={4}
                                                />
                                            </div>
                                        );
                                    })}
                                </Stack>
                            </Accordion.Panel>
                        </Accordion.Item>
                    )}
                </Accordion>
            </ScrollArea>
        </Paper>
    );
}
