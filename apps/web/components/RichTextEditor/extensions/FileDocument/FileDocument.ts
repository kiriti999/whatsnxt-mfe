import { Node, CommandProps } from "@tiptap/core";

declare module "@tiptap/core" {
    interface Commands<ReturnType> {
        file: {
            setFile: (options: { src: string, name: string }) => ReturnType;
        };
    }
}

const getFileEmbed = (fileName: string, src: string) => {
    const anchor = document.createElement('a');
    anchor.href = src;
    anchor.target = '_blank';
    anchor.textContent = fileName || 'Download File';
    anchor.classList.add('file-attachment');
    return anchor;
};

export const FileDocument = Node.create({
    name: "file",

    group: "block",

    selectable: true,

    draggable: true,

    addAttributes() {
        return {
            src: {
                default: null,
            },
            name: {
                default: "file",
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: "div[data-type='file']",
                getAttrs: (dom) => {
                    const aTag = dom.querySelector('a');
                    if (aTag) {
                        const href = aTag.getAttribute('href');
                        const name = aTag.textContent;
                        return {
                            src: href,
                            name: name,
                        };
                    }
                    return {};
                },
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return [
            "div",
            { class: "file-wrapper", "data-type": "file" },
            [
                "a",
                {
                    href: HTMLAttributes.src,
                    class: "file-attachment",
                },
                HTMLAttributes.name || 'Download File'
            ],
        ];
    },

    addNodeView() {
        return ({ node }) => {
            const wrapper = document.createElement("div");
            wrapper.classList.add("file-wrapper");
            wrapper.dataset.type = "file";

            const content = getFileEmbed(node.attrs.name, node.attrs.src);
            wrapper.appendChild(content);

            return {
                dom: wrapper,
                contentDOM: wrapper,
                update: (updatedNode) => {
                    // Check if this is the same node type
                    if (updatedNode.type !== node.type) {
                        return false;
                    }

                    // Check if attributes have changed
                    if (updatedNode.attrs.src !== node.attrs.src || updatedNode.attrs.name !== node.attrs.name) {
                        // Update the DOM
                        while (wrapper.firstChild) {
                            wrapper.removeChild(wrapper.firstChild);
                        }
                        const updatedContent = getFileEmbed(updatedNode.attrs.name, updatedNode.attrs.src);
                        wrapper.appendChild(updatedContent);
                    }

                    // Return true to indicate the update was successful
                    return true;
                },
            };
        };
    },

    addCommands() {
        return {
            setFile:
                ({ src, name }: { src: string, name: string }) =>
                    ({ commands }: CommandProps) => {
                        return commands.insertContent({
                            type: this.name,
                            attrs: { src, name },
                        });
                    },
        };
    },
});