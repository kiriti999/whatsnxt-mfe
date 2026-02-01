'use client';

import React, { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
    $createParagraphNode,
    $getSelection,
    $isRangeSelection,
    COMMAND_PRIORITY_HIGH,
    PASTE_COMMAND,
    LexicalCommand,
    createCommand,
} from 'lexical';
import { $createImageNode, ImageNode, ImagePayload } from '../nodes/ImageNode';

// Regular expression to match image URLs
const IMAGE_URL_REGEX = /^https?:\/\/.*\.(png|jpg|jpeg|gif|webp|svg|bmp)(\?.*)?$/i;

// Also match common image hosting patterns that might not have extensions
const IMAGE_HOSTING_REGEX = /^https?:\/\/(.*\.)?(miro\.medium\.com|imgur\.com|images\.unsplash\.com|i\.imgur\.com|cdn\.pixabay\.com|images\.pexels\.com)(\/.*)?$/i;

export const INSERT_IMAGE_COMMAND: LexicalCommand<ImagePayload> = createCommand('INSERT_IMAGE_COMMAND');

function isImageUrl(url: string): boolean {
    // Trim whitespace
    const trimmedUrl = url.trim();

    // Check if it matches image extension pattern
    if (IMAGE_URL_REGEX.test(trimmedUrl)) {
        return true;
    }

    // Check if it matches common image hosting patterns
    if (IMAGE_HOSTING_REGEX.test(trimmedUrl)) {
        return true;
    }

    return false;
}

export function ImagesPlugin(): React.JSX.Element | null {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        if (!editor.hasNodes([ImageNode])) {
            throw new Error('ImagesPlugin: ImageNode not registered on editor');
        }

        // Handle INSERT_IMAGE_COMMAND
        const unregisterInsertImage = editor.registerCommand<ImagePayload>(
            INSERT_IMAGE_COMMAND,
            (payload) => {
                const imageNode = $createImageNode(payload);
                const selection = $getSelection();

                if ($isRangeSelection(selection)) {
                    // Insert the image at the current selection
                    selection.insertNodes([imageNode]);

                    // Add a paragraph after the image for continued typing
                    const paragraph = $createParagraphNode();
                    imageNode.insertAfter(paragraph);
                    paragraph.select();
                }

                return true;
            },
            COMMAND_PRIORITY_HIGH
        );

        // Handle paste events to detect image URLs
        const unregisterPaste = editor.registerCommand(
            PASTE_COMMAND,
            (event: ClipboardEvent) => {
                const clipboardData = event.clipboardData;
                if (!clipboardData) {
                    return false;
                }

                // Check for pasted image files
                const files = clipboardData.files;
                if (files.length > 0) {
                    for (let i = 0; i < files.length; i++) {
                        const file = files[i];
                        if (file.type.startsWith('image/')) {
                            // Convert file to base64 data URL
                            const reader = new FileReader();
                            reader.onload = () => {
                                const dataUrl = reader.result as string;
                                editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
                                    src: dataUrl,
                                    altText: file.name || 'Pasted image',
                                });
                            };
                            reader.readAsDataURL(file);
                            event.preventDefault();
                            return true;
                        }
                    }
                }

                // Check for pasted text that might be an image URL
                const text = clipboardData.getData('text/plain');
                if (text && isImageUrl(text)) {
                    event.preventDefault();

                    editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
                        src: text.trim(),
                        altText: 'Image',
                    });

                    return true;
                }

                return false;
            },
            COMMAND_PRIORITY_HIGH
        );

        return () => {
            unregisterInsertImage();
            unregisterPaste();
        };
    }, [editor]);

    return null;
}

export default ImagesPlugin;
