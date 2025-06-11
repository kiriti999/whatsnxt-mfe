import { Extension } from "@tiptap/core"
import { TextSelection, AllSelection } from "prosemirror-state"

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        indent: {
            /**
             * Indent the current node
             */
            indent: () => ReturnType,
            /**
             * Outdent the current node
             */
            outdent: () => ReturnType,
        }
    }
}

function isList(node, schema) {
    return (node.type === schema.nodes.bulletList ||
        node.type === schema.nodes.orderedList ||
        node.type === schema.nodes.todoList);
}

function getNodeAttrs(node) {
    return node.attrs.indent || 0;
}

function setNodeIndentMarkup(tr, pos, delta) {
    if (!tr.doc) return tr;

    const node = tr.doc.nodeAt(pos);
    if (!node) return tr;

    const minIndent = 0;
    const maxIndent = 8;

    const indent = Math.min(Math.max(getNodeAttrs(node) + delta, minIndent), maxIndent);

    if (indent === getNodeAttrs(node)) return tr;

    const nodeAttrs = {
        ...node.attrs,
        indent
    };

    return tr.setNodeMarkup(pos, node.type, nodeAttrs, node.marks);
}

function updateIndentLevel(tr, delta) {
    const { doc, selection } = tr;

    if (!doc || !selection) return tr;

    if (!(selection instanceof TextSelection || selection instanceof AllSelection)) {
        return tr;
    }

    const { from, to } = selection;

    doc.nodesBetween(from, to, (node, pos) => {
        const nodeType = node.type;

        if (nodeType.name === 'paragraph' || nodeType.name === 'heading' || nodeType.name === 'blockquote') {
            tr = setNodeIndentMarkup(tr, pos, delta);
            return false;
        } else if (isList(node, tr.doc.type.schema)) {
            return false;
        }
        return true;
    });

    return tr;
}

export const Indent = Extension.create({
    name: "indent",

    addOptions() {
        return {
            types: ["paragraph", "heading", "blockquote"],
            minLevel: 0,
            maxLevel: 8
        }
    },

    addGlobalAttributes() {
        return [
            {
                types: this.options.types,
                attributes: {
                    indent: {
                        default: 0,
                        parseHTML: element => {
                            const level = parseInt(element.getAttribute("data-indent") || "0", 10)
                            return level
                        },
                        renderHTML: attributes => {
                            if (!attributes.indent || attributes.indent === 0) {
                                return {}
                            }
                            return {
                                "data-indent": attributes.indent,
                                style: `margin-left: ${attributes.indent * 2}rem`
                            }
                        }
                    }
                }
            }
        ]
    },

    addCommands() {
        return {
            indent: () => ({ tr, state, dispatch }) => {
                const { selection } = state;
                tr = tr.setSelection(selection);
                tr = updateIndentLevel(tr, 1);

                if (tr.docChanged) {
                    dispatch && dispatch(tr);
                    return true;
                }

                return false;
            },

            outdent: () => ({ tr, state, dispatch }) => {
                const { selection } = state;
                tr = tr.setSelection(selection);
                tr = updateIndentLevel(tr, -1);

                if (tr.docChanged) {
                    dispatch && dispatch(tr);
                    return true;
                }

                return false;
            }
        }
    },

    addKeyboardShortcuts() {
        return {
            Tab: () => this.editor.commands.indent(),
            "Shift-Tab": () => this.editor.commands.outdent()
        }
    }
})