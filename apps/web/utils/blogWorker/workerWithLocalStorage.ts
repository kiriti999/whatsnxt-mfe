export const getUploadedAssets = (): { publicId: string, type: string }[] => {
    const storedAssets = localStorage.getItem('cloudinaryAssets');
    return storedAssets ? JSON.parse(storedAssets) : [];
};

export const addUploadedAsset = (publicId: string, type: string) => {
    const storedAssets = getUploadedAssets();
    storedAssets.push({ publicId: publicId, type });
    localStorage.setItem('cloudinaryAssets', JSON.stringify(storedAssets));
};

export const updateUploadedAssets = (assetsArray: { publicId: string, type: string }[]) => {
    const storedAssets = getUploadedAssets();
    const newAssets = [...storedAssets, ...assetsArray];
    localStorage.setItem('cloudinaryAssets', JSON.stringify(newAssets));
};


const removeUploadedAsset = (publicId: string) => {
    let storedAssets = getUploadedAssets();
    storedAssets = storedAssets.filter(asset => asset.publicId !== publicId);
    localStorage.setItem('cloudinaryAssets', JSON.stringify(storedAssets));
};


export const removeUploadedAssetsList = (publicIdsToRemove: string[]) => {
    let storedAssets = getUploadedAssets();
    storedAssets = storedAssets.filter(asset => !publicIdsToRemove.includes(asset.publicId));
    localStorage.setItem('cloudinaryAssets', JSON.stringify(storedAssets));
};


export const removeAllUploadedAsset = () => {
    localStorage.removeItem('cloudinaryAssets')
};