import type {
    DOMConversionMap,
    DOMConversionOutput,
    DOMExportOutput,
    EditorConfig,
    LexicalEditor,
    LexicalNode,
    NodeKey,
    SerializedLexicalNode,
    Spread,
} from "lexical";

import { DecoratorNode } from "lexical";
import * as React from "react";
import InlineSvgComponent from "./InlineSvgComponent";

export type SerializedInlineSvgNode = Spread<
    {
        svg: string;
        caption?: string;
    },
    SerializedLexicalNode
>;

const DATA_ATTRIBUTE = "data-lexical-inline-svg";

function $convertInlineSvgElement(domNode: HTMLElement): DOMConversionOutput | null {
    if (!domNode.hasAttribute(DATA_ATTRIBUTE)) return null;

    const svgElement = domNode.querySelector("svg");
    const svg = svgElement ? svgElement.outerHTML : "";
    if (!svg) return null;

    const figcaption = domNode.querySelector("figcaption");
    const caption = figcaption?.textContent?.trim() || undefined;

    return { node: $createInlineSvgNode(svg, caption) };
}

export class InlineSvgNode extends DecoratorNode<React.JSX.Element> {
    __svg: string;
    __caption: string | undefined;

    static getType(): string {
        return "inline-svg";
    }

    static clone(node: InlineSvgNode): InlineSvgNode {
        return new InlineSvgNode(node.__svg, node.__caption, node.__key);
    }

    static importJSON(serializedNode: SerializedInlineSvgNode): InlineSvgNode {
        return new InlineSvgNode(
            serializedNode.svg,
            serializedNode.caption,
        ).updateFromJSON(serializedNode);
    }

    exportJSON(): SerializedInlineSvgNode {
        return {
            ...super.exportJSON(),
            svg: this.__svg,
            caption: this.__caption,
            type: "inline-svg",
            version: 1,
        };
    }

    constructor(svg: string, caption?: string, key?: NodeKey) {
        super(key);
        this.__svg = svg;
        this.__caption = caption;
    }

    createDOM(_config: EditorConfig): HTMLElement {
        const figure = document.createElement("figure");
        figure.style.display = "block";
        figure.style.margin = "1rem 0";
        figure.style.textAlign = "center";
        return figure;
    }

    updateDOM(): false {
        return false;
    }

    static importDOM(): DOMConversionMap | null {
        return {
            figure: (domNode: HTMLElement) => {
                if (!domNode.hasAttribute(DATA_ATTRIBUTE)) return null;
                return {
                    conversion: $convertInlineSvgElement,
                    priority: 2,
                };
            },
        };
    }

    exportDOM(_editor: LexicalEditor): DOMExportOutput {
        const figure = document.createElement("figure");
        figure.setAttribute(DATA_ATTRIBUTE, "true");
        figure.style.display = "block";
        figure.style.margin = "1rem 0";
        figure.style.textAlign = "center";

        const svgContainer = document.createElement("div");
        svgContainer.innerHTML = this.__svg;
        figure.appendChild(svgContainer);

        if (this.__caption) {
            const figcaption = document.createElement("figcaption");
            figcaption.textContent = this.__caption;
            figure.appendChild(figcaption);
        }

        return { element: figure };
    }

    getSvg(): string {
        return this.getLatest().__svg;
    }

    setSvg(svg: string): void {
        const self = this.getWritable();
        self.__svg = svg;
    }

    getCaption(): string | undefined {
        return this.getLatest().__caption;
    }

    setCaption(caption: string | undefined): void {
        const self = this.getWritable();
        self.__caption = caption;
    }

    decorate(_editor: LexicalEditor, _config: EditorConfig): React.JSX.Element {
        return <InlineSvgComponent svg={this.__svg} caption={this.__caption} />;
    }
}

export function $createInlineSvgNode(
    svg: string,
    caption?: string,
): InlineSvgNode {
    return new InlineSvgNode(svg, caption);
}

export function $isInlineSvgNode(
    node: LexicalNode | null | undefined,
): node is InlineSvgNode {
    return node instanceof InlineSvgNode;
}
