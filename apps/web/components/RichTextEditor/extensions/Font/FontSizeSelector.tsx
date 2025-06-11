import React from 'react';
import { useEditor } from '@tiptap/react';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    fontSize: {
      /**
       * Set the font size
       */
      setFontSize: (size: string) => ReturnType;
      /**
       * Unset the font size
       */
      unsetFontSize: () => ReturnType;
    };
  }
}

interface FontSizeSelectorProps {
  editor: ReturnType<typeof useEditor> | null;
}

export const FontSizeSelector: React.FC<FontSizeSelectorProps> = ({ editor }) => {
  const handleFontSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const fontSize = e.target.value.replace('px', '');

    if (editor) {
      editor.chain().focus().setFontSize(fontSize).run();
    }
  };

  return (
    <select
      // Note: Had to add inline styles as styles from css modules are not working
      style={{
        fontSize: '12px',
        padding: '2px 0px',
        height: '25.2px',
        width: 'auto',
        border: '1px solid #ccc',
        borderRadius: '4px',
        cursor: 'pointer'
      }}
      onChange={handleFontSizeChange}
      defaultValue="16px"
      aria-label="Font Size"
    >
      <option value="12px">12</option>
      <option value="14px">14</option>
      <option value="16px">16</option>
      <option value="18px">18</option>
      <option value="24px">24</option>
      <option value="32px">32</option>
    </select>
  );
};

export default FontSizeSelector;
