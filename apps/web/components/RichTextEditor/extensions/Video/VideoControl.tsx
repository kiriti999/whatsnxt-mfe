import { useContext, useRef } from "react";
import { IconPhoto, IconVideo } from '@tabler/icons-react';
import styles from "../../Tiptap/Tiptap.module.css";
import { uploadEditorDataWebWorker } from '../../common';
import { TiptapManageContext } from '../../../../context/TiptapManageContext';
import { Button } from '@mantine/core';


// Custom Video button component
const VideoControl = ({ editor }: { editor: any }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { courseId, updateProgress } = useContext(TiptapManageContext)

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        // for reset the target value , so it could allow to add same files 
        event.target.value = ""

        if (file) {
            const tempUrl = URL.createObjectURL(file);
            editor.chain().focus().setVideo({ src: tempUrl }).run();
            uploadEditorDataWebWorker({ file, tempUrl, editor, courseId, type: "video", setProgress: updateProgress })
        }
    };

    return (
        <>
            <input
                type="file"
                hidden
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="video/*"
            />
            <Button size='xs'
                type="button"
                variant="outline"
                className={styles.richTextEditorControl}
                onClick={() => fileInputRef.current?.click()}
                title="Add Video"
            >
                <IconVideo size={20} />
            </Button>
        </>
    );
};

export default VideoControl


