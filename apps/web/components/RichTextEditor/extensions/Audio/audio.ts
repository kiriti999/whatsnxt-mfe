import { Node, mergeAttributes, CommandProps } from "@tiptap/core";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    audio: {
      setAudio: (options: { src: string }) => ReturnType;
    };
  }
}

export const Audio = Node.create({
  name: "audio",

  group: "block",

  selectable: true,

  draggable: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "audio",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      { class: "audio-wrapper" },
      ["audio", mergeAttributes(HTMLAttributes, { controls: true })],
    ];
  },

  // @ts-ignore
  addNodeView() {
    return ({ node, getPos, editor }) => {
      const wrapper = document.createElement("div");
      wrapper.classList.add("audio-wrapper");
      wrapper.style.position = "relative";

      const audio = document.createElement("audio");
      audio.src = node.attrs.src;
      audio.controls = true;

      wrapper.appendChild(audio);

      return {
        dom: wrapper,
        contentDOM: audio,
        update: (updatedNode) => {
          if (updatedNode.attrs.src !== node.attrs.src) {
            audio.src = updatedNode.attrs.src;
          }
        },
      };
    };
  },

  addCommands() {
    return {
      setAudio:
        ({ src }: { src: string }) =>
          ({ commands }: CommandProps) => {
            return commands.insertContent({
              type: this.name,
              attrs: { src },
            });
          },
    };
  },
});
