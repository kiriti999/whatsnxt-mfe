const mediaTypes = ['image', 'video', 'raw'];

// Keep all your existing utility functions unchanged
export const extractCloudinaryLinksFromContent = (content: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const links: string[] = [];

    const elements = doc.querySelectorAll('img, audio, video, a');

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
        const parts = link.split('/');
        const lastPart = parts.slice(-2).join('/');
        // Remove duplicate extension if it exists
        // "Design%20Patterns.webp.webp" -> "Design%20Patterns.webp"
        // "Design%20Patterns.webp" -> "Design%20Patterns.webp" (unchanged)
        const public_id = lastPart.replace(/(\.\w+)\1$/, '$1');
        return decodeURIComponent(public_id);
    });
};

export const extractPublicIdsAndTypeFromLinks = (links: any[]) => {
    return links.map((link: string) => {
        const parts = link.split('/');

        // Extract the folder and filename (last 2 parts after domain/upload/version)
        const lastPart = parts.slice(-2).join('/');

        // Remove duplicate extension if it exists
        // "Design%20Patterns.webp.webp" -> "Design%20Patterns.webp"
        // "Design%20Patterns.webp" -> "Design%20Patterns.webp" (unchanged)
        const public_id = lastPart.replace(/(\.\w+)\1$/, '$1');

        const resource_type = parts.find((part: string) => mediaTypes.includes(part)) || 'image';

        return {
            public_id,
            resource_type
        };
    });
};

export const cloudinaryAssetsUploadCleanup = ({ content }: any) => {
    const cloudinaryLinksFromContent = extractCloudinaryLinksFromContent(content);
    const usedPublicIdsInEditor = extractPublicIdsFromLinks([...cloudinaryLinksFromContent]);
    console.log(' cloudinaryAssetsUploadCleanup :: usedPublicIdsInEditor:', usedPublicIdsInEditor)

    import('../../../utils/worker/localStorageHandler').then(({ removeAssetFromLocalStoragesList }) => {
        const success = removeAssetFromLocalStoragesList(usedPublicIdsInEditor);
        if (!success) {
            console.warn('Failed to remove uploaded assets from localStorage');
        }
    }).catch((error) => {
        console.error('Error importing localStorage utilities:', error);
    });

    return cloudinaryLinksFromContent ? extractPublicIdsAndTypeFromLinks([...cloudinaryLinksFromContent]) : []
}

export const cloudinaryAssetsUploadCleanupForUpdate = ({ oldContent, newContent }: any) => {
    const cloudinaryLinksNew = newContent ? extractCloudinaryLinksFromContent(newContent) : null;
    const cloudinaryLinksPrev = oldContent ? extractCloudinaryLinksFromContent(oldContent) : null;

    const usedPublicIdsInNewEditor = cloudinaryLinksNew ? extractPublicIdsFromLinks([...cloudinaryLinksNew]) : [];
    const usedPublicIdsInPrevEditor = cloudinaryLinksPrev ? extractPublicIdsAndTypeFromLinks([...cloudinaryLinksPrev]) : [];

    import('../../../utils/worker/localStorageHandler').then(({ removeAssetFromLocalStoragesList, updateAssetOnLocalStorage }) => {
        removeAssetFromLocalStoragesList(usedPublicIdsInNewEditor);

        // get the public IDs that are in the old editor but not in the updated editor
        const publicIdsNotInUpdatedEditor = usedPublicIdsInPrevEditor.filter(({ public_id }) => !usedPublicIdsInNewEditor.includes(public_id));
        // store it to on local storage so on cleanup it will be removed
        updateAssetOnLocalStorage(publicIdsNotInUpdatedEditor);
    });

    return cloudinaryLinksNew ? extractPublicIdsAndTypeFromLinks([...cloudinaryLinksNew]) : []
}