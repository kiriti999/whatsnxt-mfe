import type { AppState, BinaryFiles, ExcalidrawInitialDataState } from '@excalidraw/excalidraw/types';
import type { NodeKey } from 'lexical';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection';
import { mergeRegister } from '@lexical/utils';
import {
    $getNodeByKey,
    CLICK_COMMAND,
    COMMAND_PRIORITY_LOW,
    KEY_DELETE_COMMAND,
    KEY_BACKSPACE_COMMAND,
} from 'lexical';
import { useCallback, useEffect, useMemo, useState } from 'react';
// Use type import only to avoid circular dependency
import type { ExcalidrawNode } from './ExcalidrawNode';
import ExcalidrawModal from './ExcalidrawModal';
import { exportToSvg } from '@excalidraw/excalidraw';
import { ActionIcon, Box, useMantineColorScheme } from '@mantine/core';
import { IconEdit } from '@tabler/icons-react';
import styles from './ExcalidrawComponent.module.css';
import { ExcalidrawFullscreen } from './ExcalidrawFullscreen';

export type ExcalidrawInitialElements = ExcalidrawInitialDataState['elements'];

export default function ExcalidrawComponent({
    nodeKey,
    data,
}: {
    data: string;
    nodeKey: NodeKey;
    width: 'inherit' | number;
    height: 'inherit' | number;
}) {
    const [editor] = useLexicalComposerContext();
    const { colorScheme } = useMantineColorScheme();
    const [isModalOpen, setModalOpen] = useState<boolean>(
        data === '[]' && editor.isEditable(),
    );
    const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey);
    const [svg, setSvg] = useState<SVGElement | null>(null);

    const { elements = [], files = {}, appState = {} } = useMemo(() => {
        try {
            return JSON.parse(data);
        } catch {
            return { elements: [], files: {}, appState: {} };
        }
    }, [data]);

    // Generate SVG preview
    useEffect(() => {
        if (elements.length > 0) {
            exportToSvg({
                elements,
                files,
                exportBackground: false,
                appState: {
                    ...appState,
                    exportWithDarkMode: colorScheme === 'dark',
                    viewBackgroundColor: 'transparent',
                } as AppState,
            }).then((svg) => {
                setSvg(svg);
            });
        }
    }, [elements, files, appState, colorScheme]);

    useEffect(() => {
        return mergeRegister(
            editor.registerCommand(
                CLICK_COMMAND,
                (event: MouseEvent) => {
                    const target = event.target as HTMLElement;
                    if (target.closest(`[data-excalidraw-key="${nodeKey}"]`)) {
                        if (!editor.isEditable()) {
                            return false;
                        }
                        if (!event.shiftKey) {
                            clearSelection();
                        }
                        setSelected(!isSelected);
                        if (event.detail > 1) {
                            // Double click
                            setModalOpen(true);
                        }
                        return true;
                    }
                    return false;
                },
                COMMAND_PRIORITY_LOW,
            ),
            editor.registerCommand(
                KEY_DELETE_COMMAND,
                (event) => {
                    if (isSelected) {
                        event.preventDefault();
                        deleteNode();
                        return true;
                    }
                    return false;
                },
                COMMAND_PRIORITY_LOW,
            ),
            editor.registerCommand(
                KEY_BACKSPACE_COMMAND,
                (event) => {
                    if (isSelected) {
                        event.preventDefault();
                        deleteNode();
                        return true;
                    }
                    return false;
                },
                COMMAND_PRIORITY_LOW,
            ),
        );
    }, [clearSelection, editor, isSelected, setSelected, nodeKey]);

    const deleteNode = useCallback(() => {
        setModalOpen(false);
        return editor.update(() => {
            const node = $getNodeByKey(nodeKey);
            if (node) {
                node.remove();
            }
        });
    }, [editor, nodeKey]);

    const setData = (
        els: ExcalidrawInitialElements,
        aps: Partial<AppState>,
        fls: BinaryFiles,
    ) => {
        return editor.update(() => {
            const node = $getNodeByKey(nodeKey);
            // Check type specifically to avoid runtime circular dependency with ExcalidrawNode import
            if (node && node.getType() === 'excalidraw') {
                const excalidrawNode = node as ExcalidrawNode;
                if ((els && els.length > 0) || Object.keys(fls).length > 0) {
                    excalidrawNode.setData(
                        JSON.stringify({
                            appState: aps,
                            elements: els,
                            files: fls,
                        }),
                    );
                } else {
                    node.remove();
                }
            }
        });
    };

    const openModal = useCallback(() => {
        setModalOpen(true);
    }, []);

    const closeModal = useCallback(() => {
        setModalOpen(false);
        if (elements.length === 0) {
            editor.update(() => {
                const node = $getNodeByKey(nodeKey);
                if (node) {
                    node.remove();
                }
            });
        }
    }, [editor, nodeKey, elements.length]);

    return (
        <>
            {isModalOpen && (
                <ExcalidrawModal
                    initialElements={elements}
                    initialFiles={files}
                    initialAppState={appState}
                    isShown={isModalOpen}
                    onDelete={deleteNode}
                    onClose={closeModal}
                    onSave={(els, aps, fls) => {
                        setData(els, aps, fls);
                        setModalOpen(false);
                    }}
                    closeOnClickOutside={false}
                />
            )}
            {elements.length > 0 && svg && (
                <Box
                    className={`${styles.excalidrawWrapper} ${isSelected ? styles.selected : ''}`}
                    data-excalidraw-key={nodeKey}
                >
                    <div
                        className={styles.excalidrawImage}
                        dangerouslySetInnerHTML={{ __html: svg.outerHTML }}
                    />
                    {/* Fullscreen button - always visible on hover */}
                    <ExcalidrawFullscreen svgContent={svg.outerHTML} />

                    {/* Edit button - only visible when editing */}
                    {isSelected && editor.isEditable() && (
                        <ActionIcon
                            className={styles.editButton}
                            onClick={openModal}
                            variant="filled"
                            color="blue"
                            size="lg"
                        >
                            <IconEdit size={18} />
                        </ActionIcon>
                    )}
                </Box>
            )}
        </>
    );
}
