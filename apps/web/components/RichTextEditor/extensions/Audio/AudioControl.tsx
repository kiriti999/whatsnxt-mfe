
import { useContext, useRef } from "react";
import styles from "../../Tiptap/Tiptap.module.css";
import { IconVolume } from '@tabler/icons-react';
import { TiptapManageContext } from '../../../../context/TiptapManageContext';
import { Button } from '@mantine/core';
import { unifiedUploadWebWorker } from '../../../../utils/worker/assetManager';

// Custom Audio button component
const AudioControl = ({ editor }: { editor: any }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { courseId, updateProgress } = useContext(TiptapManageContext)

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        // for reset the target value , so it could allow to add same files 
        event.target.value = ""

        if (file) {
            const tempUrl = URL.createObjectURL(file);
            editor.chain().focus().setAudio({ src: tempUrl }).run();
            await unifiedUploadWebWorker({ file, tempUrl, editor, folder: courseId, resource_type: "auto", setProgress: updateProgress })
        }
    };


    return (
        <>
            <input
                type="file"
                hidden
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="audio/*"
            />
            <Button
                size='xs'
                variant='outline'
                type="button"
                className={styles.richTextEditorControl}
                onClick={() => fileInputRef.current?.click()}
                title="Add Audio"
            >
                <IconVolume size={20} />
            </Button>
        </>
    );
};

export default AudioControl