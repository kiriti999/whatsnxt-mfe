export const getUploadedAssets = () => {
    const storedAssets = localStorage.getItem('uploadedAssets');
    return storedAssets ? JSON.parse(storedAssets) : [];
};

export const addUploadedAsset = (publicId, type) => {
    const storedAssets = getUploadedAssets();
    storedAssets.push({ publicId, type });
    localStorage.setItem('uploadedAssets', JSON.stringify(storedAssets));
};

export const updateUploadedAssets = (assetsArray) => {
    const storedAssets = getUploadedAssets();
    const newAssets = [...storedAssets, ...assetsArray];
    localStorage.setItem('uploadedAssets', JSON.stringify(newAssets));
};


const removeUploadedAsset = (publicId) => {
    let storedAssets = getUploadedAssets();
    storedAssets = storedAssets.filter(asset => asset.publicId !== publicId);
    localStorage.setItem('uploadedAssets', JSON.stringify(storedAssets));
};


export const removeUploadedAssetsList = (publicIdsToRemove) => {
    let storedAssets = getUploadedAssets();
    storedAssets = storedAssets.filter(asset => !publicIdsToRemove.includes(asset.publicId));
    localStorage.setItem('uploadedAssets', JSON.stringify(storedAssets));
};


export const removeAllUploadedAsset = () => {
    localStorage.removeItem('uploadedAssets')
};