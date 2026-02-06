import type { AppState, BinaryFiles, ExcalidrawImperativeAPI, ExcalidrawInitialDataState } from '@excalidraw/excalidraw/types';

import '@excalidraw/excalidraw/index.css';
import { Excalidraw } from '@excalidraw/excalidraw';
import { Button, Group } from '@mantine/core';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import styles from './ExcalidrawModal.module.css';

export type ExcalidrawInitialElements = ExcalidrawInitialDataState['elements'];

type Props = {
    closeOnClickOutside?: boolean;
    initialElements: ExcalidrawInitialElements;
    initialAppState: Partial<AppState>;
    initialFiles: BinaryFiles;
    isShown?: boolean;
    onClose: () => void;
    onDelete: () => void;
    onSave: (
        elements: ExcalidrawInitialElements,
        appState: Partial<AppState>,
        files: BinaryFiles,
    ) => void;
};

export default function ExcalidrawModal({
    closeOnClickOutside = false,
    onSave,
    initialElements,
    initialAppState,
    initialFiles,
    isShown = false,
    onDelete,
    onClose,
}: Props) {
    const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI | null>(null);
    const [discardModalOpen, setDiscardModalOpen] = useState(false);
    const [elements, setElements] = useState<ExcalidrawInitialElements>(initialElements);
    const [files, setFiles] = useState<BinaryFiles>(initialFiles);

    const save = () => {
        if (elements?.some((el: any) => !el.isDeleted)) {
            const appState = excalidrawAPI?.getAppState();
            // We only need a subset of the state
            const partialState: Partial<AppState> = {
                exportBackground: appState?.exportBackground,
                exportScale: appState?.exportScale,
                exportWithDarkMode: appState?.theme === 'dark',
                isBindingEnabled: appState?.isBindingEnabled,
                isLoading: appState?.isLoading,
                name: appState?.name,
                theme: appState?.theme,
                viewBackgroundColor: appState?.viewBackgroundColor,
                viewModeEnabled: appState?.viewModeEnabled,
                zenModeEnabled: appState?.zenModeEnabled,
                zoom: appState?.zoom,
            };
            onSave(elements, partialState, files);
        } else {
            // delete node if the scene is clear
            onDelete();
        }
    };

    const handleDiscard = () => {
        if (elements?.some((el: any) => !el.isDeleted)) {
            setDiscardModalOpen(true);
        } else {
            onClose();
        }
    };

    const onChange = (
        els: readonly any[],
        _: AppState,
        fls: BinaryFiles,
    ) => {
        setElements(els);
        setFiles(fls);
    };

    if (!isShown) {
        return null;
    }

    return createPortal(
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.row}>
                    {discardModalOpen && (
                        <div className={styles.discardModal}>
                            <p>Are you sure you want to discard the changes?</p>
                            <Group justify="flex-end" mt="md">
                                <Button variant="default" onClick={() => setDiscardModalOpen(false)}>
                                    Cancel
                                </Button>
                                <Button
                                    color="red"
                                    onClick={() => {
                                        setDiscardModalOpen(false);
                                        onClose();
                                    }}
                                >
                                    Discard
                                </Button>
                            </Group>
                        </div>
                    )}
                    <div className={styles.excalidrawContainer}>
                        <Excalidraw
                            onChange={onChange}
                            excalidrawAPI={(api) => setExcalidrawAPI(api)}
                            initialData={{
                                appState: {
                                    isLoading: false,
                                    currentItemStrokeWidth: 1, // Thin
                                    currentItemStrokeStyle: 'solid', // Solid
                                    currentItemRoughness: 0, // Architect (Clean)
                                    ...initialAppState,
                                },
                                elements: initialElements,
                                files: initialFiles,
                            }}
                        />
                    </div>
                    <Group justify="flex-end" p="md">
                        <Button variant="default" onClick={handleDiscard}>
                            Discard
                        </Button>
                        <Button onClick={save}>Save</Button>
                    </Group>
                </div>
            </div>
        </div>,
        document.body
    );
}
