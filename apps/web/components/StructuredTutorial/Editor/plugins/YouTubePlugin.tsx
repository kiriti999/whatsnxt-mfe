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
import {
    $createYouTubeNode,
    YouTubeNode,
    YouTubePayload,
    extractYouTubeVideoId,
    isYouTubeUrl,
} from '../nodes/YouTubeNode';

export const INSERT_YOUTUBE_COMMAND: LexicalCommand<YouTubePayload> = createCommand('INSERT_YOUTUBE_COMMAND');

export function YouTubePlugin(): React.JSX.Element | null {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        if (!editor.hasNodes([YouTubeNode])) {
            throw new Error('YouTubePlugin: YouTubeNode not registered on editor');
        }

        // Handle INSERT_YOUTUBE_COMMAND
        const unregisterInsertYouTube = editor.registerCommand<YouTubePayload>(
            INSERT_YOUTUBE_COMMAND,
            (payload) => {
                const youtubeNode = $createYouTubeNode(payload);
                const selection = $getSelection();

                if ($isRangeSelection(selection)) {
                    // Insert the YouTube embed at the current selection
                    selection.insertNodes([youtubeNode]);

                    // Add a paragraph after the embed for continued typing
                    const paragraph = $createParagraphNode();
                    youtubeNode.insertAfter(paragraph);
                    paragraph.select();
                }

                return true;
            },
            COMMAND_PRIORITY_HIGH
        );

        // Handle paste events to detect YouTube URLs
        const unregisterPaste = editor.registerCommand(
            PASTE_COMMAND,
            (event: ClipboardEvent) => {
                const clipboardData = event.clipboardData;
                if (!clipboardData) {
                    return false;
                }

                // Check for pasted text that might be a YouTube URL
                const text = clipboardData.getData('text/plain');
                if (text && isYouTubeUrl(text)) {
                    const videoId = extractYouTubeVideoId(text.trim());

                    if (videoId) {
                        event.preventDefault();

                        editor.dispatchCommand(INSERT_YOUTUBE_COMMAND, {
                            videoId,
                        });

                        return true;
                    }
                }

                return false;
            },
            COMMAND_PRIORITY_HIGH
        );

        return () => {
            unregisterInsertYouTube();
            unregisterPaste();
        };
    }, [editor]);

    return null;
}

export default YouTubePlugin;
