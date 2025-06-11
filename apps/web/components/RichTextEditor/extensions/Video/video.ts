import { Node, mergeAttributes, CommandProps } from "@tiptap/core";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    video: {
      setVideo: (options: {
        src: string;
        width?: string;
        height?: string;
      }) => ReturnType;
    };
  }
}

export const Video = Node.create({
  name: "video",

  group: "block",

  selectable: true,

  draggable: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      width: {
        default: "100%",
      },
      height: {
        default: "auto",
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "video",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      { class: "video-wrapper" },
      ["video", mergeAttributes(HTMLAttributes, { controls: true })],
    ];
  },

  // @ts-ignore
  addNodeView() {
    return ({ node, getPos, editor }) => {
      const wrapper = document.createElement("div");
      wrapper.classList.add("video-wrapper");
      wrapper.style.position = "relative";

      const video = document.createElement("video");
      video.src = node.attrs.src;
      video.controls = true;
      video.style.width = node.attrs.width;
      video.style.height = node.attrs.height;

      const resizeHandle = document.createElement("div");
      resizeHandle.contentEditable = "false";
      resizeHandle.style.position = "absolute";
      resizeHandle.style.right = "0";
      resizeHandle.style.bottom = "0";
      resizeHandle.style.width = "10px";
      resizeHandle.style.height = "10px";
      resizeHandle.style.backgroundColor = "blue";
      resizeHandle.style.cursor = "nwse-resize";

      let startX: number,
        startY: number,
        startWidth: number,
        startHeight: number;

      const onMouseDown = (event: MouseEvent) => {
        startX = event.clientX;
        startY = event.clientY;
        startWidth = parseInt(
          document.defaultView?.getComputedStyle(video).width || "0",
          10
        );
        startHeight = parseInt(
          document.defaultView?.getComputedStyle(video).height || "0",
          10
        );
        document.documentElement.addEventListener("mousemove", onMouseMove);
        document.documentElement.addEventListener("mouseup", onMouseUp);
      };

      const onMouseMove = (event: MouseEvent) => {
        const width = startWidth + event.clientX - startX;
        const height = startHeight + event.clientY - startY;
        video.style.width = `${width}px`;
        video.style.height = `${height}px`;
      };

      const onMouseUp = () => {
        document.documentElement.removeEventListener("mousemove", onMouseMove);
        document.documentElement.removeEventListener("mouseup", onMouseUp);
        if (typeof getPos === "function") {
          const pos = getPos() as number;
          if (pos !== undefined) {
            editor
              .chain()
              .focus()
              .updateAttributes("video", {
                width: video.style.width,
                height: video.style.height,
              })
              .run();
          }
        }
      };

      resizeHandle.addEventListener("mousedown", onMouseDown);

      wrapper.appendChild(video);
      wrapper.appendChild(resizeHandle);

      return {
        dom: wrapper,
        contentDOM: video,
        update: (updatedNode) => {
          if (updatedNode.attrs.src !== node.attrs.src) {
            video.src = updatedNode.attrs.src;
          }
          if (updatedNode.attrs.width !== node.attrs.width) {
            video.style.width = updatedNode.attrs.width;
          }
          if (updatedNode.attrs.height !== node.attrs.height) {
            video.style.height = updatedNode.attrs.height;
          }
        },
      };
    };
  },

  addCommands() {
    return {
      setVideo:
        ({
          src,
          width,
          height,
        }: {
          src: string;
          width?: string;
          height?: string;
        }) =>
          ({ commands }: CommandProps) => {
            return commands.insertContent({
              type: this.name,
              attrs: { src, width, height },
            });
          },
    };
  },
});
