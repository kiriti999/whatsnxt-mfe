import {
    DecoratorNode,
    DOMExportOutput,
    LexicalNode,
    NodeKey,
    SerializedLexicalNode,
    Spread,
} from 'lexical';
import React from 'react';

export type SerializedPageBreakNode = Spread<
    {
        type: 'pagebreak';
        version: 1;
    },
    SerializedLexicalNode
>;

export class PageBreakNode extends DecoratorNode<React.ReactNode> {
    static getType(): string {
        return 'pagebreak';
    }

    static clone(node: PageBreakNode): PageBreakNode {
        return new PageBreakNode(node.__key);
    }

    static importJSON(serializedNode: SerializedPageBreakNode): PageBreakNode {
        return $createPageBreakNode();
    }

    exportJSON(): SerializedPageBreakNode {
        return {
            type: 'pagebreak',
            version: 1,
        };
    }

    createDOM(): HTMLElement {
        const el = document.createElement('div');
        el.style.pageBreakAfter = 'always';
        el.classList.add('lexical-page-break');
        return el;
    }

    updateDOM(): boolean {
        return false;
    }

    exportDOM(): DOMExportOutput {
        const element = document.createElement('hr');
        element.setAttribute('data-lexical-page-break', 'true');
        element.style.pageBreakAfter = 'always';
        element.style.border = 'none';
        element.style.borderTop = '2px dashed #ccc';
        element.style.margin = '2rem 0';
        return { element };
    }

    decorate(): React.ReactNode {
        return (
            <div
                style={{
                    borderTop: '2px dashed #ced4da',
                    margin: '2rem 0',
                    padding: '1rem 0',
                    position: 'relative',
                    display: 'flex',
                    justifyContent: 'center',
                    userSelect: 'none',
                }}
            >
                <span
                    style={{
                        position: 'absolute',
                        top: '-10px',
                        backgroundColor: '#f8f9fa',
                        padding: '0 10px',
                        fontSize: '12px',
                        color: '#6c757d',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                    }}
                >
                    Page Break
                </span>
            </div>
        );
    }
}

export function $createPageBreakNode(): PageBreakNode {
    return new PageBreakNode();
}

export function $isPageBreakNode(
    node: LexicalNode | null | undefined,
): node is PageBreakNode {
    return node instanceof PageBreakNode;
}
