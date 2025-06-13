import { useContext, useRef } from 'react';
import { IconFilePlus } from '@tabler/icons-react';
import styles from '../../Tiptap/Tiptap.module.css';
import { TiptapManageContext } from '../../../../context/TiptapManageContext';
import { uploadDataWebWorker } from '../../common/index';

const FileControl = ({ editor }: { editor: any }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { updateProgress, userId } = useContext(TiptapManageContext)

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        // for reset the target value , so it could allow to add same files 
        event.target.value = ''

        if (file) {
            const fileName = file.name;
            const tempUrl = URL.createObjectURL(file);
            editor.chain().focus().setFile({ src: tempUrl, name: fileName }).run();
            uploadDataWebWorker({ file, tempUrl, editor, folder: userId, type: 'raw', setProgress: updateProgress })
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
            <button
                type="button"
                className={styles.richTextIcons}
                onClick={() => fileInputRef.current?.click()}
                title="Add File"
            >
                <IconFilePlus size={16} />
            </button>
        </>
    );
};

export default FileControl