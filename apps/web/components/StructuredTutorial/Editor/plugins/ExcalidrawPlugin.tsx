import type { AppState, BinaryFiles, ExcalidrawInitialDataState } from '@excalidraw/excalidraw/types';

import '@excalidraw/excalidraw/index.css';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $wrapNodeInElement } from '@lexical/utils';
import {
    $createParagraphNode,
    $insertNodes,
    $isRootOrShadowRoot,
    COMMAND_PRIORITY_EDITOR,
    createCommand,
    LexicalCommand,
} from 'lexical';
import { useEffect, useState } from 'react';

import {
    $createExcalidrawNode,
    ExcalidrawNode,
} from '../nodes/ExcalidrawNode';
import ExcalidrawModal from '../nodes/ExcalidrawModal';

export type ExcalidrawInitialElements = ExcalidrawInitialDataState['elements'];

export const INSERT_EXCALIDRAW_COMMAND: LexicalCommand<void> = createCommand(
    'INSERT_EXCALIDRAW_COMMAND',
);

export default function ExcalidrawPlugin() {
    const [editor] = useLexicalComposerContext();
    const [isModalOpen, setModalOpen] = useState<boolean>(false);

    useEffect(() => {
        if (!editor.hasNodes([ExcalidrawNode])) {
            throw new Error(
                'ExcalidrawPlugin: ExcalidrawNode not registered on editor',
            );
        }

        return editor.registerCommand(
            INSERT_EXCALIDRAW_COMMAND,
            () => {
                setModalOpen(true);
                return true;
            },
            COMMAND_PRIORITY_EDITOR,
        );
    }, [editor]);

    const onClose = () => {
        setModalOpen(false);
    };

    const onDelete = () => {
        setModalOpen(false);
    };

    const onSave = (
        elements: ExcalidrawInitialElements,
        appState: Partial<AppState>,
        files: BinaryFiles,
    ) => {
        editor.update(() => {
            const excalidrawNode = $createExcalidrawNode();
            excalidrawNode.setData(
                JSON.stringify({
                    appState,
                    elements,
                    files,
                }),
            );
            $insertNodes([excalidrawNode]);
            if ($isRootOrShadowRoot(excalidrawNode.getParentOrThrow())) {
                $wrapNodeInElement(excalidrawNode, $createParagraphNode).selectEnd();
            }
        });
        setModalOpen(false);
    };

    return isModalOpen ? (
        <ExcalidrawModal
            initialElements={[]}
            initialAppState={{}}
            initialFiles={{}}
            isShown={isModalOpen}
            onDelete={onDelete}
            onClose={onClose}
            onSave={onSave}
            closeOnClickOutside={false}
        />
    ) : null;
}
