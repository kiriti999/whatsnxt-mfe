'use client';

import {
    $applyNodeReplacement,
    DecoratorNode,
    DOMConversionMap,
    DOMConversionOutput,
    DOMExportOutput,
    EditorConfig,
    LexicalNode,
    NodeKey,
    SerializedLexicalNode,
    Spread,
} from 'lexical';
import React from 'react';

export interface YouTubePayload {
    videoId: string;
    key?: NodeKey;
}

export type SerializedYouTubeNode = Spread<
    {
        videoId: string;
    },
    SerializedLexicalNode
>;

// Extract YouTube video ID from various URL formats
export function extractYouTubeVideoId(url: string): string | null {
    const patterns = [
        // Standard watch URL: https://www.youtube.com/watch?v=VIDEO_ID
        /(?:youtube\.com\/watch\?v=|youtube\.com\/watch\?.*&v=)([^&\s]+)/,
        // Short URL: https://youtu.be/VIDEO_ID
        /youtu\.be\/([^?\s]+)/,
        // Embed URL: https://www.youtube.com/embed/VIDEO_ID
        /youtube\.com\/embed\/([^?\s]+)/,
        // Shorts URL: https://www.youtube.com/shorts/VIDEO_ID
        /youtube\.com\/shorts\/([^?\s]+)/,
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
            return match[1];
        }
    }

    return null;
}

// Check if a URL is a YouTube URL
export function isYouTubeUrl(url: string): boolean {
    return extractYouTubeVideoId(url) !== null;
}

function convertYouTubeElement(domNode: Node): null | DOMConversionOutput {
    if (domNode instanceof HTMLIFrameElement) {
        const src = domNode.getAttribute('src');
        if (src && src.includes('youtube.com/embed/')) {
            const videoId = extractYouTubeVideoId(src);
            if (videoId) {
                const node = $createYouTubeNode({ videoId });
                return { node };
            }
        }
    }
    return null;
}

function YouTubeComponent({ videoId }: { videoId: string }): React.JSX.Element {
    return (
        <div
            style={{
                position: 'relative',
                width: '100%',
                maxWidth: '720px',
                margin: '1rem 0',
            }}
        >
            <div
                style={{
                    position: 'relative',
                    paddingBottom: '56.25%', // 16:9 aspect ratio
                    height: 0,
                    overflow: 'hidden',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                }}
            >
                <iframe
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        border: 'none',
                    }}
                    src={`https://www.youtube.com/embed/${videoId}`}
                    title="YouTube video player"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                />
            </div>
        </div>
    );
}

export class YouTubeNode extends DecoratorNode<React.JSX.Element> {
    __videoId: string;

    static getType(): string {
        return 'youtube';
    }

    static clone(node: YouTubeNode): YouTubeNode {
        return new YouTubeNode(node.__videoId, node.__key);
    }

    static importJSON(serializedNode: SerializedYouTubeNode): YouTubeNode {
        const node = $createYouTubeNode({ videoId: serializedNode.videoId });
        return node;
    }

    exportDOM(): DOMExportOutput {
        const element = document.createElement('iframe');
        element.setAttribute('src', `https://www.youtube.com/embed/${this.__videoId}`);
        element.setAttribute('width', '560');
        element.setAttribute('height', '315');
        element.setAttribute('frameborder', '0');
        element.setAttribute('allowfullscreen', 'true');
        element.setAttribute(
            'allow',
            'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
        );
        element.style.maxWidth = '100%';
        return { element };
    }

    static importDOM(): DOMConversionMap | null {
        return {
            iframe: () => ({
                conversion: convertYouTubeElement,
                priority: 1,
            }),
        };
    }

    constructor(videoId: string, key?: NodeKey) {
        super(key);
        this.__videoId = videoId;
    }

    exportJSON(): SerializedYouTubeNode {
        return {
            videoId: this.__videoId,
            type: 'youtube',
            version: 1,
        };
    }

    createDOM(config: EditorConfig): HTMLElement {
        const div = document.createElement('div');
        const theme = config.theme;
        const className = theme.youtube;
        if (className !== undefined) {
            div.className = className;
        }
        return div;
    }

    updateDOM(): false {
        return false;
    }

    getVideoId(): string {
        return this.__videoId;
    }

    decorate(): React.JSX.Element {
        return <YouTubeComponent videoId={this.__videoId} />;
    }
}

export function $createYouTubeNode({ videoId, key }: YouTubePayload): YouTubeNode {
    return $applyNodeReplacement(new YouTubeNode(videoId, key));
}

export function $isYouTubeNode(
    node: LexicalNode | null | undefined
): node is YouTubeNode {
    return node instanceof YouTubeNode;
}
