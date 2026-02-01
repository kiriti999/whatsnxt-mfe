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
import React, { Suspense } from 'react';

export interface ImagePayload {
    altText: string;
    height?: number;
    key?: NodeKey;
    maxWidth?: number;
    src: string;
    width?: number;
}

export type SerializedImageNode = Spread<
    {
        altText: string;
        height?: number;
        maxWidth?: number;
        src: string;
        width?: number;
    },
    SerializedLexicalNode
>;

function convertImageElement(domNode: Node): null | DOMConversionOutput {
    if (domNode instanceof HTMLImageElement) {
        const { alt: altText, src, width, height } = domNode;
        const node = $createImageNode({ altText, height, src, width });
        return { node };
    }
    return null;
}

const imageCache = new Set<string>();

function useSuspenseImage(src: string) {
    if (!imageCache.has(src)) {
        throw new Promise((resolve) => {
            const img = new Image();
            img.src = src;
            img.onload = () => {
                imageCache.add(src);
                resolve(null);
            };
            img.onerror = () => {
                imageCache.add(src);
                resolve(null);
            };
        });
    }
}

function LazyImage({
    altText,
    className,
    imageRef,
    src,
    width,
    height,
    maxWidth,
}: {
    altText: string;
    className: string | null;
    height: 'inherit' | number;
    imageRef: { current: null | HTMLImageElement };
    maxWidth: number;
    src: string;
    width: 'inherit' | number;
}): React.JSX.Element {
    useSuspenseImage(src);
    return (
        <img
            className={className || undefined}
            src={src}
            alt={altText}
            ref={imageRef}
            style={{
                height,
                maxWidth,
                width,
                display: 'block',
                margin: '1rem 0',
                borderRadius: '8px',
            }}
            draggable="false"
        />
    );
}

function ImageComponent({
    src,
    altText,
    width,
    height,
    maxWidth,
}: {
    altText: string;
    height: 'inherit' | number;
    maxWidth: number;
    src: string;
    width: 'inherit' | number;
}): React.JSX.Element {
    const imageRef = React.useRef<null | HTMLImageElement>(null);

    return (
        <Suspense fallback={<div style={{ padding: '1rem', background: '#f0f0f0', borderRadius: '8px' }}>Loading image...</div>}>
            <LazyImage
                className={null}
                src={src}
                altText={altText}
                imageRef={imageRef}
                width={width}
                height={height}
                maxWidth={maxWidth}
            />
        </Suspense>
    );
}

export class ImageNode extends DecoratorNode<React.JSX.Element> {
    __src: string;
    __altText: string;
    __width: 'inherit' | number;
    __height: 'inherit' | number;
    __maxWidth: number;

    static getType(): string {
        return 'image';
    }

    static clone(node: ImageNode): ImageNode {
        return new ImageNode(
            node.__src,
            node.__altText,
            node.__maxWidth,
            node.__width,
            node.__height,
            node.__key
        );
    }

    static importJSON(serializedNode: SerializedImageNode): ImageNode {
        const { altText, height, width, maxWidth, src } = serializedNode;
        const node = $createImageNode({
            altText,
            height,
            maxWidth,
            src,
            width,
        });
        return node;
    }

    exportDOM(): DOMExportOutput {
        const element = document.createElement('img');
        element.setAttribute('src', this.__src);
        element.setAttribute('alt', this.__altText);
        if (this.__width !== 'inherit') {
            element.setAttribute('width', this.__width.toString());
        }
        if (this.__height !== 'inherit') {
            element.setAttribute('height', this.__height.toString());
        }
        element.style.maxWidth = '100%';
        return { element };
    }

    static importDOM(): DOMConversionMap | null {
        return {
            img: () => ({
                conversion: convertImageElement,
                priority: 0,
            }),
        };
    }

    constructor(
        src: string,
        altText: string,
        maxWidth: number,
        width?: 'inherit' | number,
        height?: 'inherit' | number,
        key?: NodeKey
    ) {
        super(key);
        this.__src = src;
        this.__altText = altText;
        this.__maxWidth = maxWidth;
        this.__width = width || 'inherit';
        this.__height = height || 'inherit';
    }

    exportJSON(): SerializedImageNode {
        return {
            altText: this.getAltText(),
            height: this.__height === 'inherit' ? 0 : this.__height,
            maxWidth: this.__maxWidth,
            src: this.getSrc(),
            type: 'image',
            version: 1,
            width: this.__width === 'inherit' ? 0 : this.__width,
        };
    }

    setWidthAndHeight(
        width: 'inherit' | number,
        height: 'inherit' | number
    ): void {
        const writable = this.getWritable();
        writable.__width = width;
        writable.__height = height;
    }

    createDOM(config: EditorConfig): HTMLElement {
        const span = document.createElement('span');
        const theme = config.theme;
        const className = theme.image;
        if (className !== undefined) {
            span.className = className;
        }
        return span;
    }

    updateDOM(): false {
        return false;
    }

    getSrc(): string {
        return this.__src;
    }

    getAltText(): string {
        return this.__altText;
    }

    decorate(): React.JSX.Element {
        return (
            <ImageComponent
                src={this.__src}
                altText={this.__altText}
                width={this.__width}
                height={this.__height}
                maxWidth={this.__maxWidth}
            />
        );
    }
}

export function $createImageNode({
    altText,
    height,
    maxWidth = 800,
    src,
    width,
    key,
}: ImagePayload): ImageNode {
    return $applyNodeReplacement(
        new ImageNode(src, altText, maxWidth, width, height, key)
    );
}

export function $isImageNode(
    node: LexicalNode | null | undefined
): node is ImageNode {
    return node instanceof ImageNode;
}
