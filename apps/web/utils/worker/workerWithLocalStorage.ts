interface AssetItem {
    publicId: string;
    type: string;
}

export const getUploadedAssets = (): AssetItem[] => {
    try {
        const storedAssets = localStorage.getItem('uploadedAssets');
        return storedAssets ? JSON.parse(storedAssets) : [];
    } catch (error) {
        console.error('Error getting uploaded assets from localStorage:', error);
        return [];
    }
};

export const addUploadedAsset = (publicId: string, type: string): boolean => {
    try {
        const storedAssets = getUploadedAssets();
        storedAssets.push({ publicId, type });
        localStorage.setItem('uploadedAssets', JSON.stringify(storedAssets));
        return true;
    } catch (error) {
        console.error('Error adding uploaded asset to localStorage:', error);
        return false;
    }
};

export const updateUploadedAssets = (assetsArray: AssetItem[]): boolean => {
    try {
        const storedAssets = getUploadedAssets();
        const newAssets = [...storedAssets, ...assetsArray];
        localStorage.setItem('uploadedAssets', JSON.stringify(newAssets));
        return true;
    } catch (error) {
        console.error('Error updating uploaded assets in localStorage:', error);
        return false;
    }
};

const removeUploadedAsset = (publicId: string): boolean => {
    try {
        let storedAssets = getUploadedAssets();
        storedAssets = storedAssets.filter(asset => asset.publicId !== publicId);
        localStorage.setItem('uploadedAssets', JSON.stringify(storedAssets));
        return true;
    } catch (error) {
        console.error('Error removing uploaded asset from localStorage:', error);
        return false;
    }
};

export const removeUploadedAssetsList = (publicIdsToRemove: string[]): boolean => {
    try {
        let storedAssets = getUploadedAssets();
        storedAssets = storedAssets.filter(asset => !publicIdsToRemove.includes(asset.publicId));
        localStorage.setItem('uploadedAssets', JSON.stringify(storedAssets));
        return true;
    } catch (error) {
        console.error('Error removing uploaded assets list from localStorage:', error);
        return false;
    }
};

export const removeAllUploadedAsset = (): boolean => {
    try {
        localStorage.removeItem('uploadedAssets');
        return true;
    } catch (error) {
        console.error('Error removing all uploaded assets from localStorage:', error);
        return false;
    }
};