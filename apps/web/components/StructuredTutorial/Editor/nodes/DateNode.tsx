import {
    DOMConversionMap,
    DOMConversionOutput,
    DOMExportOutput,
    EditorConfig,
    LexicalNode,
    NodeKey,
    SerializedTextNode,
    TextNode,
    Spread,
} from 'lexical';

export type SerializedDateNode = Spread<
    {
        date: string;
        type: 'date';
        version: 1;
    },
    SerializedTextNode
>;

export class DateNode extends TextNode {
    __date: string;

    static getType(): string {
        return 'date';
    }

    static clone(node: DateNode): DateNode {
        return new DateNode(node.__date, node.__key);
    }

    constructor(date: string, key?: NodeKey) {
        super(date, key);
        this.__date = date;
    }

    static importJSON(serializedNode: SerializedDateNode): DateNode {
        const node = $createDateNode(serializedNode.date);
        node.setFormat(serializedNode.format);
        node.setDetail(serializedNode.detail);
        node.setMode(serializedNode.mode);
        node.setStyle(serializedNode.style);
        return node;
    }

    exportJSON(): SerializedDateNode {
        return {
            ...super.exportJSON(),
            date: this.__date,
            type: 'date',
            version: 1,
        };
    }

    createDOM(config: EditorConfig): HTMLElement {
        const dom = super.createDOM(config);
        dom.classList.add('lexical-date');
        dom.style.backgroundColor = '#e7f5ff';
        dom.style.padding = '2px 4px';
        dom.style.borderRadius = '4px';
        dom.style.color = '#1971c2';
        dom.style.fontWeight = '500';
        return dom;
    }

    exportDOM(): DOMExportOutput {
        const element = document.createElement('span');
        element.classList.add('lexical-date');
        element.textContent = this.__date;
        return { element };
    }

    static importDOM(): DOMConversionMap | null {
        return {
            span: (domNode: HTMLElement) => {
                if (!domNode.classList.contains('lexical-date')) {
                    return null;
                }
                return {
                    conversion: convertDateElement,
                    priority: 1,
                };
            },
        };
    }
}

function convertDateElement(domNode: HTMLElement): DOMConversionOutput {
    const textContent = domNode.textContent;
    if (textContent !== null) {
        const node = $createDateNode(textContent);
        return { node };
    }
    return { node: null };
}

export function $createDateNode(date: string): DateNode {
    return new DateNode(date);
}

export function $isDateNode(
    node: LexicalNode | null | undefined,
): node is DateNode {
    return node instanceof DateNode;
}
