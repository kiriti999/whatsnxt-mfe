import { useContext, useRef } from "react";
import { IconFile } from '@tabler/icons-react';
import { TiptapManageContext } from '../../../../context/TiptapManageContext';
import { uploadEditorDataWebWorker } from '../../common';
import { Button } from '@mantine/core';

const FileControl = ({ editor }: { editor: any }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { courseId, updateProgress } = useContext(TiptapManageContext)

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        const fileName = file.name;
        // for reset the target value , so it could allow to add same files 
        event.target.value = ""

        if (file) {
            const tempUrl = URL.createObjectURL(file);
            editor.chain().focus().setFile({ src: tempUrl, name: fileName }).run();
            uploadEditorDataWebWorker({ file, tempUrl, editor, courseId, type: "auto", setProgress: updateProgress })
        }
    };

    return (
        <>
            <input
                type="file"
                hidden
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".doc,.docx,.pdf,.ppt,.pptx,.xls,.xlsx" // Update accept attribute as needed
            />
            <Button size='xs'
                variant='outline'
                type="button"
                className="richTextEditorControl" // Replace with your styles
                onClick={() => fileInputRef.current?.click()}
                title="Add File"
            >
                <IconFile size={20} /> {/* Replace with your file icon */}
            </Button>
        </>
    );
};

export default FileControl

