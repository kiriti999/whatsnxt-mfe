import {
    DOMConversionMap,
    DOMConversionOutput,
    DOMExportOutput,
    EditorConfig,
    ElementNode,
    LexicalNode,
    NodeKey,
    SerializedElementNode,
    Spread,
} from 'lexical';

// --- Collapsible Container Node ---
export type SerializedCollapsibleContainerNode = Spread<
    {
        open: boolean;
        type: 'collapsible-container';
        version: 1;
    },
    SerializedElementNode
>;

export class CollapsibleContainerNode extends ElementNode {
    __open: boolean;

    static getType(): string {
        return 'collapsible-container';
    }

    static clone(node: CollapsibleContainerNode): CollapsibleContainerNode {
        return new CollapsibleContainerNode(node.__open, node.__key);
    }

    constructor(open: boolean, key?: NodeKey) {
        super(key);
        this.__open = open;
    }

    createDOM(config: EditorConfig): HTMLElement {
        const dom = document.createElement('details');
        dom.classList.add('lexical-collapsible-container');
        if (this.__open) {
            dom.setAttribute('open', '');
        }
        dom.style.border = '1px solid #dee2e6';
        dom.style.borderRadius = '4px';
        dom.style.margin = '1rem 0';
        return dom;
    }

    updateDOM(prevNode: CollapsibleContainerNode, dom: HTMLDetailsElement): boolean {
        if (prevNode.__open !== this.__open) {
            if (this.__open) {
                dom.setAttribute('open', '');
            } else {
                dom.removeAttribute('open');
            }
        }
        return false;
    }

    static importJSON(serializedNode: SerializedCollapsibleContainerNode): CollapsibleContainerNode {
        return $createCollapsibleContainerNode(serializedNode.open);
    }

    exportJSON(): SerializedCollapsibleContainerNode {
        return {
            ...super.exportJSON(),
            open: this.__open,
            type: 'collapsible-container',
            version: 1,
        };
    }

    setOpen(open: boolean): void {
        const writable = this.getWritable();
        writable.__open = open;
    }

    getOpen(): boolean {
        return this.__open;
    }
}

export function $createCollapsibleContainerNode(open: boolean): CollapsibleContainerNode {
    return new CollapsibleContainerNode(open);
}

export function $isCollapsibleContainerNode(
    node: LexicalNode | null | undefined,
): node is CollapsibleContainerNode {
    return node instanceof CollapsibleContainerNode;
}

// --- Collapsible Title Node ---
export class CollapsibleTitleNode extends ElementNode {
    static getType(): string {
        return 'collapsible-title';
    }

    static clone(node: CollapsibleTitleNode): CollapsibleTitleNode {
        return new CollapsibleTitleNode(node.__key);
    }

    createDOM(config: EditorConfig): HTMLElement {
        const dom = document.createElement('summary');
        dom.classList.add('lexical-collapsible-title');
        dom.style.padding = '0.75rem 1rem';
        dom.style.fontWeight = 'bold';
        dom.style.cursor = 'pointer';
        dom.style.backgroundColor = '#f8f9fa';
        dom.style.listStyle = 'none';
        return dom;
    }

    updateDOM(): boolean {
        return false;
    }

    static importJSON(serializedNode: SerializedElementNode): CollapsibleTitleNode {
        return $createCollapsibleTitleNode();
    }

    exportJSON(): SerializedElementNode {
        return {
            ...super.exportJSON(),
            type: 'collapsible-title',
            version: 1,
        };
    }

    collapseAtStart(): boolean {
        return true;
    }
}

export function $createCollapsibleTitleNode(): CollapsibleTitleNode {
    return new CollapsibleTitleNode();
}

export function $isCollapsibleTitleNode(
    node: LexicalNode | null | undefined,
): node is CollapsibleTitleNode {
    return node instanceof CollapsibleTitleNode;
}

// --- Collapsible Content Node ---
export class CollapsibleContentNode extends ElementNode {
    static getType(): string {
        return 'collapsible-content';
    }

    static clone(node: CollapsibleContentNode): CollapsibleContentNode {
        return new CollapsibleContentNode(node.__key);
    }

    createDOM(config: EditorConfig): HTMLElement {
        const dom = document.createElement('div');
        dom.classList.add('lexical-collapsible-content');
        dom.style.padding = '1rem';
        dom.style.borderTop = '1px solid #dee2e6';
        return dom;
    }

    updateDOM(): boolean {
        return false;
    }

    static importJSON(serializedNode: SerializedElementNode): CollapsibleContentNode {
        return $createCollapsibleContentNode();
    }

    exportJSON(): SerializedElementNode {
        return {
            ...super.exportJSON(),
            type: 'collapsible-content',
            version: 1,
        };
    }
}

export function $createCollapsibleContentNode(): CollapsibleContentNode {
    return new CollapsibleContentNode();
}

export function $isCollapsibleContentNode(
    node: LexicalNode | null | undefined,
): node is CollapsibleContentNode {
    return node instanceof CollapsibleContentNode;
}
