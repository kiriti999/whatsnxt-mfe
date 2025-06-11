import React from 'react';
import { useEditor } from '@tiptap/react';
import { Select } from '@mantine/core';

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
  const fontSizeOptions = [
    { value: '12px', label: '12px' },
    { value: '13px', label: '13px' },
    { value: '14px', label: '14px' },
    { value: '15px', label: '15px' },
    { value: '16px', label: '16px' },
    { value: '17px', label: '17px' },
    { value: '18px', label: '18px' },
    { value: '19px', label: '19px' },
    { value: '20px', label: '20px' },
    { value: '21px', label: '21px' },
    { value: '23px', label: '23px' },
    { value: '24px', label: '24px' },
    { value: '32px', label: '32px' },
  ];

  // Get current font size from editor
  const currentFontSize = React.useMemo(() => {
    if (!editor) return '16px';

    try {
      const textStyle = editor.getAttributes('textStyle');
      const fontSize = textStyle?.fontSize;

      if (fontSize && typeof fontSize === 'string') {
        return fontSize.includes('px') ? fontSize : `${fontSize}px`;
      }
      return '16px';
    } catch (e) {
      console.error('Error getting font size:', e);
      return '16px';
    }
  }, [editor]);

  const handleFontSizeChange = (value: string | null) => {
    console.log('Font size change called with:', value);

    if (!value || !editor) {
      console.log('No value or editor:', { value, editor: !!editor });
      return;
    }

    try {
      // Make sure we have a string and not undefined/null
      const valueStr = String(value);
      const fontSize = valueStr.replace('px', '');

      console.log('Setting font size to:', fontSize);

      if (fontSize) {
        editor.chain().focus().setFontSize(fontSize).run();
      }
    } catch (e) {
      console.error('Error setting font size:', e);
    }
  };

  return (
    <Select
      value={currentFontSize}
      onChange={handleFontSizeChange}
      data={fontSizeOptions}
      placeholder="Font size"
      aria-label="Font Size"
      size="xs"
      styles={(theme) => ({
        input: {
          width: '70px',
          minWidth: '70px',
          padding: '0 8px',
        },
        rightSection: {
          pointerEvents: 'none',
        },
      })}
      allowDeselect={false}
      comboboxProps={{ width: 'auto', position: 'bottom' }}
    />
  );
};

export default FontSizeSelector;