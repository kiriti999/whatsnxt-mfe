import { useContext, useRef } from 'react';
import { TiptapManageContext } from '../../../../context/TiptapManageContext';
import { uploadEditorDataWebWorker } from '../../common';
import { IconPhoto } from '@tabler/icons-react';
import { Button } from '@mantine/core';

// Custom Image button component
const ImageControl = ({ editor }: any) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { courseId, updateProgress } = useContext(TiptapManageContext);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // Reset the target value so it allows adding the same files
    event.target.value = '';

    if (file) {
      const tempUrl = URL.createObjectURL(file);
      editor.chain().focus().setImage({ src: tempUrl }).run();
      uploadEditorDataWebWorker({
        file,
        tempUrl,
        editor,
        courseId,
        type: 'image',
        setProgress: updateProgress,
      });
    }
  };

  return (
    <>
      {/* Hidden file input */}
      <input
        type="file"
        hidden
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
      />

      {/* Styled button */}
      <Button size='xs'
        type='button'
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
        title="Add Image"
      >
        <IconPhoto size={20} />
      </Button>
    </>
  );
};

export default ImageControl;
