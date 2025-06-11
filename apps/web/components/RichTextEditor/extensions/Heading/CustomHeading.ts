import { TextSelection } from "prosemirror-state";

export const toggleCustomHeading = (level: any, editor: any) => {
    if (editor) {
      const { state, dispatch } = editor.view;
      const { from, to } = state.selection;

      if (from !== to) {
        // If text is selected, apply heading
        editor.chain().focus().toggleHeading({ level }).run();
      } else {
        // If no text is selected, ensure cursor selection is handled
        const textSelection = TextSelection.create(state.doc, from);
        dispatch(state.tr.setSelection(textSelection));
        editor.chain().focus().toggleHeading({ level }).run();
      }
    }
  };