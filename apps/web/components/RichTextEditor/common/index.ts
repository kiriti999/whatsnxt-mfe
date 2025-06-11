import { manageWorker } from '../../../utils/worker/manageWorker';
import { addUploadedAsset, removeAllUploadedAsset } from '../../../utils/worker/workerWithLocalStorage';
import { notifications } from '@mantine/notifications';

const replaceImageLinksOnContentPreview = async ({ file, timestamp, editor, tempUrl, imageUrl, setProgress }) => {
    // replace cloudinary links on content 
    const { state } = editor.view;
    const { doc, tr } = state;
    // this below code will replace temporary created url with new cloudinary link on editor 
    doc.descendants((node, position) => {
        if (node.attrs.src === tempUrl) {
            tr.setNodeMarkup(position, undefined, { ...node.attrs, src: imageUrl });
        }
    });

    await editor.view.dispatch(tr);

    // after the successful replacement of asset on editor will close a progress bar
    await setProgress({ fileName: file?.name, timestamp, progress: 100, isCompleted: true })
}

const removeTempImageFromEditor = ({ editor, tempUrl }) => {
    // remove temporary image from editor
    const { state } = editor.view;
    const { doc, tr } = state;
    // this code remove image from the editor that match with tempUrl
    doc.descendants((node, position) => {
        if (node.attrs.src === tempUrl) {
            tr.delete(position, position + node.nodeSize);
        }
    });

    editor.view.dispatch(tr);
}

export const uploadEditorDataWebWorker = async ({ file, tempUrl, editor, courseId, type, setProgress }) => {
    // create a new worker with upload worker script 
    const worker = new Worker(new URL('../../../utils/worker/uploadWorker', import.meta.url));
    // upload assets using webworker
    try {
        const result = await manageWorker(worker, {
            file,
            fileKeyName: 'file',
            folder: courseId,
            type,
        }, setProgress) as {
            secure_url: string; public_id: string; timestamp: number; resource_type: string
        };


        if (result) {
            const imageUrl = result?.secure_url;
            if (result?.public_id) {
                // save public id with type to local storage
                addUploadedAsset(result.public_id, result.resource_type)
            }

            // replace uploaded new cloudinary link on editor 
            replaceImageLinksOnContentPreview({ setProgress, timestamp: result?.timestamp, file, tempUrl, imageUrl, editor })
        }
    } catch (error) {
        removeTempImageFromEditor({ editor, tempUrl });
        notifications.show({
            position: 'bottom-left',
            title: 'Upload Failed error',
            message: 'Asset failed to upload',
            color: 'red'
        });
    }
}

export const deleteDataWebWorker = async ({ assetsList }) => {
    // create a new worker with upload worker script 
    const worker = new Worker(new URL('../../../utils/worker/deleteWorker', import.meta.url));
    // delete assets using webworker
    try {

        await manageWorker(worker, {
            assetsList
        })
        await removeAllUploadedAsset()

    } catch (error) {
        console.log(error)
    }

}

export const extractCloudinaryLinksFromContent = (content: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const links: string[] = [];

    const elements = doc.querySelectorAll('img, audio, video, a'); // Adjust the selectors based on the tags used for audio, video, and files

    elements.forEach(el => {
        const src = el.getAttribute('src');
        const href = el.getAttribute('href');
        if (src && src.includes('cloudinary')) {
            links.push(src);
        }
        if (href && href.includes('cloudinary')) {
            links.push(href);
        }
    });

    return links;
};

export const extractPublicIdsFromLinks = (links: string[]) => {
    return links.map(link => {
        // Split the URL by slashes and get the second last part
        const parts = link.split('/');
        const lastPart = parts.slice(-2).join('/');

        // Remove the file extension from the last part
        return lastPart.split('.')[0]; // Join the parts back together with '/'
    });
};

const mediaTypes = ['image', 'video', 'raw'];

export const extractPublicIdsAndTypeFromLinks = (links) => {
    return links.map(link => {
        const parts = link.split('/');
        const lastPart = parts.slice(-2).join('/');
        const publicId = lastPart.split('.')[0]; // Join the parts back together with '/'
        const type = parts.find(part => mediaTypes.includes(part)) || 'image'; // Get the type (e.g., video, image)

        return {
            publicId,
            type
        };
    });
};
