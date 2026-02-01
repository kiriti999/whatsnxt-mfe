'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
    $getNearestNodeFromDOMNode,
    $getNodeByKey,
    $getRoot,
    $createParagraphNode,
    COMMAND_PRIORITY_HIGH,
    DROP_COMMAND,
    DRAGOVER_COMMAND,
    LexicalEditor,
    NodeKey,
} from 'lexical';
import { mergeRegister } from '@lexical/utils';
import { ActionIcon } from '@mantine/core';
import { IconPlus, IconGripVertical } from '@tabler/icons-react';
import styles from './DraggableBlockPlugin.module.css';

const DRAG_DATA_FORMAT = 'application/x-lexical-drag-block';

// Global variable to track the node being dragged
let draggedNodeKey: NodeKey | null = null;

function DraggableBlockMenu({
    anchorElement,
    editor,
}: {
    anchorElement: HTMLElement;
    editor: LexicalEditor;
}) {
    const menuRef = useRef<HTMLDivElement>(null);
    const targetNodeKeyRef = useRef<NodeKey | null>(null);
    const [targetNodeKey, setTargetNodeKey] = useState<NodeKey | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [top, setTop] = useState<number>(0);

    const updateMenuPosition = useCallback((targetElement: HTMLElement | null) => {
        if (!targetElement || !menuRef.current) return;

        const { top: targetTop } = targetElement.getBoundingClientRect();
        const { top: anchorTop } = anchorElement.getBoundingClientRect();

        setTop(targetTop - anchorTop + 4);
    }, [anchorElement]);

    useEffect(() => {
        const onMouseMove = (event: MouseEvent) => {
            const rootElement = editor.getRootElement();
            if (!rootElement) return;

            const rect = rootElement.getBoundingClientRect();
            const target = event.target as HTMLElement;

            // Expanded hit area check
            const isInsideAllowedArea =
                event.clientY >= rect.top &&
                event.clientY <= rect.bottom &&
                event.clientX >= rect.left - 60 &&
                event.clientX <= rect.right;

            if (!isInsideAllowedArea) {
                if (menuRef.current && !menuRef.current.contains(target)) {
                    setIsVisible(false);
                }
                return;
            }

            // If hovering the menu itself, keep it visible
            if (menuRef.current && menuRef.current.contains(target)) {
                return;
            }

            // Look for the element at the cursor's Y position, but slightly inside the text area (X)
            // This bypasses the padding area where there might be no element
            const x = rect.left + 60; // 50px padding + 10px buffer
            const y = event.clientY;
            const elementAtPoint = document.elementFromPoint(x, y);

            if (elementAtPoint && rootElement.contains(elementAtPoint)) {
                editor.update(() => {
                    const node = $getNearestNodeFromDOMNode(elementAtPoint as HTMLElement);
                    if (node) {
                        try {
                            const topLevelElement = node.getTopLevelElementOrThrow();
                            const key = topLevelElement.getKey();
                            if (key !== targetNodeKeyRef.current) {
                                targetNodeKeyRef.current = key;
                                setTargetNodeKey(key);
                                const domElement = editor.getElementByKey(key);
                                if (domElement) {
                                    updateMenuPosition(domElement);
                                }
                            }
                            setIsVisible(true);
                        } catch (e) {
                            // Ignore if node doesn't have a top level element
                        }
                    }
                });
            } else {
                // If we drift too far right without hitting an element, hide
                if (event.clientX > rect.right) {
                    setIsVisible(false);
                }
            }
        };

        document.addEventListener('mousemove', onMouseMove);
        return () => {
            document.removeEventListener('mousemove', onMouseMove);
        };
    }, [editor, updateMenuPosition]);

    const onDragStart = (event: React.DragEvent) => {
        const dataTransfer = event.dataTransfer;
        if (!dataTransfer || !targetNodeKey) return;

        draggedNodeKey = targetNodeKey;
        dataTransfer.setData(DRAG_DATA_FORMAT, targetNodeKey);
        dataTransfer.effectAllowed = 'move';

        const domElement = editor.getElementByKey(targetNodeKey);
        if (domElement) {
            dataTransfer.setDragImage(domElement, 0, 0);
        }

        setTimeout(() => setIsVisible(false), 0);
    };

    const onDragEnd = () => {
        draggedNodeKey = null;
    };

    const onAddBlock = () => {
        if (!targetNodeKey) return;
        editor.update(() => {
            const node = $getNodeByKey(targetNodeKey);
            if (node) {
                const topBlock = node.getTopLevelElementOrThrow();
                const p = $createParagraphNode();
                topBlock.insertAfter(p);
                p.select();
            }
        });
    };

    if (!isVisible) return null;

    return (
        <div
            ref={menuRef}
            className={styles.draggableBlockMenu}
            style={{ top: `${top}px`, left: '8px', opacity: isVisible ? 1 : 0 }}
            onMouseEnter={() => setIsVisible(true)}
        >
            <ActionIcon
                variant="subtle"
                size="xs"
                onClick={onAddBlock}
                className={styles.iconButton}
            >
                <IconPlus size={14} />
            </ActionIcon>
            <div
                draggable
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                className={styles.dragHandle}
            >
                <IconGripVertical size={16} />
            </div>
        </div>
    );
}

export default function DraggableBlockPlugin(): React.JSX.Element | null {
    const [editor] = useLexicalComposerContext();
    const [anchorElement, setAnchorElement] = useState<HTMLElement | null>(null);

    useEffect(() => {
        const rootElement = editor.getRootElement();
        if (rootElement) {
            setAnchorElement(rootElement.parentElement);
        }

        return mergeRegister(
            editor.registerCommand(
                DRAGOVER_COMMAND,
                (event: DragEvent) => {
                    if (draggedNodeKey) {
                        event.preventDefault();
                        return true;
                    }
                    return false;
                },
                COMMAND_PRIORITY_HIGH // Increased priority
            ),
            editor.registerCommand(
                DROP_COMMAND,
                (event: DragEvent) => {
                    if (!draggedNodeKey) return false;

                    event.preventDefault();
                    const target = event.target as HTMLElement;

                    editor.update(() => {
                        const sourceNode = $getNodeByKey(draggedNodeKey!);
                        if (!sourceNode) return;
                        const sourceBlock = sourceNode.getTopLevelElementOrThrow();

                        // Attempt to resolve target node from DOM
                        let targetBlock = null;
                        let closestDistance = Infinity;

                        // 1. Try direct node resolution
                        const targetNode = $getNearestNodeFromDOMNode(target);

                        if (targetNode) {
                            // Check if it's the root node itself (happens when dropping on padding)
                            if (targetNode === $getRoot()) {
                                // We need to fallback to coordinate finding
                                targetBlock = null;
                            } else {
                                try {
                                    targetBlock = targetNode.getTopLevelElementOrThrow();
                                } catch (e) {
                                    targetBlock = null;
                                }
                            }
                        }

                        // 2. Fallback: Geometry-based detection if we dropped on the shell/root
                        if (!targetBlock) {
                            const root = $getRoot();
                            const children = root.getChildren();
                            const mouseY = event.clientY;

                            // Iterate all top-level blocks to find the closest one to the mouse Y
                            children.forEach((child) => {
                                const key = child.getKey();
                                const dom = editor.getElementByKey(key);
                                if (dom) {
                                    const rect = dom.getBoundingClientRect();
                                    const centerY = rect.top + rect.height / 2;
                                    const distance = Math.abs(mouseY - centerY);

                                    if (distance < closestDistance) {
                                        closestDistance = distance;
                                        targetBlock = child;
                                    }
                                }
                            });
                        }

                        if (targetBlock && sourceBlock.getKey() !== targetBlock.getKey()) {
                            const targetDOM = editor.getElementByKey(targetBlock.getKey());
                            if (targetDOM) {
                                const rect = targetDOM.getBoundingClientRect();
                                // Insert before if mouse is in top half, after if in bottom half
                                if (event.clientY < rect.top + rect.height / 2) {
                                    targetBlock.insertBefore(sourceBlock);
                                } else {
                                    targetBlock.insertAfter(sourceBlock);
                                }
                            }
                        }

                        draggedNodeKey = null;
                    });

                    return true;
                },
                COMMAND_PRIORITY_HIGH
            )
        );
    }, [editor]);

    if (!anchorElement) return null;

    return createPortal(
        <DraggableBlockMenu anchorElement={anchorElement} editor={editor} />,
        anchorElement
    );
}
