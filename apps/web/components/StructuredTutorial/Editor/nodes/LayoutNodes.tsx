import {
    EditorConfig,
    ElementNode,
    LexicalNode,
    NodeKey,
    SerializedElementNode,
    Spread,
} from 'lexical';

export type SerializedLayoutContainerNode = Spread<
    {
        templateColumns: string;
        type: 'layout-container';
        version: 1;
    },
    SerializedElementNode
>;

export class LayoutContainerNode extends ElementNode {
    __templateColumns: string;

    static getType(): string {
        return 'layout-container';
    }

    static clone(node: LayoutContainerNode): LayoutContainerNode {
        return new LayoutContainerNode(node.__templateColumns, node.__key);
    }

    constructor(templateColumns: string, key?: NodeKey) {
        super(key);
        this.__templateColumns = templateColumns;
    }

    createDOM(config: EditorConfig): HTMLElement {
        const dom = document.createElement('div');
        dom.classList.add('lexical-layout-container');
        dom.style.display = 'grid';
        dom.style.gridTemplateColumns = this.__templateColumns;
        dom.style.gap = '1rem';
        dom.style.margin = '1rem 0';
        return dom;
    }

    updateDOM(prevNode: LayoutContainerNode, dom: HTMLElement): boolean {
        if (prevNode.__templateColumns !== this.__templateColumns) {
            dom.style.gridTemplateColumns = this.__templateColumns;
        }
        return false;
    }

    static importJSON(serializedNode: SerializedLayoutContainerNode): LayoutContainerNode {
        return $createLayoutContainerNode(serializedNode.templateColumns);
    }

    exportJSON(): SerializedLayoutContainerNode {
        return {
            ...super.exportJSON(),
            templateColumns: this.__templateColumns,
            type: 'layout-container',
            version: 1,
        };
    }
}

export function $createLayoutContainerNode(templateColumns: string): LayoutContainerNode {
    return new LayoutContainerNode(templateColumns);
}

export function $isLayoutContainerNode(
    node: LexicalNode | null | undefined,
): node is LayoutContainerNode {
    return node instanceof LayoutContainerNode;
}

export class LayoutItemNode extends ElementNode {
    static getType(): string {
        return 'layout-item';
    }

    static clone(node: LayoutItemNode): LayoutItemNode {
        return new LayoutItemNode(node.__key);
    }

    createDOM(config: EditorConfig): HTMLElement {
        const dom = document.createElement('div');
        dom.classList.add('lexical-layout-item');
        dom.style.border = '1px dashed #ced4da';
        dom.style.padding = '0.5rem';
        dom.style.borderRadius = '4px';
        return dom;
    }

    updateDOM(): boolean {
        return false;
    }

    static importJSON(serializedNode: SerializedElementNode): LayoutItemNode {
        return $createLayoutItemNode();
    }

    exportJSON(): SerializedElementNode {
        return {
            ...super.exportJSON(),
            type: 'layout-item',
            version: 1,
        };
    }
}

export function $createLayoutItemNode(): LayoutItemNode {
    return new LayoutItemNode();
}

export function $isLayoutItemNode(
    node: LexicalNode | null | undefined,
): node is LayoutItemNode {
    return node instanceof LayoutItemNode;
}
