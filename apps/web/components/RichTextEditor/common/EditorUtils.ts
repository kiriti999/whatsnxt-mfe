

export const replaceImageLinksOnContentPreview = async ({ file, timestamp, editor, tempUrl, imageUrl, setProgress }) => {
    // replace cloudinary links on content 
    const { state } = editor.view;
    const { doc, tr } = state;
    // this below code will replace temporary created url with new cloudinary link on editor 
    doc.descendants((node: { attrs: { src: any; }; }, position: any) => {
        if (node.attrs.src === tempUrl) {
            tr.setNodeMarkup(position, undefined, { ...node.attrs, src: imageUrl });
        }
    });

    await editor.view.dispatch(tr);

    // after the successful replacement of asset on editor will close a progress bar
    await setProgress({ fileName: file?.name, timestamp: timestamp, progress: 100, isCompleted: true })
}

export const removeTempImageFromEditor = ({ editor, tempUrl }) => {
    // remove temporary image from editor
    const { state } = editor.view;
    const { doc, tr } = state;
    // this code remove image from the editor that match with tempUrl
    doc.descendants((node: { attrs: { src: any; }; nodeSize: any; }, position: any) => {
        if (node.attrs.src === tempUrl) {
            tr.delete(position, position + node.nodeSize);
        }
    });

    editor.view.dispatch(tr);
}