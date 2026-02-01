import {
    EditorConfig,
    ElementNode,
    LexicalNode,
    NodeKey,
    SerializedElementNode,
    Spread,
} from 'lexical';

export type SerializedStickyNode = Spread<
    {
        color: 'yellow' | 'pink' | 'blue' | 'green';
        type: 'sticky';
        version: 1;
    },
    SerializedElementNode
>;

export class StickyNode extends ElementNode {
    __color: 'yellow' | 'pink' | 'blue' | 'green';

    static getType(): string {
        return 'sticky';
    }

    static clone(node: StickyNode): StickyNode {
        return new StickyNode(node.__color, node.__key);
    }

    constructor(color: 'yellow' | 'pink' | 'blue' | 'green' = 'yellow', key?: NodeKey) {
        super(key);
        this.__color = color;
    }

    createDOM(config: EditorConfig): HTMLElement {
        const dom = document.createElement('div');
        dom.classList.add('lexical-sticky-note');
        dom.classList.add(`lexical-sticky-note-${this.__color}`);

        // Default styles if CSS class is missing
        const colors = {
            yellow: { bg: '#fff9db', border: '#fab005' },
            pink: { bg: '#fff0f6', border: '#f06595' },
            blue: { bg: '#e7f5ff', border: '#228be6' },
            green: { bg: '#ebfbee', border: '#40c057' },
        };

        const colorSet = colors[this.__color] || colors.yellow;
        dom.style.backgroundColor = colorSet.bg;
        dom.style.borderLeft = `5px solid ${colorSet.border}`;
        dom.style.padding = '1rem';
        dom.style.margin = '1rem 0';
        dom.style.borderRadius = '0 4px 4px 0';
        dom.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';

        return dom;
    }

    updateDOM(): boolean {
        return false;
    }

    static importJSON(serializedNode: SerializedStickyNode): StickyNode {
        const node = $createStickyNode(serializedNode.color);
        return node;
    }

    exportJSON(): SerializedStickyNode {
        return {
            ...super.exportJSON(),
            color: this.__color,
            type: 'sticky',
            version: 1,
        };
    }

    canBeEmpty(): false {
        return false;
    }

    canIndent(): false {
        return false;
    }
}

export function $createStickyNode(color?: 'yellow' | 'pink' | 'blue' | 'green'): StickyNode {
    return new StickyNode(color);
}

export function $isStickyNode(
    node: LexicalNode | null | undefined,
): node is StickyNode {
    return node instanceof StickyNode;
}
